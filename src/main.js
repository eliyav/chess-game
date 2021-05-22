import Game from "./Game";
import chessData from "./data/chessDataImport";

function Main() {
  const game = new Game(chessData);
  game.board.setBoard();
  window.game = game;
}

Main();
