import { PIECE } from "../../shared/game";
import { TEAM } from "../../shared/match";

class GamePiece {
  type: PIECE;
  team: TEAM;
  movement: number[];
  moved: boolean;
  moveCounter: number;
  direction: number;

  constructor({
    type,
    team,
    update,
  }: {
    type: PIECE;
    team: TEAM;
    update?: boolean;
  }) {
    this.type = type;
    this.team = team;
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

  getSymbol() {
    return Object.entries(PIECE).find(([_, value]) => value === this.type)?.[0];
  }
}

export default GamePiece;
