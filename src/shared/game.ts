import GamePiece from "./game-piece";

export enum GAMESTATUS {
  INPROGRESS = "In Progress",
  CHECKMATE = "Checkmate",
  STALEMATE = "Stalemate",
  DRAW = "Draw",
  PLAYING = "Playing",
}

export type Point = [number, number];

export type MoveType = "movement" | "capture" | "castle" | "enPassant";

export type Move = [Point, MoveType];

export enum PIECE {
  P = "Pawn",
  R = "Rook",
  B = "Bishop",
  N = "Knight",
  K = "King",
  Q = "Queen",
}

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
      castling: [Point, Point];
    }
  | {
      type: "enPassant";
      origin: Point;
      target: Point;
      originPiece: GamePiece;
      targetPiece: GamePiece;
      enPassant: EnPassantResult;
    };

export type EnPassantResult = {
  result: boolean;
  enPassantPoint: Point;
};
