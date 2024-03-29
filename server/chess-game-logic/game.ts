import * as gameHelpers from "../../src/helper/game-helpers";
import * as movementHelpers from "../../src/helper/movement-helpers";
import {
  TurnHistory,
  LocationsInfo,
  undoUpdateLocation,
} from "../../src/helper/game-helpers";
import Board, { Square } from "./board";
import GamePiece from "./game-piece";

class Game {
  board: Board;
  history: { turns: TurnHistory[]; annotations: string[] } = {
    turns: [],
    annotations: [],
  };

  constructor() {
    this.board = new Board();
  }

  saveHistory(turnHistory: TurnHistory, annotation: string) {
    this.history.turns.push(turnHistory);
    this.history.annotations.push(annotation);
  }

  turn(originPoint: Point, targetPoint: Point): TurnHistory | false {
    const locationsInfo = this.getLocationsInfo(originPoint, targetPoint);
    //Resolve a castling Move
    const possibleMoves = [
      this.resolveCastling,
      this.resolveEnPassant,
      this.resolveStandard,
    ];
    for (let i = 0; i < possibleMoves.length; i++) {
      const move = possibleMoves[i];
      const result = move(locationsInfo);
      if (result) {
        const annotation = this.annotate(result);
        this.saveHistory(result, annotation);
        return result;
      }
    }
    return false;
  }

  resolveStandard(locationsInfo: LocationsInfo) {
    const { originPiece } = locationsInfo;
    //Check if valid move can be resolved
    if (this.canValidMoveResolve(locationsInfo)) {
      originPiece!.update();
      //Once move resolved check if pawn promotion is relevant
      const promotion = originPiece!.checkPromotion();
      return gameHelpers.generateTurnHistory("standard", locationsInfo, {
        promotion,
      });
    }
  }

  resolveEnPassant(locationsInfo: LocationsInfo) {
    const { originPiece, targetPoint } = locationsInfo;
    const lastTurnHistory = this.history.turns[this.history.turns.length - 1];
    const enPassant = gameHelpers.isEnPassantAvailable(lastTurnHistory);
    if (enPassant.result) {
      if (gameHelpers.doMovesMatch(enPassant.enPassantPoint, targetPoint)) {
        if (this.canValidMoveResolve(locationsInfo)) {
          const enPassantPiece = lastTurnHistory.targetSquare.on;
          lastTurnHistory.targetSquare.on = undefined;
          const promotion = originPiece!.checkPromotion();
          return gameHelpers.generateTurnHistory("enPassant", locationsInfo, {
            enPassant,
            enPassantPiece,
            lastTurnHistorySquare: lastTurnHistory.targetSquare,
            promotion,
          });
        }
      }
    }
  }

  resolveCastling(locationsInfo: LocationsInfo) {
    const { originPiece, targetPiece, originPoint, targetPoint } =
      locationsInfo;
    const castling =
      originPiece!.name === "King" &&
      originPiece!.color === this.currentPlayer.id;
    let castling2 = false;
    if (targetPiece !== undefined) {
      castling2 =
        targetPiece.name === "Rook" &&
        targetPiece.color === this.currentPlayer.id;
      if (castling && castling2) {
        const a = gameHelpers.getX(originPoint);
        const b = gameHelpers.getX(targetPoint);
        let c = a - b;
        c < 0 ? (c = 1) : (c = -1);
        const castlingResult = castlingMove(c, locationsInfo, this.board.grid);
        const promotion = originPiece!.checkPromotion();
        return gameHelpers.generateTurnHistory("castling", locationsInfo, {
          direction: c,
          castlingResult,
          promotion,
        });
      }
    }

    function castlingMove(
      direction: number,
      locationsInfo: LocationsInfo,
      grid: Square[][]
    ) {
      const { originSquare, originPiece, targetSquare, targetPiece } =
        locationsInfo;
      const { name, color, point, movement } = originPiece!;
      const { name: name2, color: color2, movement: movement2 } = targetPiece!;
      originSquare.on = undefined;
      targetSquare.on = undefined;
      //Move King 2 Spaces from current location in the direction of rook
      //Move the Rook 1 space in that same direction from the kings original location
      const [x, y] = point;
      const newKingX = x + direction * 2;
      const newRookX = x + direction;
      const newKingPoint: Point = [newKingX, y];
      const newRookPoint: Point = [newRookX, y];
      const newKingSquare = grid[newKingX][y];
      const newRookSquare = grid[newRookX][y];
      newKingSquare.on = new GamePiece(name, color, newKingPoint, movement);
      newRookSquare.on = new GamePiece(name2, color2, newRookPoint, movement2);
      newKingSquare.on.update();
      newRookSquare.on.update();
      return [newKingSquare, newRookSquare];
    }
  }

