export type Point = [number, number];

export type Move = [Point, string];

export enum Piece {
  P = "Pawn",
  R = "Rook",
  B = "Bishop",
  N = "Knight",
  K = "King",
  Q = "Queen",
}
