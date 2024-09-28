import { GAMESTATUS, Move, PIECE, Point, TurnHistory } from "../../shared/game";
import GamePiece from "../../shared/game-piece";
import { TEAM } from "../../shared/match";
import Board, { Grid } from "./board";
import { doPointsMatch, getPieceMoves, isEnPassantAvailable } from "./helpers";

class Game {
  teams: TEAM[];
  current: {
    board: Board;
    annotations: string[];
    turnHistory: TurnHistory[];
    turn: number;
    state: GAMESTATUS;
  };

  constructor() {
    this.teams = [TEAM.WHITE, TEAM.BLACK];
    this.current = this.createGame();
  }

  createGame() {
    return {
      board: new Board(),
      annotations: [],
      turnHistory: [],
      turn: 1,
      state: GAMESTATUS.PLAYING,
    };
  }

  getCurrentTeam() {
    const remainder = this.current.turn % 2;
    const index = remainder ? 0 : 1;
    return this.teams[index];
  }

  getOpponentTeam() {
    const remainder = this.current.turn % 2;
    const index = remainder ? 1 : 0;
    return this.teams[index];
  }

  getState() {
    return this.current.state;
  }

  private nextTurn() {
    this.current.turn++;
    if (this.isCheckmate()) {
      this.current.state = GAMESTATUS.CHECKMATE;
    }
  }

  undoTurn() {
    //#Refactor turn history to be a set of instructions so this can be undone easier and more clear
    const lastTurn = this.current.turnHistory.at(-1);
    // if (lastTurn) {
    //   lastTurn.originPiece.resetPieceMovement();
    //   this.current.board.movePiece({
    //     origin: lastTurn.target,
    //     target: lastTurn.origin,
    //   });
    //   //Undo Promotion
    //   if (lastTurn.type === "movement" || lastTurn.type === "capture") {
    //     if (lastTurn.promote) {
    //       this.current.board.removePiece({ point: lastTurn.target });
    //       this.current.board.addPiece({
    //         point: lastTurn.origin,
    //         piece: lastTurn.originPiece,
    //       });
    //     }
    //   }
    //   if (lastTurn.type === "castle") {
    //     this.current.board.movePiece({
    //       origin: lastTurn.origin,
    //       target: lastTurn.target,
    //       shouldSwitch: true,
    //     });
    //     lastTurn.targetPiece.resetPieceMovement();
    //   } else if (lastTurn.type === "capture" || lastTurn.type === "enPassant") {
    //     this.current.board.addPiece({
    //       point: lastTurn.target,
    //       piece: lastTurn.targetPiece,
    //     });
    //   }
    //   this.current.turnHistory.pop();
    //   this.current.annotations.pop();
    //   this.current.turn--;
    //   return true;
    // }
    return false;
  }

  public move({ origin, target }: { origin: Point; target: Point }) {
    if (this.current.state === GAMESTATUS.CHECKMATE) return;
    const move = this.findMove({ origin, target });
    if (!move) return;
    const resolved = this.resolveMove({ origin, move });
    if (!resolved) return;
    this.annotate(resolved);
    this.current.turnHistory.push(resolved);
    this.nextTurn();
    return resolved;
  }

