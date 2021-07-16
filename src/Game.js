import Board from "./board";
import { resolveMove, isCheckmate, annotate } from "./helper/game-helpers";
import { setPieces, createGrid } from "./helper/board-helpers";
import chessData from "./data/chess-data-import";

class Game {
  constructor() {
    this.chessData = chessData;
    this.gameState = chessData.initialState;
    this.teams = chessData.teams;
    this.board = new Board(chessData);
    this.history = [];
    this.rawHistoryData = [];
    this.turnCounter = 1;
    this.player;
    //this.timer = new Timer(this.gameState);
  }

  playerMove(originPoint, targetPoint) {
    const lastTurn = this.rawHistoryData[this.rawHistoryData.length - 1];
    const resolve = resolveMove(originPoint, targetPoint, this.gameState, this.board.grid, lastTurn, this.endGame);
    resolve.result
      ? (() => {
          resolve.turn = this.turnCounter;
          this.turnCounter++;
          let turnHistory = annotate(resolve, this.gameState, this.board.grid);
          this.history.push(turnHistory);
          this.rawHistoryData.push(resolve);
        })()
      : null;

    return resolve.result;
  }

  changePlayer() {
    this.gameState.currentPlayer = this.gameState.currentPlayer === this.teams[0] ? this.teams[1] : this.teams[0];
    console.log(`${this.gameState.currentPlayer} team's turn!`);
  }

  switchTurn(gameState = this.gameState, grid = this.board.grid) {
    this.changePlayer();
    isCheckmate(gameState, grid, this.endGame) ? this.endGame() : null;
  }

  endGame() {
    alert(`Game is over, ${this.gameState.currentPlayer} team wins!`);
  }

  setBoard() {
    setPieces(this.board.grid, this.board.data.pieceInitialPoints, this.board.data.movement);
  }

  resetBoard() {
    this.board.grid = createGrid(this.board.data.boardSize, this.board.data.columnNames);
    this.setBoard();
    this.gameState.currentPlayer = "White";
    this.history = [];
    this.rawHistoryData = [];
    this.turnCounter = 1;
    return console.log("Board Has Been Reset!");
  }
}

export default Game;
