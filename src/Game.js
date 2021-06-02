import Board from "./Board";
import { resolveMove, isCheckmate } from "./helper/gameHelpers";

class Game {
  constructor(gameData) {
    this.gameState = { ...gameData.initialState };
    this.teams = gameData.teams;
    this.board = new Board(gameData);
  }

  changePlayer = () => {
    this.gameState.currentPlayer = this.gameState.currentPlayer === this.teams[0] ? this.teams[1] : this.teams[0];
  };

  switchTurn = (gameState = this.gameState, grid = this.board.grid) => {
    this.changePlayer();
    isCheckmate(gameState, grid, this.endGame) ? this.endGame() : null;
  };

  endGame = () => {
    console.log(`Game is over, ${this.gameState.currentPlayer} team wins!`);
  };

  movePiece = (sourcePoint, targetPoint) =>
    resolveMove(sourcePoint, targetPoint, this.gameState, this.board.grid, this.endGame) ? this.switchTurn() : null;
}

export default Game;
