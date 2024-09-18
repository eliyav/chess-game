import { Point } from "../../shared/game";

class GamePiece {
  name: string;
  color: string;
  point: Point;
  movement: number[];
  moved: boolean;
  moveCounter: number;
  direction: number;

  constructor(name: string, color: string, point: Point, movement: number[]) {
    this.name = name;
    this.color = color;
    this.point = point;
    this.movement = movement;
    this.moved = false;
    this.moveCounter = 0;
    this.direction = this.color === "White" ? 1 : -1;
  }

  resetPieceMovement() {
    if (this.moveCounter === 1) this.moved = false;
    this.moveCounter--;
  }

  update() {
    this.moved ? null : (this.moved = true);
    this.moveCounter++;
  }

  checkPromotion() {
    if (this.name === "Pawn" && (this.point[1] === 0 || this.point[1] === 7)) {
      return true;
    }
    return false;
  }

  getSymbol() {
    switch (this.name) {
      case "King":
        return "K";
      case "Queen":
        return "Q";
      case "Knight":
        return "N";
      case "Bishop":
        return "B";
      case "Rook":
        return "R";
      default:
        return "";
    }
  }
}

export type Move = [Point, string];

export default GamePiece;
