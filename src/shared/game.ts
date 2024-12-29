import { TEAM } from "./match";

export enum GAMESTATUS {
  LOBBY = "Lobby",
  INPROGRESS = "In Progress",
  CHECKMATE = "Checkmate",
  STALEMATE = "Stalemate",
  DRAW = "Draw",
  TIMER = "TimeEnd",
}

export type Point = [number, number];

export type MoveType = "movement" | "capture" | "castle" | "enPassant";

export type Move = {
  from: Point;
  to: Point;
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

type BaseTurn = {
  from: Point;
  to: Point;
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

export type TurnTypes =
  | {
      type: "movement";
    }
  | {
      type: "capture";
      capturedPiece: {
        type: PIECE;
        team: TEAM;
      };
    }
  | {
      type: "castle";
      castling: {
        direction: number;
        kingTarget: Point;
        rookTarget: Point;
      };
    }
  | {
      type: "enPassant";
      enPassant: EnPassant;
    };

export type Turn = BaseTurn & TurnTypes;
