import { createGrid } from "../helper/board-helpers";

interface Data {
  boardSize: number;
  columnNames: string[][];
  teams: string[];
  pieces: string[];
  movement: number[];
  initialState: State;
  pieceInitialPoints: InitialPoints[][];
  gridInitialPoints: InitialPoints[][];
}

type State = {
  currentPlayer: string,
}

interface InitialPoints {
  name: string,
  color: string,
  points: number[][]
}

class Board {
  movementArray: number[];
  pieceInitialPoints: InitialPoints[][];
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
