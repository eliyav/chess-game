import { Piece, Point } from "../../shared/game";
import { TEAM } from "../../shared/match";

class GamePiece {
  type: Piece;
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
    update,
  }: {
    type: Piece;
    team: TEAM;
    point: Point;
    update?: boolean;
  }) {
    this.type = type;
    this.team = team;
    this.point = point;
    this.movement = [1, 2, 3, 4, 5, 6, 7];
    this.moved = false;
    this.moveCounter = 0;
    this.direction = this.team === TEAM.WHITE ? 1 : -1;
    if (update) this.update();
  }

  resetPieceMovement() {
    if (this.moveCounter === 1) this.moved = false;
    this.moveCounter--;
  }

  update() {
    this.moved = true;
    this.moveCounter++;
  }

  checkPromotion() {
    if (this.type === Piece.P && (this.point[1] === 0 || this.point[1] === 7)) {
      return true;
    }
    return false;
  }

  getSymbol() {
    return Object.entries(Piece).find(([_, value]) => value === this.type)?.[0];
  }
}

export default GamePiece;
