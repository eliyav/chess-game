import {
  EnPassantResult,
  Move,
  PIECE,
  Point,
  TurnHistory,
} from "../../shared/game";
import GamePiece from "../../shared/game-piece";
import { TEAM } from "../../shared/match";
import Board, { type Grid } from "./board";

export type Direction =
  | "up"
  | "down"
  | "right"
  | "left"
  | "upRight"
  | "upLeft"
  | "downRight"
  | "downLeft";

type Movements = {
  [dir in Direction]?: Point[];
};

type LateralMovements = {
  up: Point[];
  down: Point[];
  right: Point[];
  left: Point[];
};

type DiagonalMovements = {
  upRight: Point[];
  upLeft: Point[];
  downRight: Point[];
  downLeft: Point[];
};

export function getPieceMoves({
  board,
  point,
  piece,
  lastTurnHistory,
  calcCastling,
  checkCastling,
}: {
  board: Board;
  point: Point;
  piece: GamePiece;
  lastTurnHistory: TurnHistory | undefined;
  calcCastling: (piece: GamePiece, movesObj: Move[]) => void;
  checkCastling: boolean;
}) {
  switch (piece.type) {
    case PIECE.P:
      return calcPawnMoves(point, piece, board, lastTurnHistory);
    case PIECE.R:
      return calcRookMoves(piece, point, board);
    case PIECE.B:
      return calcBishopMoves(piece, point, board);
    case PIECE.N:
      return calcKnightMoves(piece, point, board);
    case PIECE.Q:
      return calcQueenMoves(piece, point, board);
    case PIECE.K:
      return calcKingMoves(point, piece, board, calcCastling, checkCastling);
  }
}

function calcRookMoves(piece: GamePiece, point: Point, board: Board) {
  const lateralMovements = calcLateralMovements({
    grid: board.grid,
    currentPoint: point,
    movement: piece.movement,
  });
  const finalMoves: Move[] = [];
  getMoves(board, piece.team, lateralMovements, finalMoves);
  return finalMoves;
}

function calcQueenMoves(piece: GamePiece, point: Point, board: Board) {
  const lateralMovements = calcLateralMovements({
    grid: board.grid,
    currentPoint: point,
    movement: piece.movement,
  });
  const diagonalMovements = calcDiagonalMovements(
    board.grid,
    point,
    piece.movement
  );
  const availableMoves: Move[] = [];
  getMoves(board, piece.team, lateralMovements, availableMoves);
  getMoves(board, piece.team, diagonalMovements, availableMoves);
  return availableMoves;
}

function calcPawnMoves(
  point: Point,
  piece: GamePiece,
  board: Board,
  turnHistory: TurnHistory | undefined
) {
  const availableMoves: Move[] = [];
  calcPawnMovement(board, piece, point, availableMoves);
  let result;
  if (turnHistory) {
    result = isEnPassantAvailable(turnHistory);
    if (result.result) {
      const targetSquare = result.enPassantPoint;
      const [x, y] = point;
      const direction = piece.team === "White" ? 1 : -1;
      const x1 = x - 1;
      const x2 = x + 1;
      const newY = y + direction;
      const potential1: Point = [x1, newY];
      const potential2: Point = [x2, newY];
      if (
        doPointsMatch(potential1, targetSquare) ||
        doPointsMatch(potential2, targetSquare)
      ) {
        availableMoves.push([targetSquare, "enPassant"]);
      }
    }
  }
  return availableMoves;
}

function calcKnightMoves(piece: GamePiece, point: Point, board: Board) {
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
  calcKnightMovement(board, point, piece.team, knightMoves, availableMoves);

  return availableMoves;
}

function calcKingMoves(
  point: Point,
  piece: GamePiece,
  board: Board,
  calcCastling: (piece: GamePiece, movesObj: Move[]) => void,
  checkCastling: boolean
) {
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

  calcKingMovements(board, point, piece.team, kingMoves, availableMoves);

  if (!piece.moved) {
    checkCastling ? calcCastling(piece, availableMoves) : null;
  }

  return availableMoves;
}

