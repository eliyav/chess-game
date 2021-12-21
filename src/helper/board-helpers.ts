import { PieceInitialPoints } from "../component/game-logic/chess-data-import";
import GamePiece from "../component/game-logic/game-piece";

export interface Square {
  square: string;
  on?: GamePiece;
}

const createGrid = (boardSize: number, columnNames: string[][]): Square[][] => {
  return Array.from({ length: boardSize }, (array, idx) =>
    Array.from({ length: boardSize }, (obj, idx2) => ({
      square: columnNames[idx][0] + (idx2 + 1),
      on: undefined,
    }))
  );
};

const setPieces = (
  grid: Square[][],
  pieceInitialPoints: PieceInitialPoints[][],
  movementArray: number[]
) => {
  pieceInitialPoints.forEach((array) =>
    array.forEach((ele) => {
      const { name, color, points } = ele;
      points.forEach((point) => {
        const squareIndex = grid[point[0]][point[1]];
        squareIndex.on = new GamePiece(name, color, point, movementArray);
      });
    })
  );
};

const loadPieces = (grid: Square[][], loadedBoard: Square[][]) => {
  loadedBoard.forEach((array, idx) =>
    array.forEach((square, idx2) => {
      if (square.on !== undefined) {
        const { name, color, point, movement } = square.on;
        const squareIndex = grid[idx][idx2];
        squareIndex.on = new GamePiece(name, color, point, movement);
      }
    })
  );
};

export { setPieces, createGrid, loadPieces };