  calculateAvailableMoves(piece: GamePiece, flag = false): Move[] {
    let availableMoves: Move[] = [];
    let lastTurnHistory = this.history.turns[this.history.turns.length - 1];
    switch (piece.name) {
      case "Pawn":
        availableMoves = movementHelpers.calcPawnMoves(
          piece,
          flag,
          this.board.grid,
          lastTurnHistory
        );
        break;
      case "Rook":
        availableMoves = movementHelpers.calcRookMoves(piece, this.board.grid);
        break;
      case "Bishop":
        availableMoves = movementHelpers.calcBishopMoves(
          piece,
          this.board.grid
        );
        break;
      case "Knight":
        availableMoves = movementHelpers.calcKnightMoves(
          piece,
          this.board.grid
        );
        break;
      case "Queen":
        availableMoves = movementHelpers.calcQueenMoves(piece, this.board.grid);
        break;
      case "King":
        availableMoves = movementHelpers.calcKingMoves(
          piece,
          flag,
          this.board.grid,
          this.calcCastling.bind(this)
        );
        break;
    }
    return availableMoves;
  }

  canValidMoveResolve(locationsInfo: LocationsInfo) {
    //Switch piece between squares
    gameHelpers.updateLocation(locationsInfo);
    //Check if resolving above switch would put player in check
    return this.isChecked(true) ? false : true;
  }

  isChecked(currentPlayer: boolean) {
    const piecesBoolean = currentPlayer === true ? false : true;
    const kingSquare = this.findKing(currentPlayer);
    const opponentsPieces = this.getPieces(piecesBoolean);
    const opponentsAvailableMoves = this.getMoves(opponentsPieces);
    const isKingChecked = opponentsAvailableMoves.find((move) =>
      gameHelpers.doMovesMatch(move[0], kingSquare!.on!.point)
    );
    //Returns an array with the kings location if checked
    return isKingChecked;
  }