function calcBishopMoves(piece: GamePiece, point: Point, board: Board) {
  const availableMoves: Move[] = [];
  const diagonalMovements = calcDiagonalMovements(
    board.grid,
    point,
    piece.movement
  );
  getMoves(board, piece.team, diagonalMovements, availableMoves);
  return availableMoves;
}

//Filters the moves from the final movements object and enters them in the available moves array
const getMoves = (
  board: Board,
  team: TEAM,
  movesObj: Movements,
  targetArray: Move[]
) => {
  const movementsArrays = Object.values(movesObj);
  movementsArrays.forEach((array) => {
    for (let i = 0; i < array.length; i++) {
      const point = array[i];
      const pieceOnPoint = board.getPiece(point);
      if (pieceOnPoint) {
        if (pieceOnPoint.team !== team) {
          targetArray.push([array[i], "capture"]);
          break;
        } else if (pieceOnPoint.team === team) {
          break;
        }
      } else {
        targetArray.push([array[i], "movement"]);
      }
    }
  });
};

//Calculates Horizontal Movements by calculating each direction from the current point and adds them to the final movements object
const calcDiagonalMovements = (
  grid: Grid,
  currentPoint: Point,
  movement: number[]
) => {
  const finalObj: DiagonalMovements = {
    upRight: [],
    upLeft: [],
    downRight: [],
    downLeft: [],
  };
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
  return finalObj;
};

//Calculates Vertical Movements by calculating each direction from the current point and adds them to the final movements object
const calcLateralMovements = ({
  grid,
  currentPoint,
  movement,
}: {
  grid: Grid;
  currentPoint: Point;
  movement: number[];
}) => {
  const finalObj: LateralMovements = {
    up: [],
    down: [],
    right: [],
    left: [],
  };
  for (const key of Object.keys(finalObj)) {
    switch (key) {
      case "up":
        calcUp(grid, currentPoint, movement, finalObj[key]);
        break;
      case "down":
        calcDown(grid, currentPoint, movement, finalObj[key]);
        break;
      case "right":
        calcRight(grid, currentPoint, movement, finalObj[key]);
        break;
      case "left":
        calcLeft(grid, currentPoint, movement, finalObj[key]);
        break;
      default:
        throw new Error(
          "Unknown vertical movement, please use up, down, right, left as key names for finalObj"
        );
    }
  }
  return finalObj;
};

const calcPawnMovement = (
  board: Board,
  piece: GamePiece,
  point: Point,
  finalObj: Move[]
) => {
  const { direction, moved, team } = piece;
  //Calculate Pawn Movement based on current point
  let range = 1;
  const [x, y] = point;
  const movePoint1: Point = [x, y + range * direction];
  const [moveX, moveY] = movePoint1;
  if (!board.getPiece(movePoint1)) {
    bounds(moveX, board.grid) && bounds(moveY, board.grid)
      ? finalObj.push([movePoint1, "movement"])
      : null;
    //If he hasnt moved, then can move 2 spaces
    if (!moved) {
      range = 2;
      const movePoint2: Point = [x, y + range * direction];
      const [moveX2, moveY2] = movePoint2;
      if (!board.getPiece(movePoint2)) {
        bounds(moveX2, board.grid) && bounds(moveY2, board.grid)
          ? finalObj.push([movePoint2, "movement"])
          : null;
      }
    }
  }

  //Calculates Capture points and pushes them in final movement obj if are valid
  const capturePoint1: Point = [x - direction, y + direction];
  const capturePoint2: Point = [x + direction, y + direction];
  checkForValidPawnCapture(capturePoint1, team, board, finalObj);
  checkForValidPawnCapture(capturePoint2, team, board, finalObj);
};

const checkForValidPawnCapture = (
  capturePoint: Point,
  team: string,
  board: Board,
  finalObj: Move[]
) => {
  const [captureX, captureY] = capturePoint;
  if (bounds(captureX, board.grid) && bounds(captureY, board.grid)) {
    const pieceOnPoint = board.getPiece(capturePoint);
    !pieceOnPoint
      ? null
      : pieceOnPoint.team !== team
      ? finalObj.push([capturePoint, "capture"])
      : null;
  }
};

