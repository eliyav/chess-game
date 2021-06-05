import Board from "./Board";
import { resolveMove, isCheckmate, checkForCastling } from "./helper/gameHelpers";

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
    //Remove after all testing done
    console.log(this.board.grid);
  };

  endGame = async () => {
    console.log(`Game is over, ${this.gameState.currentPlayer} team wins!`);
    let checkNewGame = "";
    while (checkNewGame !== "Yes" && checkNewGame !== "No") {
      checkNewGame = await prompt("Game is over, would you like to play another game? Please type 'Yes' or 'No'");
    }
    checkNewGame === "Yes" ? this.board.resetBoard() : null;
  };

  movePiece = (originPoint, targetPoint) =>
    resolveMove(originPoint, targetPoint, this.gameState, this.board.grid, this.endGame) ? this.switchTurn() : null;

  castling = (originPoint, targetPoint) => {
    checkForCastling(originPoint, targetPoint, this.gameState, this.board.grid) ? this.switchTurn() : null;
  };
}

export default Game;
