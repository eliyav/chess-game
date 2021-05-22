import { setPieces, createGrid, validateMove } from "./helper/boardFunctions";

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

  setBoard = () => {
    setPieces(this.grid, this.data.pieceInitialPoints, this.data.movement);
  };

  resetBoard = () => {
    this.grid = createGrid(this.data.boardSize, this.data.columnNames);
    this.setBoard();
  };
}

export default Board;
