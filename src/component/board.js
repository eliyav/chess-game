import { createGrid } from "../helper/board-helpers";

class Board {
  constructor({ boardSize, pieceInitialPoints, movement, columnNames }) {
    this.movementArray = movement;
    this.pieceInitialPoints = pieceInitialPoints;
    this.boardSize = boardSize;
    this.columnNames = columnNames;
    this.grid = createGrid(this.boardSize, this.columnNames);
  }
}

export default Board;
