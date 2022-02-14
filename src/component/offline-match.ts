import chessData from "../../src/component/game-logic/chess-data-import";
import Game from "../../src/component/game-logic/game";

class OfflineMatch {
  game: Game;
  matchSettings: {
    mode: string | undefined;
    time: number | undefined;
  };

  constructor({ mode, time }: OfflineMatchSettings) {
    this.matchSettings = { mode, time };
    this.game = new Game(chessData, this.endMatch.bind(this));
  }

  resetMatch() {
    this.game.resetGame();
  }

  endMatch() {
    const winningTeam =
      this.game.state.currentPlayer === this.game.teams[0]
        ? this.game.teams[1]
        : this.game.teams[0];
    return true;
  }
}

export default OfflineMatch;

export type OfflineMatchSettings = {
  mode: string | undefined;
  time: number | undefined;
};
