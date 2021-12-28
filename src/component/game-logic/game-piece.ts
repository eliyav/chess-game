import { LocationsInfo } from "../../helper/game-helpers";

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

  update() {
    this.moved ? null : (this.moved = true);
    this.moveCounter++;
  }

  checkPromotion(locationsInfo: LocationsInfo) {
    if (this.name === "Pawn" && (this.point[1] === 0 || this.point[1] === 7)) {
      return "";
    }
  }

  getSymbol() {
    switch (this.name) {
      case "King":
        return "K";
        break;
      case "Queen":
        return "Q";
        break;
      case "Knight":
        return "N";
        break;
      case "Bishop":
        return "B";
        break;
      case "Rook":
        return "R";
        break;
      default:
        return "";
    }
  }
}

export type Move = [Point, string];

export default GamePiece;
