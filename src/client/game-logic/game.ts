import { Move, Piece, Point, TurnHistory } from "../../shared/game";
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
    };
  }

  getTeam(currentPlayer = true) {
    const remainder = this.current.turn % 2;
    const index = currentPlayer ? (remainder ? 0 : 1) : remainder ? 1 : 0;
    return this.teams[index];
  }

  getWinner() {
    //Refactor this to not depend on looking at previous turn and emit a winner
    const index = this.current.turn % 2 ? 1 : 0;
    return this.teams[index];
  }

  nextTurn() {
    this.current.turn++;
    if (this.isCheckmate()) return false;
    return true;
  }

  undoTurn() {
    const lastTurn = this.current.turnHistory.at(-1);
    if (lastTurn) {
      lastTurn.originPiece.resetPieceMovement();
      lastTurn.originPiece.point = lastTurn.origin;
      //Undo Promotion
      if (lastTurn.type === "movement" || lastTurn.type === "capture") {
        if (lastTurn.promote) {
          this.current.board.removePieceByPoint(lastTurn.target);
          this.current.board.addPiece(lastTurn.originPiece);
        }
      }
      if (lastTurn.type === "castle") {
        lastTurn.targetPiece.point = lastTurn.target;
        lastTurn.targetPiece.resetPieceMovement();
      } else if (lastTurn.type === "capture" || lastTurn.type === "enPassant") {
        this.current.board.addPiece(lastTurn.targetPiece);
      }
      this.current.turnHistory.pop();
      this.current.annotations.pop();
      this.current.turn--;
      return true;
    }
    return false;
  }

  getMoveType(origin: Point, target: Point) {
    const originPiece = this.lookupPiece(origin);
    if (!originPiece) return;
    const availableMoves = this.calculateAvailableMoves(originPiece, true);
    const move = availableMoves.find((move) => doMovesMatch(move[0], target));
    return move?.[1];
  }

  resolveMove(origin: Point, target: Point): TurnHistory | undefined {
    const moveType = this.getMoveType(origin, target);
    let result: TurnHistory | undefined;
    switch (moveType) {
      case "movement":
        const turnHistory = this.resolveMovement({ origin, target });
        result = turnHistory;
        break;
      case "capture":
        const captureResult = this.resolveCapture({ origin, target });
        result = captureResult;
        break;
      case "enPassant":
        const enPassantResult = this.resolveEnPassant({ origin, target });
        result = enPassantResult;
        break;
      case "castle":
        const castlingResult = this.resolveCastling({ origin, target });
        result = castlingResult;
        break;
    }
    if (result) {
      if (result.type === "movement" || result.type === "capture") {
        if (result.promote) {
          this.setPromotionPiece(result, Piece.Q);
        }
      }
      this.annotate(result);
      this.current.turnHistory.push(result);
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
    if (this.canValidMoveResolve({ origin, target })) {
      originPiece.update();
      return {
        type: "movement",
        origin,
        target,
        originPiece,
        promote: originPiece.checkPromotion(),
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
    if (this.canValidMoveResolve({ origin, target })) {
      originPiece.update();
      return {
        type: "capture",
        origin,
        target,
        originPiece,
        targetPiece,
        promote: originPiece.checkPromotion(),
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
        if (this.canValidMoveResolve({ origin, target })) {
          originPiece.update();
          const enPassantPiece = lastTurnHistory.originPiece;
          this.current.board.removePieceByPoint(enPassantPiece.point);
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
      originPiece.type === Piece.K && originPiece.team === this.getTeam();
    let castling2 = false;
    if (targetPiece) {
      castling2 =
        targetPiece.type === Piece.R && targetPiece.team === this.getTeam();
      if (castling && castling2) {
        const [originX] = origin;
        const [targetX] = target;
        let c = originX - targetX;
        c < 0 ? (c = 1) : (c = -1);
        const castlingResult = castlingMove(
          c,
          { originPiece, targetPiece },
          this.current.board
        );
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

    function castlingMove(
      direction: number,
      {
        originPiece,
        targetPiece,
      }: { originPiece: GamePiece; targetPiece: GamePiece },
      board: Board
    ) {
      //Move King 2 Spaces from current location in the direction of rook
      //Move the Rook 1 space in that same direction from the kings original location
      const [x, y] = originPiece.point;
      const newKingX = x + direction * 2;
      const newRookX = x + direction;
      const newKingPoint: Point = [newKingX, y];
      const newRookPoint: Point = [newRookX, y];
      originPiece.point = newKingPoint;
      targetPiece.point = newRookPoint;
      originPiece.update();
      targetPiece.update();
      return [board.getSquare(newKingPoint), board.getSquare(newRookPoint)];
    }
  }

  calculateAvailableMoves(piece: GamePiece, flag = false): Move[] {
    const lastTurnHistory = this.current.turnHistory.at(-1);
    const availableMoves = getPieceMoves({
      piece,
      board: this.current.board,
      lastTurnHistory,
      calcCastling: this.calcCastling.bind(this),
      flag,
    });
    return availableMoves;
  }

  canValidMoveResolve(
    { origin, target }: { origin: Point; target: Point },
    reset?: boolean
  ) {
    //Switch piece between squares
    const originPiece = this.lookupPiece(origin);
    if (!originPiece) return false;
    const targetPiece = this.lookupPiece(target);
    if (targetPiece) {
      this.current.board.removePieceByPoint(target);
    }
    originPiece.point = target;

    //Check if resolving above switch would put player in check
    const result = this.isChecked(true) ? false : true;
    if (reset) {
      //Undo switch
      originPiece.point = origin;
      if (targetPiece) {
        this.current.board.addPiece(targetPiece);
      }
    }
    return result;
  }

  isChecked(currentPlayer: boolean) {
    const king = this.findKing(currentPlayer);
    const opponentsPieces = this.getPieces(!currentPlayer);
    const opponentsAvailableMoves = this.getMoves(opponentsPieces);
    const isKingChecked = opponentsAvailableMoves.find((move) =>
      doMovesMatch(move[0], king.point)
    );
    //Returns an array with the kings location if checked
    return isKingChecked;
  }

  isValidMove(movingPiece: GamePiece, point: Point, flag: boolean) {
    return this.calculateAvailableMoves(movingPiece, flag).find((move) =>
      doMovesMatch(move[0], point)
    );
  }
  getMoves(gamePieces: GamePiece[]) {
    const availableMoves = gamePieces
      .map((piece) => this.calculateAvailableMoves(piece))
      .flat()
      .filter((move) => (move[0] !== undefined ? true : false));
    return availableMoves;
  }

  getValidMoves(piece: GamePiece) {
    const moves = this.calculateAvailableMoves(piece, true);
    //Add filter to display only moves that can resolve
    const validMoves = moves
      .map((move) => {
        //Check for checkmate if move resolves
        const validMove = this.canValidMoveResolve(
          {
            origin: piece.point,
            target: move[0],
          },
          true
        );
        return validMove ? move : null;
      })
      .filter((move) => move !== null);
    return validMoves;
  }

  findKing(currentPlayer: boolean) {
    const pieces = this.getAllPieces();
    const king = pieces.find((piece) => {
      return (
        piece.type === "King" && piece.team === this.getTeam(currentPlayer)
      );
    })!;
    return king;
  }

  getPieces(currentPlayer: boolean) {
    const pieces = this.getAllPieces();
    return pieces.filter((piece) => {
      return piece.team === this.getTeam(currentPlayer);
    });
  }

  findPieces(name: string, color: string) {
    const pieces = this.getAllPieces();
    const foundPieces = pieces.filter((piece) => {
      return piece.type === name && piece.team === color;
    });
    return foundPieces;
  }

  getAllPieces() {
    return this.current.board.getPieces();
  }

  lookupPiece(location: Point) {
    return this.current.board.getPieceByPoint(location);
  }

  isCheckmate() {
    return this.simulateCheckmate() ? true : false;
  }

  simulateCheckmate() {
    const finalResults: boolean[] = [];
    //Find all current Pieces
    const currentPlayerPieces = this.getPieces(true);
    //For each piece, iterate on its available moves
    currentPlayerPieces.forEach((piece) => {
      const availableMoves = this.calculateAvailableMoves(piece);
      //For each available move, check if resolving it results in player still being in check
      const isItCheckmate = availableMoves.map((move) => {
        const result = this.canValidMoveResolve(
          {
            origin: piece.point,
            target: move[0],
          },
          true
        );
        return result ? false : true;
      });
      finalResults.push.apply(finalResults, isItCheckmate);
    });
    const validMoves = finalResults.filter((result) => result === false);
    //If any valid moves, you are not in checkmate
    return validMoves.length ? false : true;
  }

  calcCastling(piece: GamePiece, movesObj: Move[]) {
    const checkCastlingMove = (piece: GamePiece, targetPiece: GamePiece) => {
      //Check for castling move
      if (!targetPiece.moved) {
        const resolve = this.canCastlingResolve(piece.point, targetPiece.point);
        //If castling resolve returns true, push the move into available moves
        resolve[0] ? movesObj.push(resolve[1]) : null;
      }
    };
    const playersRooks = this.findPieces("Rook", this.getTeam());
    if (playersRooks.length) {
      playersRooks.forEach((rook) => {
        checkCastlingMove(piece, rook);
      });
    }
  }

  canCastlingResolve(originPoint: Point, targetPoint: Point) {
    const isKingChecked = this.isChecked(true);
    if (!isKingChecked) {
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
      const squaresInUse = squaresInBetween.filter((point) => {
        return this.current.board.getPieceByPoint(point) ? true : false;
      });
      if (!squaresInUse.length) {
        //Check if opponents pieces, threathen any of the spaces in between
        const opponentsPieces = this.getPieces(false);
        const opponentsAvailableMoves = this.getMoves(opponentsPieces);
        const isThereOverlap = [];
        for (let i = 0; i < squaresInBetween.length; i++) {
          const square = squaresInBetween[i];
          for (let k = 0; k < opponentsAvailableMoves.length; k++) {
            const availableMove = opponentsAvailableMoves[k];
            const doesMoveMatchSquare = doMovesMatch(availableMove[0], square);
            doesMoveMatchSquare
              ? isThereOverlap.push(doesMoveMatchSquare)
              : null;
          }
        }
        if (!isThereOverlap.length) {
          //If there is no overlap, return the possible castling move
          const returnResult: [boolean, Move] = [true, [targetPoint, "castle"]];
          return returnResult;
        }
      }
    }
    //If overlap, return false for possible castling move
    const returnResult: [boolean, Move] = [false, [targetPoint, "castle"]];
    return returnResult;
  }

  setPromotionPiece(history: TurnHistory, selection: Piece) {
    const { team, point } = history.originPiece;
    this.current.board.removePieceByPoint(point);
    const promotedPiece = new GamePiece({ type: selection, team, point });
    this.current.board.addPiece(promotedPiece);
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
    const isCheck = this.isChecked(false);
    if (isCheck) annotation = `${annotation}+`;

    this.current.annotations.push(annotation);
  }
}

export default Game;
