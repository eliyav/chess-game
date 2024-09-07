import { LOBBY, LobbySettings } from "../../shared/lobby";
import Game from "./game-logic/game";

export class Match {
  lobby: LobbySettings;
  player: {
    name: string;
    team: "White" | "Black";
  };
  game: Game;

  constructor({
    lobby,
    player,
  }: {
    lobby: LobbySettings;
    player: {
      name: string;
      team: "White" | "Black";
    };
  }) {
    this.lobby = lobby;
    this.player = player;
    this.game = new Game();
  }

  isOnline() {
    return this.lobby.mode === LOBBY.ONLINE;
  }

  isPlayersTurn() {
    if (this.isOnline()) {
      const currentPlayer = this.game.getCurrentPlayer();
      return currentPlayer === this.player.team;
    } else {
      return true;
    }
  }

  getPlayerTeam() {
    if (this.isOnline()) {
      return this.player.team;
    } else {
      return this.game.getCurrentPlayer();
    }
  }
}
