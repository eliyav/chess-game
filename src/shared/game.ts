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

type BaseTurnHistory = {
  origin: Point;
  target: Point;
  isOpponentInCheck: boolean;
  promotion?: boolean;
};

export type EnPassant = {
  enPassantPoint: Point;
  capturedPiecePoint: Point;
  capturedPiece: GamePiece;
};

export type TurnHistory =
  | ({
      type: "movement";
    } & BaseTurnHistory)
  | ({
      type: "capture";
      capturedPiece: GamePiece;
    } & BaseTurnHistory)
  | ({
      type: "castle";
      direction: number;
      castling: [Point, Point];
    } & BaseTurnHistory)
  | ({
      type: "enPassant";
      enPassant: EnPassant;
    } & BaseTurnHistory);
