import { setPieces, createGrid } from "./helper/boardHelpers";

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
    return console.log("Board Has Been Reset!");
  };

  createBoardSnapshot = () => {
    const grid = this.grid;
    return [([...grid[0]], [...grid[1]], [...grid[2]], [...grid[3]], [...grid[4]], [...grid[5]], [...grid[6]], [...grid[7]])];
  };
}

export default Board;
