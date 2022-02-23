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
    return true;
  }
}

export default OfflineMatch;

export type OfflineMatchSettings = {
  mode: string | undefined;
  time: number | undefined;
};
