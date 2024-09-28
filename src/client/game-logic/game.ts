import { GAMESTATUS, Move, PIECE, Point, TurnHistory } from "../../shared/game";
import GamePiece from "../../shared/game-piece";
import { TEAM } from "../../shared/match";
import Board from "./board";
import { doMovesMatch, getPieceMoves, isEnPassantAvailable } from "./helpers";

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

  nextTurn() {
    this.current.turn++;
    if (this.isCheckmate()) {
      this.current.state = GAMESTATUS.CHECKMATE;
    }
  }

  undoTurn() {
    //#Refactor turn history to be a set of instructions so this can be undone easier and more clear
    const lastTurn = this.current.turnHistory.at(-1);
    if (lastTurn) {
      lastTurn.originPiece.resetPieceMovement();
      this.current.board.movePiece({
        origin: lastTurn.target,
        target: lastTurn.origin,
      });
      //Undo Promotion
      if (lastTurn.type === "movement" || lastTurn.type === "capture") {
        if (lastTurn.promote) {
          this.current.board.removePiece({ point: lastTurn.target });
          this.current.board.addPiece({
            point: lastTurn.origin,
            piece: lastTurn.originPiece,
          });
        }
      }
      if (lastTurn.type === "castle") {
        this.current.board.movePiece({
          origin: lastTurn.origin,
          target: lastTurn.target,
          shouldSwitch: true,
        });
        lastTurn.targetPiece.resetPieceMovement();
      } else if (lastTurn.type === "capture" || lastTurn.type === "enPassant") {
        this.current.board.addPiece({
          point: lastTurn.target,
          piece: lastTurn.targetPiece,
        });
      }
      this.current.turnHistory.pop();
      this.current.annotations.pop();
      this.current.turn--;
      return true;
    }
    return false;
  }

  getMoveType(origin: Point, target: Point) {
    const piece = this.lookupPiece(origin);
    if (!piece) return;
    const availableMoves = this.getResolvableMoves({ piece, point: origin });
    const move = availableMoves.find((move) => doMovesMatch(move[0], target));
    return move?.[1];
  }

  move(origin: Point, target: Point): TurnHistory | undefined {
    if (this.current.state === GAMESTATUS.CHECKMATE) return;
    const moveType = this.getMoveType(origin, target);
    let result: TurnHistory | undefined;
    switch (moveType) {
      case "movement":
        result = this.resolveMovement({ origin, target });
        break;
      case "capture":
        result = this.resolveCapture({ origin, target });
        break;
      case "enPassant":
        result = this.resolveEnPassant({ origin, target });
        break;
      case "castle":
        result = this.resolveCastling({ origin, target });
        break;
    }
    if (result) {
      if (result.type === "movement" || result.type === "capture") {
        if (result.promote) {
          this.setPromotionPiece(result, PIECE.Q);
        }
      }
      this.annotate(result);
      this.current.turnHistory.push(result);
      this.nextTurn();
      return result;
    }
  }

  resolveMovement({
    origin,
    target,
  }: {
    origin: Point;
    target: Point;
  }): TurnHistory | undefined {
    const originPiece = this.lookupPiece(origin);
    if (!originPiece) return;
    //Check if valid move can be resolved
    if (this.canMoveResolve({ origin, target }, false)) {
      originPiece.update();
      return {
        type: "movement",
        origin,
        target,
        originPiece,
        promote: this.checkPromotion({ piece: originPiece, point: target }),
      };
    } else {
      return;
    }
  }

  resolveCapture({
    origin,
    target,
  }: {
    origin: Point;
    target: Point;
  }): TurnHistory | undefined {
    const originPiece = this.lookupPiece(origin);
    const targetPiece = this.lookupPiece(target);
    if (!originPiece || !targetPiece) return;
    //Check if valid move can be resolved
    if (this.canMoveResolve({ origin, target }, false)) {
      originPiece.update();
      return {
        type: "capture",
        origin,
        target,
        originPiece,
        targetPiece,
        promote: this.checkPromotion({ piece: originPiece, point: target }),
      };
    }
  }

  resolveEnPassant({
    origin,
    target,
  }: {
    origin: Point;
    target: Point;
  }): TurnHistory | undefined {
    const originPiece = this.lookupPiece(origin);
    if (!originPiece) return;
    const lastTurnHistory = this.current.turnHistory.at(-1);
    if (!lastTurnHistory) return;
    const enPassant = isEnPassantAvailable(lastTurnHistory);
    if (enPassant.result) {
      if (doMovesMatch(enPassant.enPassantPoint, target)) {
        if (this.canMoveResolve({ origin, target }, false)) {
          originPiece.update();
          const enPassantPiece = lastTurnHistory.originPiece;
          this.current.board.removePiece({ point: lastTurnHistory.target });
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
  }

  resolveCastling({
    origin,
    target,
  }: {
    origin: Point;
    target: Point;
  }): TurnHistory | undefined {
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
        //Move King 2 Spaces from current location in the direction of rook
        //Move the Rook 1 space in that same direction from the kings original location
        const newKingX = originX + c * 2;
        const newRookX = originX + c;
        const newKingPoint: Point = [newKingX, OriginY];
        const newRookPoint: Point = [newRookX, OriginY];
        this.current.board.addPiece({
          point: newKingPoint,
          piece: originPiece,
        });
        this.current.board.addPiece({
          point: newRookPoint,
          piece: targetPiece,
        });
        this.current.board.removePiece({ point: origin });
        this.current.board.removePiece({ point: target });
        originPiece.update();
        targetPiece.update();
        const castlingResult = [
          this.current.board.getSquare(newKingPoint),
          this.current.board.getSquare(newRookPoint),
        ];
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

  getPossibleMoves({
    point,
    piece,
    checkCastling = true,
  }: {
    point: Point;
    piece: GamePiece | undefined;
    checkCastling?: boolean;
  }): Move[] {
    if (!piece) return [];
    const lastTurnHistory = this.current.turnHistory.at(-1);
    const availableMoves = getPieceMoves({
      point,
      piece,
      board: this.current.board,
      lastTurnHistory,
      calcCastling: this.calcCastling.bind(this),
      checkCastling,
    });
    return availableMoves;
  }

  getResolvableMoves({
    piece,
    point,
    checkCastling = true,
  }: {
    piece: GamePiece | undefined;
    point: Point;
    checkCastling?: boolean;
  }): Move[] {
    if (!piece) return [];
    const availableMoves = this.getPossibleMoves({
      piece,
      point,
      checkCastling,
    });
    return availableMoves.filter((move) => {
      return this.canMoveResolve({ origin: point, target: move[0] }, true);
    });
  }

  canMoveResolve(
    { origin, target }: { origin: Point; target: Point },
    reset = true
  ) {
    const pieces = this.current.board.getPieceOnSquares({ origin, target });
    this.current.board.movePiece({ origin, target });

    //Check if resolving above switch would put player in check
    const isMoveResolvable = this.isChecked(this.getCurrentTeam())
      ? false
      : true;
    if (reset) {
      this.current.board.unmovePiece({
        origin,
        target,
        originPiece: pieces.originPiece!,
      });
    }
    return isMoveResolvable;
  }

  findKing(team: TEAM) {
    const pieces = this.getPiecesByTeam(team);
    const king = pieces.find(({ piece }) => {
      return piece?.type === PIECE.K;
    })!;
    return king;
  }

  getPiecesByTeam(team: TEAM) {
    const pieces = this.getAllPieces();
    return pieces.filter(({ piece }) => {
      return piece?.team === team;
    });
  }

  findPieces(name: string, team: TEAM) {
    const pieces = this.getPiecesByTeam(team);
    const foundPieces = pieces.filter(({ piece }) => {
      return piece?.type === name;
    });
    return foundPieces;
  }

  getAllPieces() {
    return this.current.board.getPieces();
  }

  lookupPiece(point: Point) {
    return this.current.board.getPiece(point);
  }

  isChecked(team: TEAM) {
    const king = this.findKing(team);
    const opponentsPieces = this.getPiecesByTeam(this.getOpponentTeam());
    const opponentsAvailableMoves = opponentsPieces
      .map(({ piece, point }) =>
        this.getPossibleMoves({
          piece,
          point,
          checkCastling: false,
        })
      )
      .flat();
    const isKingChecked = opponentsAvailableMoves.find((move) =>
      doMovesMatch(move[0], king.point)
    );
    //Returns an array with the kings location if checked
    return isKingChecked;
  }

  isCheckmate() {
    return this.simulateCheckmate() ? true : false;
  }

  simulateCheckmate() {
    //Find all current Pieces
    const currentPlayerPieces = this.getPiecesByTeam(this.getCurrentTeam());
    //For each piece, iterate on its available moves
    currentPlayerPieces.forEach(({ piece, point }) => {
      const availableMoves = this.getResolvableMoves({ piece, point });
      //For each available move, check if resolving it results in player still being in check
      return availableMoves.length ? true : false;
    });
    return false;
    //If any valid moves, you are not in checkmate
  }

  calcCastling(piece: GamePiece, movesObj: Move[]) {
    const playersRooks = this.findPieces(PIECE.R, this.getCurrentTeam());
    if (playersRooks.length) {
      playersRooks.forEach(({ piece: rook, point }) => {
        if (!rook) return;
        //Check for castling move
        if (!rook.moved) {
          const resolve = this.canCastlingResolve(point, point);
          if (resolve) {
            //If castling resolve returns true, push the move into available moves
            resolve[0] ? movesObj.push(resolve[1]) : null;
          }
        }
      });
    }
  }

  canCastlingResolve(originPoint: Point, targetPoint: Point) {
    const [kingX, kingY] = originPoint;
    const [rookX] = targetPoint;
    const spaceBetween = kingX - rookX;
    let distance;
    spaceBetween < 0
      ? (distance = spaceBetween * -1 - 1)
      : (distance = spaceBetween - 1);

    //Calculate the squares in between King and Rook
    const squaresInBetween: Point[] = [];

    for (let step = 1; step <= distance; step++) {
      let stepDirection;
      spaceBetween < 0
        ? (stepDirection = step * 1)
        : (stepDirection = step * -1);
      const point: Point = [kingX + stepDirection, kingY];
      squaresInBetween.push(point);
    }
    //Check if squares in between are used by any pieces
    const pieceInBetween = squaresInBetween.filter((point) => {
      return this.current.board.getPiece(point);
    });
    if (!pieceInBetween.length) {
      const squaresInUse = [...squaresInBetween, originPoint, targetPoint];
      //Check if opponents pieces, threathen any of the spaces in between
      const opponentsPieces = this.getPiecesByTeam(this.getOpponentTeam());
      const opponentsAvailableMoves = opponentsPieces
        .map(({ piece, point }) =>
          this.getPossibleMoves({
            piece,
            point,
            checkCastling: false,
          })
        )
        .flat();
      const isThereOverlap = [];
      for (let i = 0; i < squaresInUse.length; i++) {
        const square = squaresInUse[i];
        for (let k = 0; k < opponentsAvailableMoves.length; k++) {
          const availableMove = opponentsAvailableMoves[k];
          const doesMoveMatchSquare = doMovesMatch(availableMove[0], square);
          doesMoveMatchSquare ? isThereOverlap.push(doesMoveMatchSquare) : null;
        }
      }
      if (!isThereOverlap.length) {
        //If there is no overlap, return the possible castling move
        const returnResult: [boolean, Move] = [true, [targetPoint, "castle"]];
        return returnResult;
      }
    }
  }

  checkPromotion({ piece, point }: { piece: GamePiece; point: Point }) {
    if (piece.type === PIECE.P && (point[1] === 0 || point[1] === 7)) {
      return true;
    }
    return false;
  }

  setPromotionPiece(history: TurnHistory, selection: PIECE) {
    const { origin, originPiece, target } = history;
    this.current.board.removePiece({ point: origin });
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
    const isCheck = this.isChecked(this.getOpponentTeam());
    if (isCheck) annotation = `${annotation}+`;

    this.current.annotations.push(annotation);
  }
}

export default Game;
