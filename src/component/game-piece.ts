import { checkForPawnPromotion, LocationsInfo } from "../helper/game-helpers";

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
      return checkForPawnPromotion(locationsInfo);
    }
  }
}

export type Move = [Point, string];

export default GamePiece;
