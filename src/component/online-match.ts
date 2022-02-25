import { Timer } from "../timer/timer";
import chessData from "./game-logic/chess-data-import";
import Game from "./game-logic/game";

class OnlineMatch {
  game: Game;
  time: number;
  timer: Timer;
  team: string;
  endMatchFunc: () => void;

  constructor(team: string, time: number, endMatchCallback: () => void) {
    this.time = time;
    this.team = team === "1" ? "White" : "Black";
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

export default OnlineMatch;
