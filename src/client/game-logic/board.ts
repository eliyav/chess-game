import chessData from "./chess-data-import";
import GamePiece from "./game-piece";

class Board {
  initialPositions: typeof chessData.initialPositions;
  boardSize: number;
  columnNames: string[];
  grid: Square[][];

  constructor() {
    this.initialPositions = chessData.initialPositions;
    this.boardSize = chessData.boardSize;
    this.columnNames = chessData.columnNames;
    this.grid = this.createGrid();
    this.setPieces();
  }

  setPieces() {
    this.initialPositions.forEach((positions) => {
      const { type } = positions;
      positions.teams.forEach((team) => {
        team.startingPoints.forEach((point) => {
          const [x, y] = point;
          const squareIndex = this.grid[x][y];
          squareIndex.on = new GamePiece({ type, team: team.name, point });
        });
      });
    });
  }

  createGrid(): Square[][] {
    return Array.from({ length: this.boardSize }, (_, idx) =>
      Array.from({ length: this.boardSize }, (_, idx2) => ({
        square: this.columnNames[idx] + (idx2 + 1),
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
