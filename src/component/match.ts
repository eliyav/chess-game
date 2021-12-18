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

  constructor({ matchSettings: { mode, player, time, room } }: Context) {
    this.matchSettings = { mode, player, time, room };
    this.createGame();
    this.startMatchTimer();
  }

  resetMatch() {
    this.createGame();
    this.timer.resetTimers(this.matchSettings.time);
    this.timer.gameStarted = false;
  }

  createGame() {
    this.game = new Game(chessData);
  }

  startMatchTimer() {
    this.timer = new Timer(this.game.state, this.game.endGame.bind(this.game));
    this.timer.startTimer(this.matchSettings.time);
    console.log(this.timer);
  }
}

export default Match;

type Context = {
  game?: Game | undefined;
  matchSettings: {
    mode?: string | undefined;
    player?: string | undefined;
    room?: string | undefined;
    time?: number | undefined;
  };
};