  resolveMove({ origin, move }: { origin: Point; move: Move }) {
    const [_, moveType] = move;
    switch (moveType) {
      case "movement":
        return this.resolveMovement({ origin, move });
      case "capture":
        return this.resolveCapture({ origin, move });
      case "enPassant":
        return this.resolveEnPassant({ origin, move });
      case "castle":
        return this.resolveCastling({ origin, move });
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

  resolveMovement({
    origin,
    move,
  }: {
    origin: Point;
    move: Move;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece(origin);
    if (!originPiece) return;
    const promotion = this.checkPromotion({
      piece: originPiece,
      point: target,
    });
    if (promotion) {
      this.setPromotionPiece({ target, originPiece, selection: PIECE.Q });
    }
    this.updateBoard({
      origin,
      move,
      board: this.current.board,
    });
    return {
      type: "movement",
      origin,
      target,
      originPiece,
    };
  }

  resolveCapture({
    origin,
    move,
  }: {
    origin: Point;
    move: Move;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece(origin);
    const targetPiece = this.lookupPiece(target);
    if (!originPiece || !targetPiece) return;
    const promotion = this.checkPromotion({
      piece: originPiece,
      point: target,
    });
    if (promotion) {
      this.setPromotionPiece({ target, originPiece, selection: PIECE.Q });
    }
    this.updateBoard({
      origin,
      move,
      board: this.current.board,
    });
    return {
      type: "capture",
      origin,
      target,
      originPiece,
      targetPiece,
    };
  }

  resolveEnPassant({
    origin,
    move,
  }: {
    origin: Point;
    move: Move;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece(origin);
    if (!originPiece) return;
    const lastTurnHistory = this.current.turnHistory.at(-1);
    if (!lastTurnHistory) return;
    const enPassant = isEnPassantAvailable(lastTurnHistory);
    if (enPassant.result) {
      if (doPointsMatch(enPassant.enPassantPoint, target)) {
        const enPassantPiece = this.lookupPiece(enPassant.enPassantPoint)!;
        this.updateBoard({
          origin,
          move,
          board: this.current.board,
        });
        return {
          type: "enPassant",
          origin,
          target,
          originPiece,
          targetPiece: enPassantPiece,
          enPassant,
        };
      }
    }
  }

  resolveCastling({
    origin,
    move,
  }: {
    origin: Point;
    move: Move;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece(origin);
    if (!originPiece) return;
    const targetPiece = this.lookupPiece(target);
    const castling =
      originPiece.type === PIECE.K &&
      originPiece.team === this.getCurrentTeam();
    let castling2 = false;
    if (targetPiece) {
      castling2 =
        targetPiece.type === PIECE.R &&
        targetPiece.team === this.getCurrentTeam();
      if (castling && castling2) {
        const [originX, OriginY] = origin;
        const [targetX] = target;
        let c = originX - targetX;
        c < 0 ? (c = 1) : (c = -1);
        const newKingX = originX + c * 2;
        const newRookX = originX + c;
        const newKingPoint: Point = [newKingX, OriginY];
        const newRookPoint: Point = [newRookX, OriginY];
        this.updateBoard({
          origin,
          move,
          board: this.current.board,
        });
        const castlingResult: [Point, Point] = [newKingPoint, newRookPoint];
        return {
          type: "castle",
          direction: c,
          origin,
          target,
          originPiece,
          targetPiece,
          castling: castlingResult,
        };
      }
    }
  }

  getMoves({
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

  updateBoard({
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
      board.addPiece({ point: target, piece: originPiece });
      board.removePiece({ point: origin });
    } else if (moveType === "capture") {
      board.addPiece({ point: target, piece: originPiece });
      board.removePiece({ point: origin });
    } else if (moveType === "enPassant") {
      board.addPiece({ point: target, piece: originPiece });
      board.removePiece({ point: origin });
      board.removePiece({ point: target });
      // board.removePiece({ point: lastTurnHistory.target });
    } else if (moveType === "castle") {
      const targetPiece = board.getPiece(target);
      if (!dontUpdatePiece) targetPiece?.update();
      const [originX, OriginY] = origin;
      const [targetX] = target;
      let c = originX - targetX;
      c < 0 ? (c = 1) : (c = -1);
      const newKingX = originX + c * 2;
      const newRookX = originX + c;
      const newKingPoint: Point = [newKingX, OriginY];
      const newRookPoint: Point = [newRookX, OriginY];
      board.addPiece({ point: newKingPoint, piece: originPiece! });
      board.addPiece({ point: newRookPoint, piece: targetPiece! });
      board.removePiece({ point: origin });
      board.removePiece({ point: target });
    }
  }

  canMoveResolve({ origin, move }: { origin: Point; move: Move }) {
    const board = this.current.board.cloneBoard();
    this.updateBoard({ origin, move, board, dontUpdatePiece: true });
    //Check if resolving above switch would put player in check
    const isMoveResolvable = this.isChecked(this.getCurrentTeam(), board)
      ? false
      : true;
    return isMoveResolvable;
  }

  getAllPieces() {
    return this.current.board.getPieces();
  }

  lookupPiece(point: Point) {
    return this.current.board.getPiece(point);
  }

  isChecked(team: TEAM, board: Board) {
    const pieces = board.getPieces();
    const king = pieces.find(({ piece }) => {
      return piece?.type === PIECE.K && piece?.team === team;
    })!;
    const opponentsPieces = board.getPieces().filter(({ piece }) => {
      return piece?.team === this.getOpponentTeam();
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

  isCheckmate() {
    // return this.simulateCheckmate() ? true : false;
    return false;
  }

  // simulateCheckmate() {
  //   //Find all current Pieces
  //   const currentPlayerPieces = this.getPiecesByTeam(this.getCurrentTeam());
  //   //For each piece, iterate on its available moves
  //   currentPlayerPieces.forEach(({ piece, point }) => {
  //     const availableMoves = this.getMoves({ piece, point, board: this.current.board });
  //     //For each available move, check if resolving it results in player still being in check
  //     return availableMoves.length ? true : false;
  //   });
  //   return false;
  //   //If any valid moves, you are not in checkmate
  // }

  checkPromotion({ piece, point }: { piece: GamePiece; point: Point }) {
    if (piece.type === PIECE.P && (point[1] === 0 || point[1] === 7)) {
      return true;
    }
    return false;
  }

  setPromotionPiece({
    target,
    originPiece,
    selection,
  }: {
    target: Point;
    originPiece: GamePiece;
    selection: PIECE;
  }) {
    this.current.board.removePiece({ point: target });
    const promotedPiece = new GamePiece({
      type: selection,
      team: originPiece.team,
    });
    this.current.board.addPiece({ point: target, piece: promotedPiece });
  }

  resetGame() {
    this.current = this.createGame();
  }

  getHistory() {
    return this.current.turnHistory;
  }

  annotate(result: TurnHistory) {
    let annotation;
    const type = result.type;
    const promotion =
      (result.type === "movement" || result.type === "capture") &&
      result.promote;
    const pieceName = result.originPiece.type;
    const originSquare = this.current.board.getSquare(result.origin);
    const targetSquare = this.current.board.getSquare(result.target);
    const isCapturing = result.type === "capture";
    const symbol = result.originPiece?.getSymbol();
    if (type === "castle") {
      annotation = result.direction === 1 ? "O-O" : "O-O-O";
    } else if (promotion) {
      //Add promoted piece so can get symbol
      // const symbol = promotedPiece.getSymbol();
      annotation = `${targetSquare}${symbol}`;
    } else if (isCapturing) {
      if (pieceName === "Pawn") {
        annotation = `${originSquare.name.charAt(0)}x${targetSquare}`;
      } else {
        annotation = `${symbol}x${targetSquare}`;
      }
    } else {
      annotation = `${symbol}${targetSquare}`;
    }
    // const isCheck = this.isChecked(this.getOpponentTeam(), this.current.board);
    // if (isCheck) annotation = `${annotation}+`;

    this.current.annotations.push(annotation);
  }
}

export default Game;
