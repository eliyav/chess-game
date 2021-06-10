import Pawn from "../component/game-pieces/Pawn";
import Rook from "../component/game-pieces/Rook";
import Bishop from "../component/game-pieces/Bishop";
import Knight from "../component/game-pieces/Knight";
import King from "../component/game-pieces/King";
import Queen from "../component/game-pieces/Queen";

const pieceClasses = { Pawn, Rook, Bishop, Knight, King, Queen };

const createGrid = (boardSize, columnNames) => {
  return Array.from({ length: boardSize }, (array, idx) =>
    Array.from({ length: boardSize }, (obj, idx2) => ({
      square: columnNames[idx][0] + (idx2 + 1),
      on: undefined,
    }))
  );
};

const setPieces = (grid, pieceInitialPoints, movement) => {
  pieceInitialPoints.forEach((array) =>
    array.forEach((ele) => {
      const { name, color, points } = ele;
      points.forEach((point) => {
        const squareIndex = grid[point[0]][point[1]];
        squareIndex.on = new pieceClasses[name](name, color, point, movement);
      });
    })
  );
};

export { setPieces, createGrid, pieceClasses };
