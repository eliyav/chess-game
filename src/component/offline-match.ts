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
  endMatchFunc: () => void;

  constructor(
    { mode, time }: OfflineMatchSettings,
    endMatchCallback: () => void
  ) {
    this.matchSettings = { mode, time };
    this.game = new Game(chessData, this.endMatch.bind(this));
    this.timer = new Timer(
      this.matchSettings.time!,
      this.game.state,
      this.endMatch.bind(this)
    );
    this.endMatchFunc = endMatchCallback;
  }

  startMatch() {
    this.timer.startTimer();
  }

  resetMatch() {
    this.game.resetGame();
    this.timer.resetTimers();
    this.timer.startTimer();
  }

  endMatch() {
    this.endMatchFunc();
    return true;
  }
}

export default OfflineMatch;

export type OfflineMatchSettings = {
  mode: string | undefined;
  time: number | undefined;
};
