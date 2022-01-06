import EventEmitter from "../events/event-emitter";
import chessData from "./game-logic/chess-data-import";
import Game from "./game-logic/game";
import Timer from "./game-logic/timer";

class Match implements Context {
  game!: Game;
  timer!: Timer;
  emitter!: EventEmitter;
  matchSettings: {
    mode: string | undefined;
    player: string | undefined;
    time: number | undefined;
    room: string | undefined;
  };

  constructor(
    { mode, player, time, room }: MatchSettings,
    emitter: EventEmitter | undefined,
    newGame: boolean,
    gameSettings?: any,
    timerSettings?: any
  ) {
    this.matchSettings = { mode, player, time, room };
    emitter ? (this.emitter = emitter) : null;
    if (newGame) {
      this.createGame(true);
    } else {
      this.createGame(false, gameSettings);
      this.loadTimer(timerSettings);
    }
  }

  resetMatch() {
    this.game.resetGame();
    this.resetMatchTimer();
  }

  createGame(newGame: boolean, gameSettings?: any) {
    this.game = new Game(chessData, this.endMatch.bind(this));
    this.game.resetGame();
    if (!newGame) {
      this.game.loadGame(gameSettings);
    }
  }

  loadTimer(timerSettings: any) {
    this.timer = new Timer(
      this.game.state,
      this.endMatch.bind(this),
      false,
      timerSettings
    );
  }

  startMatchTimer() {
    this.timer = new Timer(this.game.state, this.endMatch.bind(this), true);
    this.timer.startTimer(this.matchSettings.time);
    return this.timer;
  }

  resetMatchTimer() {
    this.timer.resetTimers(this.matchSettings.time);
    this.timer.startTimer(this.matchSettings.time);
  }

  endMatch() {
    const winningTeam =
      this.game.state.currentPlayer === this.game.teams[0]
        ? this.game.teams[1]
        : this.game.teams[0];
    this.emitter.emit("end-match", winningTeam);
    return true;
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