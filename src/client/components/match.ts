import { LobbySettings } from "../../shared/lobby";
import Game from "./game-logic/game";

export class Match {
  lobby: LobbySettings;
  player: string;
  game: Game;

  constructor({ lobby, player }: { lobby: LobbySettings; player: string }) {
    this.lobby = lobby;
    this.player = player;
    this.game = new Game();
  }

  isPlayersTurn() {
    if (this.lobby.players?.length) {
      const currentPlayer = this.game.getCurrentPlayer();
      return currentPlayer === this.player;
    } else {
      return true;
    }
  }
}
