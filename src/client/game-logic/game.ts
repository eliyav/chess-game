import { GAMESTATUS, Move, PIECE, Point, TurnHistory } from "../../shared/game";
import GamePiece from "./game-piece";
import { TEAM } from "../../shared/match";
import Board from "./board";
import { doPointsMatch, getPieceMoves, isEnPassantAvailable } from "./helpers";

class Game {
  teams: TEAM[];
  current: {
    board: Board;
    annotations: string[];
    turnHistory: TurnHistory[];
    status: GAMESTATUS;
  };

  constructor() {
    this.teams = [TEAM.WHITE, TEAM.BLACK];
    this.current = this.createGame();
  }

  private createGame() {
    return {
      board: new Board(),
      annotations: [],
      turnHistory: [],
      status: GAMESTATUS.PLAYING,
    };
  }

  public getCurrentTeam() {
    const remainder = this.getTurn() % 2;
    const index = remainder ? 0 : 1;
    return this.teams[index];
  }

  public getCurrentTeamsOpponent() {
    const remainder = this.getTurn() % 2;
    const index = remainder ? 1 : 0;
    return this.teams[index];
  }

  public getGameState() {
    return this.current;
  }

  private nextTurn() {
    if (this.isCheckmate()) {
      this.current.status = GAMESTATUS.CHECKMATE;
    }
  }

  public getTurn() {
    return this.current.turnHistory.length + 1;
  }

  public move({ origin, target }: { origin: Point; target: Point }) {
    if (this.current.status === GAMESTATUS.CHECKMATE) return;
    const move = this.findMove({ origin, target });
    if (!move) return;
    const resolved = this.resolveBoard({
      origin,
      move,
      board: this.current.board,
    });
    if (!resolved) return;
    this.annotate(resolved);
    this.nextTurn();
    return resolved;
  }

  private resolveBoard({
    origin,
    move,
    board,
    dontUpdatePiece = false,
  }: {
    origin: Point;
    move: Move;
    board: Board;
    dontUpdatePiece?: boolean;
  }) {
    const [target, moveType] = move;
    const originPiece = board.getPiece(origin)!;
    if (!dontUpdatePiece) originPiece.update();
    if (moveType === "movement") {
      return this.resolveMovement({ origin, move, board });
    } else if (moveType === "capture") {
      return this.resolveCapture({ origin, move, board });
    } else if (moveType === "enPassant") {
      return this.resolveEnPassant({ origin, move, board });
    } else if (moveType === "castle") {
      const targetPiece = board.getPiece(target);
      if (!dontUpdatePiece) targetPiece?.update();
      return this.resolveCastling({ origin, move, board });
    }
  }

