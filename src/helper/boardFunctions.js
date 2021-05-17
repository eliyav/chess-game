import Pawn from "../classes/Pawn";
import Rook from "../classes/Rook";
import Bishop from "../classes/Bishop";
import Knight from "../classes/Knight";
import King from "../classes/King";
import Queen from "../classes/Queen";

const classes = { Pawn, Rook, Bishop, Knight, King, Queen };

const getX = (point) => {
  const [x, y] = point;
  return x;
};

const getY = (point) => {
  const [x, y] = point;
  return y;
};

const isValidMove = (move, endPoint) => getX(move) == getX(endPoint) && getY(move) == getY(endPoint);

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

const checkCurrentKingForCheck = (gameState, grid, enemyAvailableMoves) => {
  const findKing = grid.map((array) => {
    const findArray = array.find((ele) => {
      if (ele.on !== undefined) {
        if (ele.on.name === "King" && ele.on.color === gameState.currentPlayer) {
          return true;
        }
      }
    });
    return findArray;
  });
  const king = findKing.filter((ele) => ele !== undefined);
  const kingPoint = king[0].on.point;
  const findMatch = enemyAvailableMoves.map((array) => {
    const findArray = array.find((point) => {
      if (isValidMove(point, kingPoint)) {
        return true;
      }
    });
    return findArray;
  });
  const isMatch = findMatch.filter((point) => point !== undefined);
  if (isMatch.length > 0) {
    return true;
  } else {
    return false;
  }
};

const isKingCheckedAfterMove = (sourcePoint, targetPoint, gameState, grid) => {
  const clonedGrid = [...grid];
  const enemyPieces = clonedGrid.map((array) => {
    let filteredArray = array.filter((ele) => {
      if (typeof ele.on === "object") {
        if (ele.on.color !== gameState.currentPlayer) {
          return true;
        } else {
          return false;
        }
      }
    });
    return filteredArray;
  });
  const enemyAvailableMoves = [];
  enemyPieces.forEach((array) => {
    array.forEach((piece) => {
      let moveArray = piece.on.calculateAvailableMoves(piece.on.point, grid);
      if (moveArray.length > 0) enemyAvailableMoves.push(moveArray);
    });
  });
  //Change enemyAvailableMoves to one array----------------
  if (checkCurrentKingForCheck(gameState, grid, enemyAvailableMoves)) {
    return true;
  } else {
    return false;
  }
};

const validateMove = (sourcePoint, targetPoint, gameState, grid) => {
  const sourcePiece = grid[getX(sourcePoint)][getY(sourcePoint)].on;
  //Check if Piece belongs to currentPlayer
  if (sourcePiece.color === gameState.currentPlayer) {
    const availMoves = sourcePiece.calculateAvailableMoves(sourcePoint, grid);
    const validMove = availMoves.find((point) => isValidMove(point, targetPoint));
    //Check if the entered targetPoint was a valid move
    if (validMove) {
      if (isKingCheckedAfterMove(sourcePoint, targetPoint, gameState, grid)) {
        return console.log("King will checked if move is resolved");
      } else {
        return console.log("Move is Valid! Updating the Board.");
        //update grid-----
      }
    } else {
      return console.log(`Target point, ${targetPoint}, is not an available move!`);
    }
  } else {
    return console.log(`Piece doesn't belong to the ${gameState.currentPlayer} team!`);
  }
};

export { setPieces, createGrid, validateMove };
