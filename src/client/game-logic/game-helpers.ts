import { Point } from "../../shared/game";
import { TEAM } from "../../shared/match";
import { Grid } from "./board";
import GamePiece from "./game-piece";

export interface TurnHistory {
  result: boolean;
  type: string;
  direction?: number;
  enPassant?: EnPassantResult;
  castling?: { square: string }[];
  origin: Point;
  target: Point;
  originPiece: GamePiece | undefined;
  targetPiece: GamePiece | undefined;
  originSquare: Grid[0][0];
  targetSquare: Grid[0][0];
  promotion: boolean;
  promotedPiece?: string;
  turn?: number;
}

type EnPassantResult = {
  result: boolean;
  enPassantPoint: Point;
};

export interface LocationsInfo {
  originSquare: Grid[0][0];
  targetSquare: Grid[0][0];
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
    lastTurnHistorySquare?: Grid[0][0];
    direction?: number;
    castlingResult?: { square: string }[];
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
        if (turnHistory.originPiece!.type === "Pawn") {
          const targetY = turnHistory.target[1];
          const originY = turnHistory.origin[1];
          moved = Math.abs(targetY - originY);
          direction = turnHistory.originPiece!.team === TEAM.WHITE ? 1 : -1;
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
  const { originPiece, targetPoint } = LocationsInfo;
  if (originPiece) {
    originPiece.point = [getX(targetPoint), getY(targetPoint)];
  }
  return true;
};

const undoUpdateLocation = (LocationsInfo: LocationsInfo) => {
  const { originSquare, targetSquare, originPiece, targetPiece, originPoint } =
    LocationsInfo;
  if (originPiece) {
    originPiece.point = [getX(originPoint), getY(originPoint)];
  }
  // targetPiece.addPiece(targetPiece);
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
