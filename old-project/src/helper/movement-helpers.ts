import {
  TurnHistory,
  isEnPassantAvailable,
  doMovesMatch,
} from "./game-helpers";
import { Square } from "../components/game-logic/board";
import GamePiece, { Move } from "../components/game-logic/game-piece";

type MovesObj = {
  up?: Point[];
  down?: Point[];
  right?: Point[];
  left?: Point[];
  upRight?: Point[];
  upLeft?: Point[];
  downRight?: Point[];
  downLeft?: Point[];
};

const calcRookMoves = (piece: GamePiece, grid: Square[][]) => {
  const availableMoves: Move[] = [];
  const verticalMovements = {
    up: [],
    down: [],
    right: [],
    left: [],
  };

  piece.movement.forEach((move) => {
    calcVerticalMovements(grid, piece.point, move, verticalMovements);
  });

  filterToFinalMoves(grid, piece.color, verticalMovements, availableMoves);

  return availableMoves;
};

const calcQueenMoves = (piece: GamePiece, grid: Square[][]) => {
  const availableMoves: Move[] = [];
  const verticalMovements = {
    up: [],
    down: [],
    right: [],
    left: [],
  };
  const horizantalMovements = {
    upRight: [],
    upLeft: [],
    downRight: [],
    downLeft: [],
  };

  piece.movement.forEach((move) => {
    calcVerticalMovements(grid, piece.point, move, verticalMovements);
    calcHorizontalMovements(grid, piece.point, move, horizantalMovements);
  });

  filterToFinalMoves(grid, piece.color, verticalMovements, availableMoves);
  filterToFinalMoves(grid, piece.color, horizantalMovements, availableMoves);

  return availableMoves;
};

const calcPawnMoves = (
  piece: GamePiece,
  boolean: boolean,
  grid: Square[][],
  turnHistory: TurnHistory
) => {
  const availableMoves: Move[] = [];

  calcPawnMovement(grid, piece, availableMoves);
  if (boolean) {
    let result;
    if (turnHistory !== undefined) {
      result = isEnPassantAvailable(turnHistory);
      if (result.result) {
        const targetSquare = result.enPassantPoint;
        const [x, y] = piece.point;
        const direction = piece.color === "White" ? 1 : -1;
        const x1 = x - 1;
        const x2 = x + 1;
        const newY = y + direction;
        const potential1: Point = [x1, newY];
        const potential2: Point = [x2, newY];
        if (
          doMovesMatch(potential1, targetSquare) ||
          doMovesMatch(potential2, targetSquare)
        ) {
          availableMoves.push([targetSquare, "enPassant"]);
        }
      }
    }
  }
  return availableMoves;
};

const calcKnightMoves = (piece: GamePiece, grid: Square[][]) => {
  const knightMoves: Point[] = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, 2],
    [-2, 1],
    [-2, -1],
    [-1, -2],
  ];

  const availableMoves: Move[] = [];

  calcKnightMovement(
    grid,
    piece.point,
    piece.color,
    knightMoves,
    availableMoves
  );

  return availableMoves;
};

const calcKingMoves = (
  piece: GamePiece,
  castling: boolean,
  grid: Square[][],
  calcCastling: (piece: GamePiece, movesObj: Move[]) => void
) => {
  const kingMoves: Point[] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
  ];

  const availableMoves: Move[] = [];

  calcKingMovements(grid, piece.point, piece.color, kingMoves, availableMoves);

  if (!piece.moved) {
    castling ? calcCastling(piece, availableMoves) : null;
  }

  return availableMoves;
};

const calcBishopMoves = (piece: GamePiece, grid: Square[][]) => {
  const availableMoves: Move[] = [];
  const horizantalMovements = {
    upRight: [],
    upLeft: [],
    downRight: [],
    downLeft: [],
  };

  piece.movement.forEach((move) => {
    calcHorizontalMovements(grid, piece.point, move, horizantalMovements);
  });

  filterToFinalMoves(grid, piece.color, horizantalMovements, availableMoves);

  return availableMoves;
};

//Filters the moves from the final movements object and enters them in the available moves array
const filterToFinalMoves = (
  grid: Square[][],
  color: string,
  movesObj: MovesObj,
  targetArray: Move[]
) => {
  const movementsArrays = Object.values(movesObj);
  movementsArrays.forEach((array) => {
    for (let i = 0; i < array.length; i++) {
      let [x, y] = array[i];
      const square = grid[x][y];
      if (square.on !== undefined) {
        if (square.on.color !== color) {
          targetArray.push([array[i], "capture"]);
          break;
        } else if (square.on.color === color) {
          break;
        }
      } else {
        targetArray.push([array[i], "movement"]);
      }
    }
  });
};

//Calculates Horizontal Movements by calculating each direction from the current point and adds them to the final movements object
const calcHorizontalMovements = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: MovesObj
) => {
  for (const [key, value] of Object.entries(finalObj)) {
    const moves: Point[] = value;
    switch (key) {
      case "upRight":
        calcUpRight(grid, currentPoint, movement, moves);
        break;
      case "upLeft":
        calcUpLeft(grid, currentPoint, movement, moves);
        break;
      case "downRight":
        calcDownRight(grid, currentPoint, movement, moves);
        break;
      case "downLeft":
        calcDownLeft(grid, currentPoint, movement, moves);
        break;
      default:
        throw new Error(
          "Unknown horizontal movement, please use upRight, upLeft, downRight, downLeft as key names for finalObj"
        );
    }
  }
};

