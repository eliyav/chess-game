export type Point = [number, number];

export type MoveType =
  | "movement"
  | "capture"
  | "castle"
  | "enPassant"
  | "promotion";

export type Move = [Point, MoveType];

export enum Piece {
  P = "Pawn",
  R = "Rook",
  B = "Bishop",
  N = "Knight",
  K = "King",
  Q = "Queen",
}
