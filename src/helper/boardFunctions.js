import Pawn from "../component/Pawn";
import Rook from "../component/Rook";
import Bishop from "../component/Bishop";
import Knight from "../component/Knight";
import King from "../component/King";
import Queen from "../component/Queen";

const classes = { Pawn, Rook, Bishop, Knight, King, Queen };

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
      let { name, color, points } = ele;
      points.forEach((point) => {
        let squareIndex = grid[point[0]][point[1]];
        squareIndex.on = new classes[name](name, color, point, movement);
      });
    })
  );
};

export { setPieces, createGrid };
