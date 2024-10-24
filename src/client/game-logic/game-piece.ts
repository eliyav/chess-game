import { PIECE, Point } from "../../shared/game";
import { TEAM } from "../../shared/match";

class GamePiece {
  type: PIECE;
  team: TEAM;
  initialPoint?: Point;

  constructor({ type, team }: { type: PIECE; team: TEAM }) {
    this.type = type;
    this.team = team;
  }

  getSymbol() {
    return Object.entries(PIECE).find(([_, value]) => value === this.type)?.[0];
  }

  getInitialPoint() {
    return this.initialPoint;
  }
}

export default GamePiece;
