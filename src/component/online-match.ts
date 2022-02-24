import { Timer } from "../timer/timer";
import chessData from "./game-logic/chess-data-import";
import Game from "./game-logic/game";

class OnlineMatch {
  game: Game;
  team: string;
  timer: Timer;

  constructor(team: string, time: number) {
    this.game = new Game(chessData, this.endMatch.bind(this));
    this.team = team === "1" ? "White" : "Black";
    this.timer = new Timer(time, this.game.state, this.endMatch);
  }

  resetMatch() {
    this.game.resetGame();
  }

  endMatch() {
    return true;
  }
}

export default OnlineMatch;

export type OnlineMatchSettings = {
  mode: string | undefined;
  time: number | undefined;
};
