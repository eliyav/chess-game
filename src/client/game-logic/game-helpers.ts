import { Point } from "../../shared/game";
import { TEAM } from "../../shared/match";
import GamePiece from "./game-piece";

export type TurnHistory =
  | {
      type: "movement";
      origin: Point;
      target: Point;
      originPiece: GamePiece;
      promote?: boolean;
    }
  | {
      type: "capture";
      origin: Point;
      target: Point;
      originPiece: GamePiece;
      targetPiece: GamePiece;
      promote?: boolean;
    }
  | {
      type: "castle";
      origin: Point;
      target: Point;
      originPiece: GamePiece;
      targetPiece: GamePiece;
      direction: number;
      castling: { name: string }[];
    }
  | {
      type: "enPassant";
      origin: Point;
      target: Point;
      originPiece: GamePiece;
      targetPiece: GamePiece;
      enPassant: EnPassantResult;
    };

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

export { doMovesMatch, getX, getY, isEnPassantAvailable };
