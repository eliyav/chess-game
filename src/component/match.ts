import chessData from "./game-logic/chess-data-import";
import Game from "./game-logic/game";
import Timer from "./game-logic/timer";

class Match implements Context {
  game!: Game;
  timer!: Timer;
  matchSettings: {
    mode: string | undefined;
    player: string | undefined;
    time: number | undefined;
    room: string | undefined;
  };

  constructor({ mode, player, time, room }: MatchSettings) {
    this.matchSettings = { mode, player, time, room };
    this.createGame();
    mode === "Offline" ? this.startMatchTimer() : null;
  }

  resetMatch() {
    this.game.resetGame();
    this.timer.resetTimers(this.matchSettings.time);
  }

  createGame() {
    this.game = new Game(chessData);
    this.game.resetGame();
  }

  startMatchTimer() {
    this.timer = new Timer(this.game.state, this.game.endGame.bind(this.game));
    this.timer.startTimer(this.matchSettings.time);
  }
}

export default Match;

type Context = {
  game?: Game | undefined;
  matchSettings: MatchSettings;
};

export type MatchSettings = {
  mode?: string | undefined;
  player?: string | undefined;
  room?: string | undefined;
  time?: number | undefined;
};