//Calculates Vertical Movements by calculating each direction from the current point and adds them to the final movements object
const calcVerticalMovements = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: MovesObj
) => {
  for (const [key, value] of Object.entries(finalObj)) {
    const moves: Point[] = value;
    switch (key) {
      case "up":
        calcUp(grid, currentPoint, movement, moves);
        break;
      case "down":
        calcDown(grid, currentPoint, movement, moves);
        break;
      case "right":
        calcRight(grid, currentPoint, movement, moves);
        break;
      case "left":
        calcLeft(grid, currentPoint, movement, moves);
        break;
      default:
        throw new Error(
          "Unknown vertical movement, please use up, down, right, left as key names for finalObj"
        );
    }
  }
};

const calcPawnMovement = (
  grid: Square[][],
  piece: GamePiece,
  finalObj: Move[]
) => {
  const { point, direction, moved, color } = piece;
  //Calculate Pawn Movement based on current point
  let range = 1;
  const [x, y] = point;
  const movePoint1: Point = [x, y + range * direction];
  const [moveX, moveY] = movePoint1;
  if (grid[moveX][moveY]) {
    if (grid[moveX][moveY].on === undefined) {
      bounds(moveX, grid) && bounds(moveY, grid)
        ? finalObj.push([movePoint1, "movement"])
        : null;
      //If he hasnt moved, then can move 2 spaces
      if (!moved) {
        range = 2;
        const movePoint2: Point = [x, y + range * direction];
        const [moveX2, moveY2] = movePoint2;
        if (grid[moveX2][moveY2].on === undefined) {
          bounds(moveX2, grid) && bounds(moveY2, grid)
            ? finalObj.push([movePoint2, "movement"])
            : null;
        }
      }
    }
  }

  //Calculates Capture points and pushes them in final movement obj if are valid
  const capturePoint1: Point = [x - direction, y + direction];
  const capturePoint2: Point = [x + direction, y + direction];
  checkForValidPawnCapture(capturePoint1, color, grid, finalObj);
  checkForValidPawnCapture(capturePoint2, color, grid, finalObj);
};

const checkForValidPawnCapture = (
  capturePoint: Point,
  color: string,
  grid: Square[][],
  finalObj: Move[]
) => {
  const [captureX, captureY] = capturePoint;
  if (bounds(captureX, grid) && bounds(captureY, grid)) {
    const captureSquare = grid[captureX][captureY];
    captureSquare.on === undefined
      ? null
      : captureSquare.on.color !== color
      ? finalObj.push([capturePoint, "capture"])
      : null;
  }
};

const calcKnightMovement = (
  grid: Square[][],
  currentPoint: number[],
  color: string,
  moves: Point[],
  finalObj: Move[]
) => {
  let [x, y] = currentPoint;
  moves.forEach((move) => {
    const [moveX, moveY] = move;
    const resultX = x + moveX;
    const resultY = y + moveY;
    if (bounds(resultX, grid) && bounds(resultY, grid)) {
      const square = grid[resultX][resultY];
      const result: Point = [resultX, resultY];
      if (square.on !== undefined) {
        square.on.color !== color ? finalObj.push([result, "capture"]) : null;
      } else {
        finalObj.push([result, "movement"]);
      }
    }
  });
};

const calcKingMovements = (
  grid: Square[][],
  currentPoint: Point,
  color: string,
  moves: Point[],
  finalObj: Move[]
) => {
  let [x, y] = currentPoint;
  moves.forEach((move) => {
    const [moveX, moveY] = move;
    const resultX = x + moveX;
    const resultY = y + moveY;
    if (bounds(resultX, grid) && bounds(resultY, grid)) {
      const square = grid[resultX][resultY];
      const result: Point = [resultX, resultY];
      if (square.on !== undefined) {
        square.on.color !== color ? finalObj.push([result, "capture"]) : null;
      } else {
        finalObj.push([result, "movement"]);
      }
    }
  });
};

const bounds = (num: number, grid: Square[][]) =>
  num >= grid.length - grid.length && num <= grid.length - 1;

const calcUpRight = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let upRightX = x + movement;
  let upRightY = y + movement;
  bounds(upRightX, grid) && bounds(upRightY, grid)
    ? finalObj.push([upRightX, upRightY])
    : null;
};

const calcUpLeft = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let upLeftX = x - movement;
  let upLeftY = y + movement;
  bounds(upLeftX, grid) && bounds(upLeftY, grid)
    ? finalObj.push([upLeftX, upLeftY])
    : null;
};

const calcDownRight = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let downRightX = x + movement;
  let downRightY = y - movement;
  bounds(downRightX, grid) && bounds(downRightY, grid)
    ? finalObj.push([downRightX, downRightY])
    : null;
};

const calcDownLeft = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let downLeftX = x - movement;
  let downLeftY = y - movement;
  bounds(downLeftX, grid) && bounds(downLeftY, grid)
    ? finalObj.push([downLeftX, downLeftY])
    : null;
};

const calcUp = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let upY = y + movement;
  bounds(upY, grid) ? finalObj.push([x, upY]) : null;
};

const calcDown = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let downY = y - movement;
  bounds(downY, grid) ? finalObj.push([x, downY]) : null;
};

const calcRight = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let rightX = x + movement;
  bounds(rightX, grid) ? finalObj.push([rightX, y]) : null;
};

const calcLeft = (
  grid: Square[][],
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let leftX = x - movement;
  bounds(leftX, grid) ? finalObj.push([leftX, y]) : null;
};

export {
  calcBishopMoves,
  calcKingMoves,
  calcKnightMoves,
  calcPawnMoves,
  calcQueenMoves,
  calcRookMoves,
};
