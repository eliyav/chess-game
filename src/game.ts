import { resolveMove, isCheckmate, annotate } from "./helper/game-helpers";
import { setPieces, createGrid, PieceType } from "./helper/board-helpers";
import Board from "./component/board";
import { Data, State } from "./data/chess-data-import";
import { TurnHistory } from "./helper/game-helpers";
import Timer from "./component/timer";
import {
  calcBishopMoves,
  calcKingMoves,
  calcKnightMoves,
  calcPawnMoves,
  calcQueenMoves,
  calcRookMoves,
} from "./helper/movement-helpers";
import { Move } from "./component/game-pieces/game-piece";

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

  startTimer() {
    this.timer.startTimer();
  }

  playerMove(originPoint: Point, targetPoint: Point): boolean {
    const lastTurn = this.turnHistory[this.turnHistory.length - 1];
    const resolve = resolveMove(
      originPoint,
      targetPoint,
      this.state,
      this.board.grid,
      lastTurn,
      this.calculateAvailableMoves
    );
    if (typeof resolve !== "boolean") {
      resolve.result
        ? (() => {
            resolve.turn = this.turnCounter;
            const annotation = annotate(
              resolve,
              this.state,
              this.board.grid,
              lastTurn,
              this.calculateAvailableMoves
            );
            this.annotations.push(annotation);
            this.turnHistory.push(resolve);
          })()
        : null;
      return resolve.result;
    }
    return false;
  }

  calculateAvailableMoves(piece: PieceType, flag = false): Move[] {
    let availableMoves: Move[] = [];
    const lastTurnHistory = this.turnHistory[this.turnHistory.length - 1];
    switch (piece.name) {
      case "Pawn":
        availableMoves = calcPawnMoves(
          piece,
          flag,
          this.board.grid,
          lastTurnHistory
        );
        break;
      case "Rook":
        availableMoves = calcRookMoves(piece, this.board.grid);
        break;
      case "Bishop":
        availableMoves = calcBishopMoves(piece, this.board.grid);
        break;
      case "Knight":
        availableMoves = calcKnightMoves(piece, this.board.grid);
        break;
      case "Queen":
        availableMoves = calcQueenMoves(piece, this.board.grid);
        break;
      case "King":
        availableMoves = calcKingMoves(
          piece,
          flag,
          this.board.grid,
          this.state,
          lastTurnHistory,
          this.calculateAvailableMoves
        );
        break;
    }
    return availableMoves;
  }

  changePlayer() {
    this.state.currentPlayer =
      this.state.currentPlayer === this.teams[0]
        ? this.teams[1]
        : this.teams[0];
    console.log(`${this.state.currentPlayer} team's turn!`);
  }

  switchTurn(state = this.state, grid = this.board.grid) {
    const lastTurn = this.turnHistory[this.turnHistory.length - 1];
    this.turnCounter++;
    this.changePlayer();
    isCheckmate(state, grid, lastTurn, this.calculateAvailableMoves)
      ? this.endGame()
      : null;
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
}

export default Game;
