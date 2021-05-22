import Pawn from "../classes/Pawn";
import Rook from "../classes/Rook";
import Bishop from "../classes/Bishop";
import Knight from "../classes/Knight";
import King from "../classes/King";
import Queen from "../classes/Queen";

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
