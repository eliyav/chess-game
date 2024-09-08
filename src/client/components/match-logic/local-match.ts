import { LobbySettings, Player } from "../../../shared/match";
import { BaseMatch } from "./base-match";

export class LocalMatch extends BaseMatch {
  private lobby: LobbySettings;
  private player: Player;

  constructor({ lobby, player }: { lobby: LobbySettings; player: Player }) {
    super();
    this.lobby = lobby;
    this.player = player;
  }
  isPlayersTurn() {
    //Take into account AI opponent possibility
    return true;
  }

  getPlayerTeam() {
    return this.game.getCurrentPlayer();
  }

  test() {
    return "test";
  }
}
