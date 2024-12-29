import { TEAM } from "../../shared/match";

export class MatchTimer {
  private time: number;
  private timers: { [key in TEAM]: number };
  private currentPlayer: TEAM;
  private intervalId: NodeJS.Timeout | null = null;
  private paused: boolean = false;
  onTimeUpdate: (timers: { [key in TEAM]: number }) => void;
  onTimeEnd: (player: TEAM) => void;

  constructor({
    time,
    initialPlayer,
    onTimeUpdate,
    onTimeEnd,
  }: {
    time: number;
    initialPlayer: TEAM;
    onTimeUpdate: (timers: { [key in TEAM]: number }) => void;
    onTimeEnd: (player: TEAM) => void;
  }) {
    this.time = time;
    this.timers = { White: this.time, Black: this.time };
    this.currentPlayer = initialPlayer;
    this.onTimeUpdate = onTimeUpdate;
    this.onTimeEnd = onTimeEnd;
  }

  private updateTimer() {
    if (!this.paused) {
      this.timers[this.currentPlayer] -= 1;
      this.onTimeUpdate(this.timers);
      if (this.timers[this.currentPlayer] <= 0) {
        this.stop();
        this.onTimeEnd(this.currentPlayer);
      }
    }
  }

  start() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.updateTimer(), 1000);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  togglePause() {
    this.paused = !this.paused;
  }

  switchPlayer() {
    const nextPlayer =
      this.currentPlayer === TEAM.WHITE ? TEAM.BLACK : TEAM.WHITE;
    this.currentPlayer = nextPlayer;
  }

  reset(time?: number) {
    this.time = time ? time * 60 : this.time;
    this.timers = { White: this.time, Black: this.time };
    this.currentPlayer = TEAM.WHITE;
    this.start();
  }

  getTimers() {
    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    };

    return {
      White: {
        formatted: formatTime(this.timers.White),
        raw: this.timers.White,
      },
      Black: {
        formatted: formatTime(this.timers.Black),
        raw: this.timers.Black,
      },
    };
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }
}
