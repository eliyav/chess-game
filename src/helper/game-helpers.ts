import { Square } from "./board-helpers";
import GamePiece from "../component/game-piece";

export interface TurnHistory {
  result: boolean;
  type?: string;
  direction?: number;
  enPassant?: EnPassantResult;
  castling?: Square[];
  origin: Point;
  target: Point;
  originPiece: GamePiece | undefined;
  targetPiece: GamePiece | undefined;
  originSquare: Square;
  targetSquare: Square;
  promotion?: string | undefined;
  turn?: number;
}

type EnPassantResult = {
  result: boolean;
  enPassantPoint: Point;
};

const isEnPassantAvailable = (turnHistory: TurnHistory): EnPassantResult => {
  let moved;
  let direction;
  let noMove = -1;
  let x = noMove;
  let y = noMove;
  turnHistory === undefined
    ? null
    : (() => {
        if (turnHistory.originPiece!.name === "Pawn") {
          const targetY = turnHistory.target[1];
          const originY = turnHistory.origin[1];
          moved = Math.abs(targetY - originY);
          direction = turnHistory.originPiece!.color === "White" ? 1 : -1;
          x = turnHistory.target[0];
          y = turnHistory.origin[1] + direction;
        }
      })();
  return {
    result: moved === 2 ? true : false,
    enPassantPoint: [x, y],
  };
};

//Checks for pawn promotion
const checkForPawnPromotion = (squaresandPieces: SquaresandPieces) => {
  const { targetSquare, originPiece } = squaresandPieces;
  const y = getY(originPiece!.point);
  if (y === 7 || y === 0) {
    let newClass;
    do {
      newClass = prompt(
        "Piece Promoted! Please type your new piece. Your Choices are: Queen, Knight, Bishop, Rook",
        "Enter class name here"
      );
    } while (
      newClass !== "Queen" &&
      newClass !== "queen" &&
      newClass !== "Knight" &&
      newClass !== "knight" &&
      newClass !== "Bishop" &&
      newClass !== "bishop" &&
      newClass !== "Rook" &&
      newClass !== "rook"
    );
    const char = newClass.charAt(0).toUpperCase();
    const finalString = newClass.replace(newClass.charAt(0), char);
    const { color, point, movement } = originPiece!;
    targetSquare.on = new GamePiece(finalString, color, point, movement);
    return finalString;
  }
};

//Functions to switch game pieces back and forth between squares once move is entered
const switchSquares = (squaresandPieces: SquaresandPieces, point: Point) => {
  const { originSquare, targetSquare, originPiece } = squaresandPieces;
  targetSquare.on = originPiece;
  targetSquare.on!.point = [getX(point), getY(point)];
  originSquare.on = undefined;
  return true;
};

const switchSquaresBack = (
  squaresandPieces: SquaresandPieces,
  point: Point
) => {
  const { originSquare, targetSquare, originPiece, targetPiece } =
    squaresandPieces;
  originSquare.on = originPiece;
  originSquare.on!.point = [getX(point), getY(point)];
  targetSquare.on = targetPiece;
  return true;
};

//General Helper functions
const getX = (point: Point) => {
  const [x, y] = point;
  return x;
};

const getY = (point: Point) => {
  const [x, y] = point;
  return y;
};

const doMovesMatch = (move: Point, move2: Point) =>
  getX(move) == getX(move2) && getY(move) == getY(move2);

export interface SquaresandPieces {
  originSquare: Square;
  targetSquare: Square;
  originPiece: GamePiece | undefined;
  targetPiece: GamePiece | undefined;
}

export {
  getX,
  getY,
  doMovesMatch,
  switchSquaresBack,
  switchSquares,
  checkForPawnPromotion,
  isEnPassantAvailable,
};
