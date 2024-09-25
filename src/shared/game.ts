export type Point = [number, number];

export type Move = [Point, string];

export type GamePieceType =
  | "Pawn"
  | "Rook"
  | "Bishop"
  | "Knight"
  | "King"
  | "Queen";
