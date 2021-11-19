import * as gameHelpers from "./helper/game-helpers";
import * as movementHelpers from "./helper/movement-helpers";
import { setPieces, createGrid, Square } from "./helper/board-helpers";
import { TurnHistory, LocationsInfo } from "./helper/game-helpers";
import Board from "./component/board";
import { Data, State } from "./data/chess-data-import";
import Timer from "./component/timer";
import GamePiece, { Move } from "./component/game-piece";

class Game {
  state: State;
  teams: string[];
  turnCounter: number;
  board: Board;
  moves: Point[];
  annotations: string[];
  turnHistory: TurnHistory[];
  timer: Timer;

  constructor(chessData: Data) {
    this.state = chessData.initialState;
    this.teams = chessData.teams;
    this.board = new Board(chessData);
    this.moves = [];
    this.annotations = [];
    this.turnHistory = [];
    this.turnCounter = 1;
    this.timer = new Timer(this.state, this.endGame.bind(this));
    this.setBoard();
  }

  playerMove(originPoint: Point, targetPoint: Point): boolean {
    const resolve = this.resolveMove(originPoint, targetPoint);
    if (typeof resolve !== "boolean") {
      resolve.result
        ? (() => {
            resolve.turn = this.turnCounter;
            const annotation = this.annotate(resolve);
            this.annotations.push(annotation);
            this.turnHistory.push(resolve);
          })()
        : null;
      return resolve.result;
    }
    return false;
  }

  resolveMove(originPoint: Point, targetPoint: Point): TurnHistory | boolean {
    const locationsInfo = this.getLocationsInfo(originPoint, targetPoint);
    //Resolve a castling Move
    const castlingResult = this.resolveCastling(locationsInfo);
    if (castlingResult) {
      return castlingResult;
    }
    //Resolve a EnPassant Move
    const enPassantResult = this.resolveEnPassant(locationsInfo);
    if (enPassantResult) {
      return enPassantResult;
    }
    //Resolve a standard movement/capture move
    const standardResult = this.resolveStandard(locationsInfo);
    if (standardResult) {
      return standardResult;
    }
    console.log("Not able to resolve Move!");
    return false;
  }

  resolveStandard(locationsInfo: LocationsInfo) {
    const { originPiece } = locationsInfo;
    //Check if valid move can be resolved
    if (this.canValidMoveResolve(locationsInfo)) {
      originPiece!.update();
      //Once move resolved check if pawn promotion is relevant
      const promotion = originPiece!.checkPromotion(locationsInfo);
      console.log("Move is Valid! Board is updated.");
      return gameHelpers.generateTurnHistory("standard", locationsInfo, {
        promotion,
      });
    }
  }

