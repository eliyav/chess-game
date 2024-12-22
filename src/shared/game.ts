import { TEAM } from "./match";

export enum GAMESTATUS {
  INPROGRESS = "In Progress",
  CHECKMATE = "Checkmate",
  STALEMATE = "Stalemate",
  DRAW = "Draw",
}

export type Point = [number, number];

export type MoveType = "movement" | "capture" | "castle" | "enPassant";

export type Move = {
  origin: Point;
  target: Point;
  type: MoveType;
  movingPiece: PIECE;
  capturedPiece?: PIECE;
  promotion?: boolean;
};

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
  capturedPiece: {
    type: PIECE;
    team: TEAM;
  };
};

export type TurnHistory =
  | ({
      type: "movement";
    } & BaseTurnHistory)
  | ({
      type: "capture";
      capturedPiece: {
        type: PIECE;
        team: TEAM;
      };
    } & BaseTurnHistory)
  | ({
      type: "castle";
      castling: {
        direction: number;
        kingTarget: Point;
        rookTarget: Point;
      };
    } & BaseTurnHistory)
  | ({
      type: "enPassant";
      enPassant: EnPassant;
    } & BaseTurnHistory);
