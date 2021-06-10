import Board from "./Board";
import { resolveMove, isCheckmate, checkForCastling } from "./helper/gameHelpers";
import { setPieces, createGrid } from "./helper/boardHelpers";
import assetTransforms from "./view/assetTransforms";
import { updateScene } from "./helper/canvasHelpers";

class Game {
  constructor(gameData, scene) {
    this.chessData = gameData;
    this.gameState = { ...gameData.initialState };
    this.teams = gameData.teams;
    this.board = new Board(gameData);
    this.scene = scene;
  }

  setBoard = () => {
    setPieces(this.board.grid, this.board.data.pieceInitialPoints, this.board.data.movement);
  };

  resetBoard = () => {
    this.board.grid = createGrid(this.board.data.boardSize, this.board.data.columnNames);
    this.setBoard();
    this.gameState.currentPlayer = "White";
    assetTransforms(this.scene.finalMeshList, this.chessData);
    return console.log("Board Has Been Reset!");
  };

  changePlayer = () => {
    this.gameState.currentPlayer = this.gameState.currentPlayer === this.teams[0] ? this.teams[1] : this.teams[0];
  };

  switchTurn = (gameState = this.gameState, grid = this.board.grid) => {
    this.changePlayer();
    isCheckmate(gameState, grid, this.endGame) ? this.endGame() : null;
  };

  endGame = async () => {
    console.log(`Game is over, ${this.gameState.currentPlayer} team wins!`);
    let checkNewGame = "";
    while (checkNewGame !== "Yes" && checkNewGame !== "No") {
      checkNewGame = await prompt("Game is over, would you like to play another game? Please type 'Yes' or 'No'");
    }
    checkNewGame === "Yes" ? this.resetBoard() : null;
    //set player to white team
  };

  movePiece = (originPoint, targetPoint) =>
    resolveMove(originPoint, targetPoint, this.gameState, this.board.grid, this.scene, this.endGame);

  castling = (originPoint, targetPoint) => {
    checkForCastling(originPoint, targetPoint, this.gameState, this.board.grid) ? this.switchTurn() : null;
  };
}

export default Game;