  resolveEnPassant(locationsInfo: LocationsInfo) {
    const { targetPoint } = locationsInfo;
    const lastTurnHistory = this.turnHistory[this.turnHistory.length - 1];
    const enPassant = gameHelpers.isEnPassantAvailable(lastTurnHistory);
    if (enPassant.result) {
      if (gameHelpers.doMovesMatch(enPassant.enPassantPoint, targetPoint)) {
        if (this.canValidMoveResolve(locationsInfo)) {
          const enPassantPiece = lastTurnHistory.targetSquare.on;
          lastTurnHistory.targetSquare.on = undefined;
          return gameHelpers.generateTurnHistory("enPassant", locationsInfo, {
            enPassant,
            enPassantPiece,
            lastTurnHistorySquare: lastTurnHistory.targetSquare,
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
      originPiece!.color === this.state.currentPlayer;
    let castling2 = false;
    if (targetPiece !== undefined) {
      castling2 =
        targetPiece.name === "Rook" &&
        targetPiece.color === this.state.currentPlayer;
      if (castling && castling2) {
        const a = gameHelpers.getX(originPoint);
        const b = gameHelpers.getX(targetPoint);
        let c = a - b;
        c < 0 ? (c = 1) : (c = -1);
        const castlingResult = castlingMove(c, locationsInfo, this.board.grid);
        return gameHelpers.generateTurnHistory("castling", locationsInfo, {
          direction: c,
          castlingResult,
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
      return [newKingSquare, newRookSquare];
    }
  }

  calculateAvailableMoves(piece: GamePiece, flag = false): Move[] {
    let availableMoves: Move[] = [];
    let lastTurnHistory = this.turnHistory[this.turnHistory.length - 1];
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

  findKing(currentPlayer: boolean) {
    const currentKing = this.board.grid
      .flat()
      .filter((square) => (square.on !== undefined ? true : false))
      .find((square) => {
        if (currentPlayer) {
          return (
            square.on!.name === "King" &&
            square.on!.color === this.state.currentPlayer
          );
        } else {
          return (
            square.on!.name === "King" &&
            square.on!.color !== this.state.currentPlayer
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
          return square.on.color === this.state.currentPlayer;
        } else {
          return square.on.color !== this.state.currentPlayer;
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

  isCheckmate() {
    //Is called after turn switch, checks if player is even in check before testing for checkmate
    if (this.isChecked(true)) {
      return this.simulateCheckmate() ? true : false;
    }
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
    const isCheckmate = finalResults.filter((result) => result === false);
    //If any return true, you are not in checkmate
    return isCheckmate.length ? false : true;
  }

  calcCastling(currentPoint: Point, movesObj: Move[]) {
    const [x, y] = currentPoint;
    const piece = this.board.grid[x][y].on;
    let targetPiece;
    let targetPiece2;

    if (piece!.color === "White") {
      targetPiece = this.board.grid[0][0].on;
      targetPiece2 = this.board.grid[7][0].on;
    } else {
      targetPiece = this.board.grid[0][7].on;
      targetPiece2 = this.board.grid[7][7].on;
    }
    //Check for castling move
    const castling1 = piece!.name === "King" && !piece!.moved;
    if (targetPiece !== undefined) {
      const castling2 = targetPiece.name === "Rook" && !targetPiece.moved;
      if (castling1 && castling2) {
        const resolve = this.canCastlingResolve(
          piece!.point,
          targetPiece.point
        );
        if (resolve !== false) {
          resolve[0] ? movesObj.push(resolve[1]) : null;
        }
      }
    }
    //Check for second castling move
    const castling3 = piece!.name === "King" && !piece!.moved;
    if (targetPiece2 !== undefined) {
      const castling4 = targetPiece2.name === "Rook" && !targetPiece2.moved;
      if (castling3 && castling4) {
        const resolve = this.canCastlingResolve(
          piece!.point,
          targetPiece2.point
        );
        if (resolve !== false) {
          resolve[0] ? movesObj.push(resolve[1]) : null;
        }
      }
    }
  }

  //Checks if castling is valid
  canCastlingResolve(originPoint: Point, targetPoint: Point) {
    const locationsInfo = this.getLocationsInfo(originPoint, targetPoint);
    const { originPiece, targetPiece } = locationsInfo;
    //Check for valid castling pieces
    if (originPiece!.moved === false && targetPiece!.moved === false) {
      if (originPiece!.name === "King" && targetPiece!.name === "Rook") {
        //Check for valid team
        if (
          originPiece!.color === this.state.currentPlayer &&
          targetPiece!.color === this.state.currentPlayer
        ) {
          //Check if king is currently in check
          const isKingChecked = this.isChecked(true);
          if (isKingChecked) {
            //console.log("King is checked!");
            return false;
          } else {
            //Check squares between king and rook are unoccupied.
            const a = gameHelpers.getX(originPoint);
            const b = gameHelpers.getX(targetPoint);
            const y = gameHelpers.getY(originPoint);
            let c = a - b;
            let d;
            c < 0 ? (d = c * -1 - 1) : (d = c - 1);

            const squaresInBetween: Point[] = [];
            for (let i = 1; i <= d; i++) {
              if (a - b > 0) {
                const point: Point = [a - i, y];
                squaresInBetween.push(point);
              } else {
                const point: Point = [a + i, y];
                squaresInBetween.push(point);
              }
            }
            const squaresInUse = squaresInBetween
              .map((point) => {
                const square =
                  this.board.grid[gameHelpers.getX(point)][
                    gameHelpers.getY(point)
                  ];
                return square.on === undefined ? false : true;
              })
              .filter((result) => result === true);

            if (squaresInUse.length) {
              //console.log("Squares in between are in use by other game pieces, Castling not available!");
              return false;
            } else {
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
              if (isThereOverlap.length === 0) {
                console.log("Castling Available!");
                const returnResult: [boolean, Move] = [
                  true,
                  [targetPoint, "castling"],
                ];
                return returnResult;
              } else {
                console.log(
                  "Castling Not Available!, One of Squares is under Enemy Threat!"
                );
                return false;
              }
            }
          }
        } else {
          console.log("Pieces must belong to currentPlayer!");
          return false;
        }
      } else {
        console.log(
          "Moving piece must be King, target piece needs to be Rook!"
        );
        return false;
      }
    } else {
      console.log("Both King and Rook need to have not moved!");
      return false;
    }
  }

  changePlayer() {
    this.state.currentPlayer =
      this.state.currentPlayer === this.teams[0]
        ? this.teams[1]
        : this.teams[0];
    console.log(`${this.state.currentPlayer} team's turn!`);
  }

  switchTurn() {
    this.turnCounter++;
    this.changePlayer();
    this.isCheckmate() ? this.endGame() : null;
  }

  undoTurn() {
    const lastTurn = this.turnHistory.at(-1);
    if (lastTurn !== undefined) {
      lastTurn.originPiece!.moveCounter === 1
        ? (lastTurn.originPiece!.moved = false)
        : null;
      lastTurn.originPiece!.moveCounter--;
      lastTurn.castling
        ? lastTurn.castling.forEach((square) => (square.on = undefined))
        : null;
      lastTurn.originSquare.on = lastTurn.originPiece;
      lastTurn.originPiece!.point = lastTurn.origin;
      lastTurn.targetSquare.on = lastTurn.targetPiece;
      this.turnHistory.length = this.turnHistory.length - 1;
      this.annotations.length = this.annotations.length - 1;
      this.turnCounter--;
      this.changePlayer();
    }
  }

  endGame() {
    const winningTeam =
      this.state.currentPlayer === this.teams[0]
        ? this.teams[1]
        : this.teams[0];
    this.timer.gameStarted = false;
    let confirmation = confirm(
      `Game is over, ${winningTeam} player wins!, Would you like to start another game?`
    );
    if (confirmation) {
      this.resetGame();
    } else {
      console.log("No");
    }
  }

  setBoard() {
    setPieces(
      this.board.grid,
      this.board.pieceInitialPoints,
      this.board.movementArray
    );
  }

  resetGame(time?: number) {
    this.board.grid = createGrid(this.board.boardSize, this.board.columnNames);
    this.setBoard();
    this.state.currentPlayer = this.teams[0];
    this.timer.resetTimers(time);
    this.timer.gameStarted = false;
    this.annotations = [];
    this.turnHistory = [];
    this.turnCounter = 1;
    setTimeout(() => {
      this.timer.startTimer(time);
    }, 1000);
    return console.log("Board Has Been Reset!");
  }

  annotate(result: TurnHistory) {
    let string;
    const type = result.type;
    const promotion = result.promotion;
    if (type === "castling") {
      string = result.direction === 1 ? "O-O" : "O-O-O";
    } else if (promotion) {
      let finalString;
      switch (promotion) {
        case "King":
          finalString = "K";
          break;
        case "Queen":
          finalString = "Q";
          break;
        case "Knight":
          finalString = "N";
          break;
        case "Bishop":
          finalString = "B";
          break;
        case "Rook":
          finalString = "R";
          break;
        default:
          finalString = "";
      }
      string = result.targetSquare.square + "=" + finalString;
    } else {
      let name = result.originPiece!.name;
      let movingPiece;
      let isCapturing = result.targetPiece !== undefined ? true : false;
      let activeSquare = result.targetSquare.square;
      switch (name) {
        case "King":
          movingPiece = "K";
          break;
        case "Queen":
          movingPiece = "Q";
          break;
        case "Knight":
          movingPiece = "N";
          break;
        case "Bishop":
          movingPiece = "B";
          break;
        case "Rook":
          movingPiece = "R";
          break;
        default:
          movingPiece = "";
      }
      if (isCapturing) {
        if (name === "Pawn") {
          string = result.originSquare.square.charAt(0) + "x" + activeSquare;
        } else {
          string = movingPiece + "x" + activeSquare;
        }
      } else {
        string = movingPiece + activeSquare;
      }
      const isCheck = this.isChecked(false);
      isCheck ? (string = string + "+") : null;
    }
    return string;
  }

  startTimer() {
    this.timer.startTimer();
  }
}

export default Game;