  private resolveMovement({
    origin,
    move,
    board,
  }: {
    origin: Point;
    move: Move;
    board: Board;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece(origin);
    if (!originPiece) return;
    board.addPiece({ point: target, piece: originPiece });
    board.removePiece({ point: origin });
    const promotion = this.checkPromotion({
      piece: originPiece,
      point: target,
    });
    if (promotion) {
      this.setPromotionPiece({
        target,
        originPiece,
        selection: PIECE.Q,
        board,
      });
    }
    const isOpponentInCheck =
      this.isChecked(this.getCurrentTeamsOpponent(), this.current.board) !==
      undefined;
    return {
      type: "movement",
      origin,
      target,
      promotion,
      isOpponentInCheck,
    };
  }

  private resolveCapture({
    origin,
    move,
    board,
  }: {
    origin: Point;
    move: Move;
    board: Board;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece(origin);
    const targetPiece = this.lookupPiece(target);
    if (!originPiece || !targetPiece) return;
    board.addPiece({ point: target, piece: originPiece });
    board.removePiece({ point: origin });
    const promotion = this.checkPromotion({
      piece: originPiece,
      point: target,
    });
    if (promotion) {
      this.setPromotionPiece({
        target,
        originPiece,
        selection: PIECE.Q,
        board,
      });
    }
    const isOpponentInCheck =
      this.isChecked(this.getCurrentTeamsOpponent(), this.current.board) !==
      undefined;
    return {
      type: "capture",
      origin,
      target,
      promotion,
      isOpponentInCheck,
      capturedPiece: targetPiece,
    };
  }

  private resolveEnPassant({
    origin,
    move,
    board,
  }: {
    origin: Point;
    move: Move;
    board: Board;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece(origin);
    if (!originPiece) return;
    const lastTurnHistory = this.current.turnHistory.at(-1);
    if (!lastTurnHistory) return;
    const enPassant = isEnPassantAvailable(lastTurnHistory, board);
    if (enPassant) {
      board.addPiece({ point: target, piece: originPiece });
      board.removePiece({ point: origin });
      board.removePiece({ point: enPassant.capturedPiecePoint });
      const isOpponentInCheck =
        this.isChecked(this.getCurrentTeamsOpponent(), this.current.board) !==
        undefined;
      return {
        type: "enPassant",
        origin,
        target,
        isOpponentInCheck,
        enPassant,
      };
    }
  }

  private resolveCastling({
    origin,
    move,
    board,
  }: {
    origin: Point;
    move: Move;
    board: Board;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece(origin);
    const targetPiece = this.lookupPiece(target);
    if (!originPiece || !targetPiece) return;
    const [originX, OriginY] = origin;
    const [targetX] = target;
    const c = originX - targetX;
    const direction = c < 0 ? 1 : -1;
    const newKingPoint: Point = [originX + direction * 2, OriginY];
    const newRookPoint: Point = [originX + direction, OriginY];
    board.addPiece({ point: newKingPoint, piece: originPiece });
    board.addPiece({ point: newRookPoint, piece: targetPiece });
    board.removePiece({ point: origin });
    board.removePiece({ point: target });
    const isOpponentInCheck =
      this.isChecked(this.getCurrentTeamsOpponent(), this.current.board) !==
      undefined;
    return {
      type: "castle",
      origin,
      target,
      castling: {
        direction,
        kingTarget: newKingPoint,
        rookTarget: newRookPoint,
      },
      isOpponentInCheck,
    };
  }

  public undoTurn() {
    const lastTurn = this.current.turnHistory.at(-1);
    if (lastTurn) {
      if (lastTurn.type === "movement") {
        const { origin, target } = lastTurn;
        this.current.board.addPiece({
          point: origin,
          piece: this.current.board.getPiece(target)!,
        });
        this.current.board.removePiece({ point: target });
      } else if (lastTurn.type === "capture") {
        const { origin, target, capturedPiece } = lastTurn;
        this.current.board.addPiece({
          point: origin,
          piece: this.current.board.getPiece(target)!,
        });
        this.current.board.addPiece({
          point: target,
          piece: new GamePiece(capturedPiece),
        });
      } else if (lastTurn.type === "enPassant") {
        const { origin, target, enPassant } = lastTurn;
        this.current.board.addPiece({
          point: origin,
          piece: this.current.board.getPiece(target)!,
        });
        this.current.board.addPiece({
          point: enPassant.capturedPiecePoint,
          piece: new GamePiece(enPassant.capturedPiece),
        });
        this.current.board.removePiece({ point: enPassant.enPassantPoint });
      } else if (lastTurn.type === "castle") {
        const { origin, target, castling } = lastTurn;
        const { kingTarget, rookTarget } = castling;
        const kingPiece = this.current.board.getPiece(kingTarget)!;
        const rookPiece = this.current.board.getPiece(rookTarget)!;
        kingPiece.resetPieceMovement();
        rookPiece.resetPieceMovement();
        this.current.board.addPiece({ point: origin, piece: kingPiece });
        this.current.board.addPiece({ point: target, piece: rookPiece });
        this.current.board.removePiece({ point: kingTarget });
        this.current.board.removePiece({ point: rookTarget });
      }
      this.current.turnHistory.pop();
      this.current.annotations.pop();
      return true;
    }
    return false;
  }

  public getMoves({
    piece,
    point,
    board,
    skipResolveCheck,
  }: {
    piece: GamePiece | undefined;
    point: Point;
    board: Board;
    skipResolveCheck?: boolean;
  }): Move[] {
    if (!piece) return [];
    const lastTurnHistory = this.current.turnHistory.at(-1);
    const availableMoves = getPieceMoves({
      point,
      piece,
      board,
      lastTurnHistory,
    });
    if (!skipResolveCheck) {
      return availableMoves.filter((move) => {
        return this.canMoveResolve({ origin: point, move });
      });
    } else {
      return availableMoves;
    }
  }

  private findMove({ origin, target }: { origin: Point; target: Point }) {
    const piece = this.lookupPiece(origin);
    if (!piece) return;
    const availableMoves = this.getMoves({
      piece,
      point: origin,
      board: this.current.board,
    });
    const move = availableMoves.find((move) => doPointsMatch(move[0], target));
    return move;
  }

  private canMoveResolve({ origin, move }: { origin: Point; move: Move }) {
    //Clone board to test if move is resolvable without affecting current board
    const board = this.current.board.cloneBoard();
    this.resolveBoard({ origin, move, board, dontUpdatePiece: true });
    //Check if resolving above switch would put player in check
    const isMoveResolvable = this.isChecked(this.getCurrentTeam(), board)
      ? false
      : true;
    return isMoveResolvable;
  }

  public getAllPieces() {
    return this.current.board.getPieces();
  }

  public lookupPiece(point: Point) {
    return this.current.board.getPiece(point);
  }

  private isChecked(team: TEAM, board: Board) {
    const pieces = board.getPieces();
    const king = pieces.find(({ piece }) => {
      return piece?.type === PIECE.K && piece?.team === team;
    })!;
    const opponentsPieces = board.getPieces().filter(({ piece }) => {
      return piece?.team === this.getCurrentTeamsOpponent();
    });
    const opponentsAvailableMoves = opponentsPieces
      .map(({ piece, point }) =>
        this.getMoves({
          piece,
          point,
          board,
          skipResolveCheck: true,
        })
      )
      .flat();
    const isKingChecked = opponentsAvailableMoves.find((move) =>
      doPointsMatch(move[0], king.point)
    );
    //Returns an array with the kings location if checked
    return isKingChecked;
  }

  private isCheckmate() {
    //Find teams current pieces
    const currentPlayerPieces = this.getAllPieces().filter(
      ({ piece }) => piece?.team === this.getCurrentTeam()
    );
    //For each piece, iterate on its available moves
    const anyAvailableMoves = currentPlayerPieces
      .map(({ piece, point }) => {
        return this.getMoves({
          piece,
          point,
          board: this.current.board,
        });
      })
      .flat();
    //If you have available moves, you are not in checkmate so return false
    return anyAvailableMoves.length ? false : true;
  }

  private checkPromotion({ piece, point }: { piece: GamePiece; point: Point }) {
    if (piece.type === PIECE.P && (point[1] === 0 || point[1] === 7)) {
      return true;
    }
    return false;
  }

  private setPromotionPiece({
    target,
    originPiece,
    selection,
    board,
  }: {
    target: Point;
    originPiece: GamePiece;
    selection: PIECE;
    board: Board;
  }) {
    board.removePiece({ point: target });
    const promotedPiece = new GamePiece({
      type: selection,
      team: originPiece.team,
    });
    board.addPiece({ point: target, piece: promotedPiece });
  }

  public resetGame() {
    this.current = this.createGame();
  }

  public getHistory() {
    return this.current.turnHistory;
  }

  private annotate(history: TurnHistory) {
    let annotation;
    const moveType = history.type;
    const promotion = history.promotion;
    const originPiece = this.current.board.getPiece(history.target);
    const opponentInCheck = history.isOpponentInCheck;
    const originSquare = this.current.board.getSquare(history.origin);
    const targetSquare = this.current.board.getSquare(history.target);
    const isCapturing = history.type === "capture";
    const symbol = originPiece?.getSymbol();
    if (moveType === "castle") {
      annotation = history.castling.direction === 1 ? "O-O" : "O-O-O";
    } else if (promotion) {
      //TO DO: Change to Q for now, will need to update to allow for selection
      annotation = `${targetSquare}${"Q"}`;
    } else if (isCapturing) {
      if (originPiece?.type === "Pawn") {
        annotation = `${originSquare.name.charAt(0)}x${targetSquare}`;
      } else {
        annotation = `${symbol}x${targetSquare}`;
      }
    } else {
      annotation = `${symbol}${targetSquare}`;
    }
    if (opponentInCheck) annotation = `${annotation}+`;
    this.current.annotations.push(annotation);
    this.current.turnHistory.push(history);
  }
}

export default Game;
