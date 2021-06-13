import Board from "./Board";
import { resolveMove, isCheckmate, checkForCastling, annotate, annotateCastling } from "./helper/gameHelpers";
import { setPieces, createGrid } from "./helper/boardHelpers";

class Game {
  constructor(gameData) {
    this.chessData = gameData;
    this.gameState = { ...gameData.initialState };
    this.teams = gameData.teams;
    this.board = new Board(gameData);
    this.history = [];
    this.turnCounter = 1;
  }

  setBoard = () => {
    setPieces(this.board.grid, this.board.data.pieceInitialPoints, this.board.data.movement);
  };

  resetBoard = () => {
    this.board.grid = createGrid(this.board.data.boardSize, this.board.data.columnNames);
    this.setBoard();
    this.gameState.currentPlayer = "White";
    this.history = [];
    this.turnCounter = 1;
    return console.log("Board Has Been Reset!");
  };

  changePlayer = () => {
    this.gameState.currentPlayer = this.gameState.currentPlayer === this.teams[0] ? this.teams[1] : this.teams[0];
    console.log(`${this.gameState.currentPlayer} team's turn!`);
  };

  switchTurn = (gameState = this.gameState, grid = this.board.grid) => {
    this.changePlayer();
    isCheckmate(gameState, grid, this.endGame) ? this.endGame() : null;
  };

  endGame = () => {
    console.log(`Game is over, ${this.gameState.currentPlayer} team wins!`);
    let checkNewGame = "";
    while (checkNewGame !== "Yes" && checkNewGame !== "No") {
      checkNewGame = prompt("Game is over, would you like to play another game? Please type 'Yes' or 'No'");
    }
    checkNewGame === "Yes" || checkNewGame === "yes" || checkNewGame === "YES" ? this.resetBoard() : null;
    checkNewGame === "Yes" || checkNewGame === "yes" || checkNewGame === "YES" ? (this.gameState.currentPlayer = "White") : null;
  };

  movePiece = (originPoint, targetPoint) => {
    const resolve = resolveMove(originPoint, targetPoint, this.gameState, this.board.grid, this.endGame);
    resolve.result
      ? (async () => {
          resolve.turn = this.turnCounter;
          this.turnCounter++;
          let turnHistory = await annotate(resolve, this.gameState, this.board.grid);
          this.history.push(turnHistory);
          console.log(this.history);
        })()
      : null;
    return resolve.result;
  };

  castling = (originPoint, targetPoint) => {
    const resolve = checkForCastling(originPoint, targetPoint, this.gameState, this.board.grid);
    resolve.result
      ? (() => {
          resolve.turn = this.turnCounter;
          this.turnCounter++;
          let turnHistory = annotateCastling(resolve);
          this.history.push(turnHistory);
          console.log(this.history);
        })()
      : null;
    resolve.result ? this.switchTurn() : null;
  };
}

export default Game;
