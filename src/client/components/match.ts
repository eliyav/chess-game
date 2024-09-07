import { LobbySettings } from "../../shared/lobby";
import Game from "./game-logic/game";

export class Match {
  lobby: LobbySettings;
  player: string;
  current: {
    key: string | null;
    mode: string;
    players: string[] | undefined;
    game: Game;
  };

  constructor({ lobby, player }: { lobby: LobbySettings; player: string }) {
    this.lobby = lobby;
    this.player = player;
    this.current = this.setMatch({ lobby });
  }

  setMatch({ lobby }: { lobby: LobbySettings }) {
    const matchDefaults = {
      key: lobby.key,
      mode: lobby.mode,
      players: lobby.players,
      game: new Game(),
    };
    return matchDefaults;
  }

  nextTurn() {
    return this.current.game.nextTurn();
  }

  isPlayersTurn() {
    if (this.current.players?.length) {
      const currentPlayer = this.current.game.getCurrentPlayer();
      return currentPlayer === this.player;
    } else {
      return true;
    }
  }

  resetMatch() {
    this.current = this.setMatch({ lobby: this.lobby });
  }

  takeTurn(originPoint: Point, targetPoint: Point) {
    return this.current.game.resolveMove(originPoint, targetPoint);
  }

  undoTurn() {
    return this.current.game.undoTurn();
  }

  getWinningTeam() {
    const currentPlayer = this.current.game.getCurrentPlayer();
    return currentPlayer;
  }
}
