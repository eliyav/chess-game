import { PIECE } from "../../shared/game";
import { TEAM } from "../../shared/match";

class GamePiece {
  type: PIECE;
  team: TEAM;

  constructor({ type, team }: { type: PIECE; team: TEAM }) {
    this.type = type;
    this.team = team;
  }

  getSymbol() {
    return Object.entries(PIECE).find(([_, value]) => value === this.type)?.[0];
  }
}

export default GamePiece;
