import { Move, Point } from "../../shared/game";
import { TEAM } from "../../shared/match";
import Board, { type Grid } from "./board";
import {
  TurnHistory,
  doMovesMatch,
  isEnPassantAvailable,
} from "./game-helpers";
import GamePiece from "./game-piece";

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

const calcRookMoves = (piece: GamePiece, board: Board) => {
  const availableMoves: Move[] = [];
  const verticalMovements = {
    up: [],
    down: [],
    right: [],
    left: [],
  };

  piece.movement.forEach((move) => {
    calcVerticalMovements(board.grid, piece.point, move, verticalMovements);
  });

  filterToFinalMoves(board, piece.team, verticalMovements, availableMoves);

  return availableMoves;
};

const calcQueenMoves = (piece: GamePiece, board: Board) => {
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
    calcVerticalMovements(board.grid, piece.point, move, verticalMovements);
    calcHorizontalMovements(board.grid, piece.point, move, horizantalMovements);
  });

  filterToFinalMoves(board, piece.team, verticalMovements, availableMoves);
  filterToFinalMoves(board, piece.team, horizantalMovements, availableMoves);

  return availableMoves;
};

const calcPawnMoves = (
  piece: GamePiece,
  boolean: boolean,
  board: Board,
  turnHistory: TurnHistory
) => {
  const availableMoves: Move[] = [];

  calcPawnMovement(board, piece, availableMoves);
  if (boolean) {
    let result;
    if (turnHistory !== undefined) {
      result = isEnPassantAvailable(turnHistory);
      if (result.result) {
        const targetSquare = result.enPassantPoint;
        const [x, y] = piece.point;
        const direction = piece.team === "White" ? 1 : -1;
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

const calcKnightMoves = (piece: GamePiece, board: Board) => {
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
    board,
    piece.point,
    piece.team,
    knightMoves,
    availableMoves
  );

  return availableMoves;
};

const calcKingMoves = (
  piece: GamePiece,
  castling: boolean,
  board: Board,
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

  calcKingMovements(board, piece.point, piece.team, kingMoves, availableMoves);

  if (!piece.moved) {
    castling ? calcCastling(piece, availableMoves) : null;
  }

  return availableMoves;
};

const calcBishopMoves = (piece: GamePiece, board: Board) => {
  const availableMoves: Move[] = [];
  const horizantalMovements = {
    upRight: [],
    upLeft: [],
    downRight: [],
    downLeft: [],
  };

  piece.movement.forEach((move) => {
    calcHorizontalMovements(board.grid, piece.point, move, horizantalMovements);
  });

  filterToFinalMoves(board, piece.team, horizantalMovements, availableMoves);

  return availableMoves;
};

//Filters the moves from the final movements object and enters them in the available moves array
const filterToFinalMoves = (
  board: Board,
  team: TEAM,
  movesObj: MovesObj,
  targetArray: Move[]
) => {
  const movementsArrays = Object.values(movesObj);
  movementsArrays.forEach((array) => {
    for (let i = 0; i < array.length; i++) {
      const point = array[i];
      const pieceOnPoint = board.getPieceByPoint(point);
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
const calcHorizontalMovements = (
  grid: Grid,
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
  grid: Grid,
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

const calcPawnMovement = (board: Board, piece: GamePiece, finalObj: Move[]) => {
  const { point, direction, moved, team } = piece;
  //Calculate Pawn Movement based on current point
  let range = 1;
  const [x, y] = point;
  const movePoint1: Point = [x, y + range * direction];
  const [moveX, moveY] = movePoint1;
  if (!board.getPieceByPoint(movePoint1)) {
    bounds(moveX, board.grid) && bounds(moveY, board.grid)
      ? finalObj.push([movePoint1, "movement"])
      : null;
    //If he hasnt moved, then can move 2 spaces
    if (!moved) {
      range = 2;
      const movePoint2: Point = [x, y + range * direction];
      const [moveX2, moveY2] = movePoint2;
      if (!board.getPieceByPoint(movePoint2)) {
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
    const pieceOnPoint = board.getPieceByPoint(capturePoint);
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
      const pieceOnPoint = board.getPieceByPoint(result);
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
      const pieceOnPoint = board.getPieceByPoint(result);
      if (pieceOnPoint) {
        pieceOnPoint.team !== team ? finalObj.push([result, "capture"]) : null;
      } else {
        finalObj.push([result, "movement"]);
      }
    }
  });
};

const bounds = (num: number, grid: Grid) =>
  num >= grid.length - grid.length && num <= grid.length - 1;

const calcUpRight = (
  grid: Grid,
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
  grid: Grid,
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
  grid: Grid,
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
  grid: Grid,
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
  grid: Grid,
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let upY = y + movement;
  bounds(upY, grid) ? finalObj.push([x, upY]) : null;
};

const calcDown = (
  grid: Grid,
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let downY = y - movement;
  bounds(downY, grid) ? finalObj.push([x, downY]) : null;
};

const calcRight = (
  grid: Grid,
  currentPoint: Point,
  movement: number,
  finalObj: Point[]
) => {
  let [x, y] = currentPoint;
  let rightX = x + movement;
  bounds(rightX, grid) ? finalObj.push([rightX, y]) : null;
};

const calcLeft = (
  grid: Grid,
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
