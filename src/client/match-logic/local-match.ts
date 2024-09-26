import { Point } from "../../shared/game";
import { LOBBY_TYPE, Lobby, Player } from "../../shared/match";
import GamePiece from "../../shared/game-piece";
import { BaseMatch, MatchLogic } from "./base-match";

export class LocalMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY_TYPE.LOCAL;

  constructor({ lobby, player }: { lobby: Lobby; player: Player }) {
    super({ lobby, player });
    this.mode = LOBBY_TYPE.LOCAL;
  }

  requestResolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    return this.resolveMove({ originPoint, targetPoint });
  }

  resetRequest() {
    return true;
  }

  undoTurnRequest() {
    return true;
  }

  isPlayersTurn() {
    //Take into account AI opponent possibility
    return true;
  }

  getPlayerTeam() {
    return this.getGame().getTeam();
  }

  isCurrentPlayersPiece(piece: GamePiece) {
    return piece.team === this.getPlayerTeam();
  }
}