  getMoves(gamePieces: Square[]) {
    const availableMoves = gamePieces
      .map((square) => this.calculateAvailableMoves(square.on!))
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
        const locationsInfo = this.getLocationsInfo(piece.point, move[0]);
        const validMove = this.canValidMoveResolve(locationsInfo);
        undoUpdateLocation(locationsInfo);
        return validMove ? move : null;
      })
      .filter((move) => move !== null);
    return validMoves;
  }

  findKing(currentPlayer: boolean) {
    const currentKing = this.board.grid
      .flat()
      .filter((square) => (square.on !== undefined ? true : false))
      .find((square) => {
        if (currentPlayer) {
          return (
            square.on!.name === "King" &&
            square.on!.color === this.currentPlayer.id
          );
        } else {
          return (
            square.on!.name === "King" &&
            square.on!.color !== this.currentPlayer.id
          );
        }
      });

    if (typeof currentKing !== "undefined") {
      return currentKing;
    }
  }

  getPieces(currentPlayer: boolean) {
    const piecesArray = this.board.grid.flat().filter((square) => {
      if (square.on !== undefined) {
        if (currentPlayer) {
          return square.on.color === this.currentPlayer.id;
        } else {
          return square.on.color !== this.currentPlayer.id;
        }
      }
    });
    return piecesArray;
  }

  getLocationsInfo(originPoint: Point, targetPoint: Point): LocationsInfo {
    const originSquare =
      this.board.grid[gameHelpers.getX(originPoint)][
        gameHelpers.getY(originPoint)
      ];
    const targetSquare =
      this.board.grid[gameHelpers.getX(targetPoint)][
        gameHelpers.getY(targetPoint)
      ];
    return {
      originSquare,
      targetSquare,
      originPiece: originSquare.on,
      targetPiece: targetSquare.on,
      originPoint,
      targetPoint,
    };
  }

  findPieces(name: string, color: string) {
    const foundPieces = this.board.grid.flat().filter((square) => {
      if (square.on !== undefined) {
        return square.on.name === name && square.on.color === color;
      }
      return false;
    });
    return foundPieces;
  }

  allPieces() {
    const allPieces = this.board.grid
      .flat()
      .filter((square) => square.on !== undefined);

    return allPieces;
  }

  lookupPiece(location: [x: number, y: number]) {
    const [x, y] = location;
    const piece = this.board.grid[x][y].on;
    if (piece !== undefined) {
      return piece!;
    }
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
      const availableMoves = this.calculateAvailableMoves(piece.on!);
      //For each available move, check if resolving it results in player still being in check
      const isItCheckmate = availableMoves.map((move) => {
        const locationsInfo = this.getLocationsInfo(piece.on!.point, move[0]);
        const result = this.canValidMoveResolve(locationsInfo);
        gameHelpers.undoUpdateLocation(locationsInfo);
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
    const playersRooks = this.findPieces("Rook", this.currentPlayer.id);
    if (playersRooks) {
      playersRooks.forEach((square) => {
        checkCastlingMove(piece!, square.on!);
      });
    }
  }

  canCastlingResolve(originPoint: Point, targetPoint: Point) {
    const isKingChecked = this.isChecked(true);
    if (!isKingChecked) {
      const [kingX, kingY] = originPoint;
      const rookX = gameHelpers.getX(targetPoint);
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
      const squaresInUse = squaresInBetween
        .map((point) => {
          const square =
            this.board.grid[gameHelpers.getX(point)][gameHelpers.getY(point)];
          return square.on === undefined ? false : true;
        })
        .filter((result) => result === true);
      if (!squaresInUse.length) {
        //Check if opponents pieces, threathen any of the spaces in between
        const opponentsPieces = this.getPieces(false);
        const opponentsAvailableMoves = this.getMoves(opponentsPieces);
        const isThereOverlap = [];
        for (let i = 0; i < squaresInBetween.length; i++) {
          const square = squaresInBetween[i];
          for (let k = 0; k < opponentsAvailableMoves.length; k++) {
            const availableMove = opponentsAvailableMoves[k];
            const doesMoveMatchSquare = gameHelpers.doMovesMatch(
              availableMove[0],
              square
            );
            doesMoveMatchSquare
              ? isThereOverlap.push(doesMoveMatchSquare)
              : null;
          }
        }
        if (!isThereOverlap.length) {
          //If there is no overlap, return the possible castling move
          const returnResult: [boolean, Move] = [
            true,
            [targetPoint, "castling"],
          ];
          return returnResult;
        }
      }
    }
    //If overlap, return false for possible castling move
    const returnResult: [boolean, Move] = [false, [targetPoint, "castling"]];
    return returnResult;
  }

  resetGame(player: { id: string }) {
    this.board.resetBoard();
    this.currentPlayer = player;
    this.history.annotations = [];
    this.history.turns = [];
  }

  annotate(result: TurnHistory) {
    let annotation;
    const type = result.type;
    const promotion = result.promotion;
    const pieceName = result.originPiece!.name;
    const square = result.targetSquare.square;
    const isCapturing = result.targetPiece !== undefined ? true : false;
    const symbol = result.originPiece?.getSymbol();
    if (type === "castling") {
      annotation = result.direction === 1 ? "O-O" : "O-O-O";
    } else if (promotion) {
      annotation = `${square}=${symbol}`;
    } else if (isCapturing) {
      if (pieceName === "Pawn") {
        annotation = `${result.originSquare.square.charAt(0)}x${square}`;
      } else {
        annotation = `${symbol}x${square}`;
      }
    } else {
      annotation = `${symbol}${square}`;
    }
    const isCheck = this.isChecked(false);
    if (isCheck) annotation = `${annotation}+`;

    return annotation;
  }
}

export default Game;

export type Move = [Point, string];
