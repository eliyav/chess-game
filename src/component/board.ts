import { createGrid } from "../helper/board-helpers";

interface Data {
  boardSize: number;
  columnNames: string[][];
  teams: string[];
  pieces: string[];
  movement: number[];
  initialState: State;
  pieceInitialPoints: PieceInitialPoints[][];
  gridInitialPoints: PieceInitialPoints[][];
}

type State = {
  currentPlayer: string,
}

export interface PieceInitialPoints {
  name: string,
  color: string,
  points: [number,number][]
}

class Board {
  movementArray: number[];
  pieceInitialPoints: PieceInitialPoints[][];
  boardSize: number;
  columnNames: string[][];
  grid;

  constructor({ boardSize, pieceInitialPoints, movement, columnNames}: Data) {
    this.movementArray = movement;
    this.pieceInitialPoints = pieceInitialPoints;
    this.boardSize = boardSize;
    this.columnNames = columnNames;
    this.grid = createGrid(this.boardSize, this.columnNames);
  }
}

export default Board;
