import chessData from "../../src/component/game-logic/chess-data-import";
import Game from "../../src/component/game-logic/game";
import { Timer } from "../timer/timer";

class OfflineMatch {
  game: Game;
  timer: Timer;
  matchSettings: {
    mode: string | undefined;
    time: number | undefined;
  };

  constructor({ mode, time }: OfflineMatchSettings) {
    this.matchSettings = { mode, time };
    this.game = new Game(chessData, this.endMatch.bind(this));
    this.timer = new Timer(
      this.matchSettings.time!,
      this.game.state,
      this.endMatch
    );
  }

  startMatch() {
    this.timer.startTimer();
  }

  resetMatch() {
    this.game.resetGame();
    this.timer.resetTimers();
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
