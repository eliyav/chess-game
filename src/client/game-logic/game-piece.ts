import { Point } from "../../shared/game";
import { TEAM } from "../../shared/match";

class GamePiece {
  type: string;
  team: TEAM;
  point: Point;
  movement: number[];
  moved: boolean;
  moveCounter: number;
  direction: number;

  constructor({
    type,
    team,
    point,
  }: {
    type: string;
    team: TEAM;
    point: Point;
  }) {
    this.type = type;
    this.team = team;
    this.point = point;
    this.movement = [1, 2, 3, 4, 5, 6, 7];
    this.moved = false;
    this.moveCounter = 0;
    this.direction = this.team === TEAM.WHITE ? 1 : -1;
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
    if (this.type === "Pawn" && (this.point[1] === 0 || this.point[1] === 7)) {
      return true;
    }
    return false;
  }

  getSymbol() {
    switch (this.type) {
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

export default GamePiece;
