import Game from "./Game";
import chessData from "./data/chessDataImport";
import { setPieces } from "./helper/boardFunctions";

function Main() {
  const game = new Game(chessData);
  game.board.setBoard();
  game.board.movePoints([0, 1], [0, 2]);
  console.log(game);
}

Main();
