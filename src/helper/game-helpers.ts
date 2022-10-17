import { Square } from "../component/game-logic/board";
import GamePiece from "../component/game-logic/game-piece";

export interface TurnHistory {
  result: boolean;
  type: string;
  direction?: number;
  enPassant?: EnPassantResult;
  castling?: Square[];
  origin: Point;
  target: Point;
  originPiece: GamePiece | undefined;
  targetPiece: GamePiece | undefined;
  originSquare: Square;
  targetSquare: Square;
  promotion: boolean;
  turn?: number;
}

type EnPassantResult = {
  result: boolean;
  enPassantPoint: Point;
};

export interface LocationsInfo {
  originSquare: Square;
  targetSquare: Square;
  originPiece: GamePiece | undefined;
  targetPiece: GamePiece | undefined;
  originPoint: Point;
  targetPoint: Point;
}

const generateTurnHistory = (
  type: string,
  LocationsInfo: LocationsInfo,
  options: {
    promotion: boolean;
    enPassant?: EnPassantResult;
    enPassantPiece?: GamePiece | undefined;
    lastTurnHistorySquare?: Square;
    direction?: number;
    castlingResult?: Square[];
  }
): TurnHistory | undefined => {
  if (type === "standard") {
    return {
      result: true,
      type: type,
      origin: LocationsInfo.originPoint,
      target: LocationsInfo.targetPoint,
      originPiece: LocationsInfo.originPiece,
      targetPiece: LocationsInfo.targetPiece,
      originSquare: LocationsInfo.originSquare,
      targetSquare: LocationsInfo.targetSquare,
      promotion: options.promotion,
    };
  } else if (type === "enPassant") {
    return {
      result: true,
      type: "enPassant",
      enPassant: options.enPassant,
      origin: LocationsInfo.originPoint,
      target: LocationsInfo.targetPoint,
      originPiece: LocationsInfo.originPiece,
      targetPiece: options.enPassantPiece,
      originSquare: LocationsInfo.originSquare,
      targetSquare: options.lastTurnHistorySquare!,
      promotion: options.promotion,
    };
  } else if (type === "castling") {
    return {
      result: true,
      type: "castling",
      direction: options.direction,
      castling: options.castlingResult,
      origin: LocationsInfo.originPoint,
      target: LocationsInfo.targetPoint,
      originPiece: LocationsInfo.originPiece,
      targetPiece: LocationsInfo.targetPiece,
      originSquare: LocationsInfo.originSquare,
      targetSquare: LocationsInfo.targetSquare,
      promotion: options.promotion,
    };
  }
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

//Functions to switch game pieces back and forth between squares once move is entered
const updateLocation = (LocationsInfo: LocationsInfo) => {
  const { originSquare, targetSquare, originPiece, targetPoint } =
    LocationsInfo;
  targetSquare.on = originPiece;
  targetSquare.on!.point = [getX(targetPoint), getY(targetPoint)];
  originSquare.on = undefined;
  return true;
};

const undoUpdateLocation = (LocationsInfo: LocationsInfo) => {
  const { originSquare, targetSquare, originPiece, targetPiece, originPoint } =
    LocationsInfo;
  originSquare.on = originPiece;
  originSquare.on!.point = [getX(originPoint), getY(originPoint)];
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

export {
  getX,
  getY,
  doMovesMatch,
  updateLocation,
  undoUpdateLocation,
  isEnPassantAvailable,
  generateTurnHistory,
};
