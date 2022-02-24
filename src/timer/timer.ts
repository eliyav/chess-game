export class Timer {
  state: { currentPlayer: string };
  gameTime: number;
  timer1: { time: number };
  timer2: { time: number };
  paused: boolean;
  endMatch: () => void;
  pause: () => void;
  resume: () => void;
  currentTimer: () => { time: number };
  constructor(
    time: number,
    gameState: { currentPlayer: string },
    endMatch: () => void
  ) {
    this.state = gameState;
    this.gameTime = time * 60;
    this.timer1 = { time: this.gameTime / 2 };
    this.timer2 = { time: this.gameTime / 2 };
    this.paused = false;
    this.pause = () => (this.paused = true);
    this.resume = () => (this.paused = false);
    this.currentTimer = () =>
      this.state.currentPlayer === "White" ? this.timer1 : this.timer2;
    this.endMatch = endMatch;
  }

  toggleTimer = () => {
    !this.paused ? this.pause() : this.resume();
  };

  startTimer = () => {
    if (this.gameTime) {
      let intervalId = setInterval(() => {
        if (!this.paused) {
          let timer = this.currentTimer();
          timer.time = this.padZero(timer.time - 1);
          if (!timer.time) {
            clearInterval(intervalId);
            this.endOfMatch();
          }
        }
      }, 1000);
    }
  };

  endOfMatch() {
    setTimeout(() => {
      this.endMatch();
    }, 500);
  }

  resetTimers = () => {
    this.timer1.time = this.gameTime / 2;
    this.timer2.time = this.gameTime / 2;
  };

  padZero = (number: number) => {
    if (number < 10) {
      return parseInt("0" + number);
    }
    return number;
  };
}
