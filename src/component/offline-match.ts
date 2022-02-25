import chessData from "../../src/component/game-logic/chess-data-import";
import Game from "../../src/component/game-logic/game";
import { Timer } from "../timer/timer";

class OfflineMatch {
  game: Game;
  time: number;
  timer: Timer;
  endMatchFunc: () => void;

  constructor(time: number, endMatchCallback: () => void) {
    this.time = time;
    this.game = new Game(chessData, this.endMatch.bind(this));
    this.timer = new Timer(
      this.time,
      this.game.state,
      this.endMatch.bind(this)
    );
    this.endMatchFunc = endMatchCallback;
  }

  startMatch() {
    this.timer.startTimer();
    this.game.gameStarted = true;
  }

  resetMatch() {
    this.game.resetGame();
    this.timer.resetTimers();
    this.timer.startTimer();
  }

  endMatch() {
    this.game.gameStarted = false;
    this.endMatchFunc();
    return true;
  }
}

export default OfflineMatch;
