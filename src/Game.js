import Board from "./Board";
import { resolveMove } from "./helper/gameStateFunctions/";

class Game {
  constructor(gameData) {
    this.gameState = { ...gameData.initialState };
    this.teams = gameData.teams;
    this.board = new Board(gameData);
  }

  changePlayer = () => {
    this.gameState.currentPlayer = this.gameState.currentPlayer === this.teams[0] ? this.teams[1] : this.teams[0];
  };

  movePiece = (sourcePoint, targetPoint) => {
    if (resolveMove(sourcePoint, targetPoint, this.gameState, this.board.grid)) this.changePlayer();
  };
}

export default Game;
