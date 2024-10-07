import { PIECE } from "../../shared/game.js";
import { TEAM } from "../../shared/match.js";

class GamePiece {
  type: PIECE;
  team: TEAM;
  moved: boolean;
  moveCounter: number;

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
    this.moved = false;
    this.moveCounter = 0;
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
