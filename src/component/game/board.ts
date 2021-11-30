import { createGrid, Square } from "../../helper/board-helpers";
import {Data, PieceInitialPoints} from "../../data/chess-data-import"

class Board {
  movementArray: number[];
  pieceInitialPoints: PieceInitialPoints[][];
  boardSize: number;
  columnNames: string[][];
  grid: Square[][];

  constructor({ boardSize, pieceInitialPoints, movement, columnNames}: Data) {
    this.movementArray = movement;
    this.pieceInitialPoints = pieceInitialPoints;
    this.boardSize = boardSize;
    this.columnNames = columnNames;
    this.grid = createGrid(this.boardSize, this.columnNames);
  }
}

export default Board;
