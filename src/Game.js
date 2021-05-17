import Board from "./Board";

class Game {
  constructor(gameData) {
    this.gameState = { ...gameData.initialState };
    this.teams = gameData.teams;
    this.board = new Board(gameData, this.gameState);
  }

  changePlayer = () => {
    this.gameState.currentPlayer = this.gameState.currentPlayer === this.teams[0] ? this.teams[1] : this.teams[0];
  };
}

export default Game;
