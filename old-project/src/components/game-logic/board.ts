import chessData from "./chess-data-import";
import GamePiece from "./game-piece";

class Board {
  movementArray: number[];
  pieceInitialPoints: typeof chessData.pieceInitialPoints;
  boardSize: number;
  columnNames: string[][];
  grid: Square[][];

  constructor() {
    this.movementArray = chessData.movement;
    this.pieceInitialPoints = chessData.pieceInitialPoints;
    this.boardSize = chessData.boardSize;
    this.columnNames = chessData.columnNames;
    this.grid = this.createGrid();
    this.setPieces();
  }

  setPieces() {
    this.pieceInitialPoints.forEach((array) =>
      array.forEach((ele) => {
        const { name, color, points } = ele;
        points.forEach((point) => {
          const squareIndex = this.grid[point[0]][point[1]];
          squareIndex.on = new GamePiece(
            name,
            color,
            point,
            this.movementArray
          );
        });
      })
    );
  }

  createGrid(): Square[][] {
    return Array.from({ length: this.boardSize }, (array, idx) =>
      Array.from({ length: this.boardSize }, (obj, idx2) => ({
        square: this.columnNames[idx][0] + (idx2 + 1),
        on: undefined,
      }))
    );
  }

  resetBoard() {
    this.grid = this.createGrid();
    this.setPieces();
  }
}

export default Board;

export interface Square {
  square: string;
  on?: GamePiece;
}