const calcKnightMovement = (
  board: Board,
  currentPoint: number[],
  team: TEAM,
  moves: Point[],
  finalObj: Move[]
) => {
  let [x, y] = currentPoint;
  moves.forEach((move) => {
    const [moveX, moveY] = move;
    const resultX = x + moveX;
    const resultY = y + moveY;
    if (bounds(resultX, board.grid) && bounds(resultY, board.grid)) {
      const result: Point = [resultX, resultY];
      const pieceOnPoint = board.getPiece(result);
      if (pieceOnPoint) {
        pieceOnPoint.team !== team ? finalObj.push([result, "capture"]) : null;
      } else {
        finalObj.push([result, "movement"]);
      }
    }
  });
};

const calcKingMovements = (
  board: Board,
  currentPoint: Point,
  team: string,
  moves: Point[],
  finalObj: Move[]
) => {
  let [x, y] = currentPoint;
  moves.forEach((move) => {
    const [moveX, moveY] = move;
    const resultX = x + moveX;
    const resultY = y + moveY;
    if (bounds(resultX, board.grid) && bounds(resultY, board.grid)) {
      const result: Point = [resultX, resultY];
      const pieceOnPoint = board.getPiece(result);
      if (pieceOnPoint) {
        pieceOnPoint.team !== team ? finalObj.push([result, "capture"]) : null;
      } else {
        finalObj.push([result, "movement"]);
      }
    }
  });
};

const bounds = (num: number, grid: Grid) => num >= 0 && num <= grid.length - 1;

const calcUpRight = (
  grid: Grid,
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  movement.forEach((move) => {
    let upRightX = x + move;
    let upRightY = y + move;
    bounds(upRightX, grid) && bounds(upRightY, grid)
      ? finalObj.push([upRightX, upRightY])
      : null;
  });
};

const calcUpLeft = (
  grid: Grid,
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  movement.forEach((move) => {
    let upLeftX = x - move;
    let upLeftY = y + move;
    bounds(upLeftX, grid) && bounds(upLeftY, grid)
      ? finalObj.push([upLeftX, upLeftY])
      : null;
  });
};

const calcDownRight = (
  grid: Grid,
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  movement.forEach((move) => {
    let downRightX = x + move;
    let downRightY = y - move;
    bounds(downRightX, grid) && bounds(downRightY, grid)
      ? finalObj.push([downRightX, downRightY])
      : null;
  });
};

const calcDownLeft = (
  grid: Grid,
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  movement.forEach((move) => {
    let downLeftX = x - move;
    let downLeftY = y - move;
    bounds(downLeftX, grid) && bounds(downLeftY, grid)
      ? finalObj.push([downLeftX, downLeftY])
      : null;
  });
};

const calcUp = (
  grid: Grid,
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  movement.forEach((move) => {
    let upY = y + move;
    bounds(upY, grid) ? finalObj.push([x, upY]) : null;
  });
};

const calcDown = (
  grid: Grid,
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  movement.forEach((move) => {
    let downY = y - move;
    bounds(downY, grid) ? finalObj.push([x, downY]) : null;
  });
};

const calcRight = (
  grid: Grid,
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  movement.forEach((move) => {
    let rightX = x + move;
    bounds(rightX, grid) ? finalObj.push([rightX, y]) : null;
  });
};

const calcLeft = (
  grid: Grid,
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  movement.forEach((move) => {
    let leftX = x - move;
    bounds(leftX, grid) ? finalObj.push([leftX, y]) : null;
  });
};

export const isEnPassantAvailable = (
  turnHistory: TurnHistory
): EnPassantResult => {
  let moved;
  let direction;
  let noMove = -1;
  let x = noMove;
  let y = noMove;
  if (turnHistory.originPiece.type === "Pawn") {
    const targetY = turnHistory.target[1];
    const originY = turnHistory.origin[1];
    moved = Math.abs(targetY - originY);
    direction = turnHistory.originPiece.team === TEAM.WHITE ? 1 : -1;
    x = turnHistory.target[0];
    y = turnHistory.origin[1] + direction;
  }
  return {
    result: moved === 2 ? true : false,
    enPassantPoint: [x, y],
  };
};

export const doPointsMatch = (point: Point, point2: Point) =>
  point[0] == point2[0] && point[1] == point2[1];
