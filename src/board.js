import { createGrid } from "./helper/board-helpers";

class Board {
  constructor({ boardSize, pieceInitialPoints, movement, columnNames }) {
    this.data = {
      movement: movement,
      pieceInitialPoints: pieceInitialPoints,
      boardSize: boardSize,
      columnNames: columnNames,
    };
    this.grid = createGrid(this.data.boardSize, this.data.columnNames);
  }
}

export default Board;
