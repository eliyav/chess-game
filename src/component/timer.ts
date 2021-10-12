import {State} from "../data/chess-data-import";

const timer1 = document.getElementById("timer1") as HTMLDivElement;
const timer2 = document.getElementById("timer2") as HTMLDivElement;

interface Timer {
    gameState: State,
    timer1: number,
    timer2: number,
    gameStarted: boolean,
    gamePaused: boolean,
    pauseId: NodeJS.Timeout,
    endGame: () => void,
}

class Timer {
  constructor(gameState : State, endGame: () => void) {
    this.gameState = gameState;
    this.timer1 = 0;
    this.timer2 = 0;
    this.gameStarted = false;
    this.gamePaused = false;
    this.pauseId;
    this.endGame = endGame;
  }

  resetTimers = (time = 0) => {
    setTimeout(() => {
      this.timer1 = time / 2;
      this.timer2 = time / 2;
      timer1.innerText = this.timer1.toString();
      timer2.innerText = this.timer2.toString();
      this.gamePaused = false;
    }, 1000)
  };

  padZero = (number : number) => {
    if (number < 10) {
      return parseInt("0" + number)
    }
    return number;
  };

  pauseTimer = () => {
    if(this.gamePaused === false){
      this.gamePaused = true;
    } else{
      if(this.pauseId) {
        clearTimeout(this.pauseId)
      }
      this.pauseId = setTimeout(() => {
        this.gamePaused = false;
        this.startTimer();
      },1000)
      }
  }

  startTimer = (time = 0) => {
    this.timer1 = time / 2;
    this.timer2 = time / 2;
    this.gameStarted = true;
    if(time > 0){
    let timerId = setInterval(() => {
      if(this.gameState.currentPlayer === "White") {
        this.timer1 = this.padZero(this.timer1 - 1)
        timer1.innerText = this.timer1.toString();
        this.timer1 === 0 ? this.endGame(): null;
      }
      if (this.gameState.currentPlayer !== "White") {
        this.timer2 = this.padZero(this.timer2 - 1)
        timer2.innerText = this.timer2.toString();
        this.timer2 === 0 ? this.endGame(): null;
      }
      if(this.gameStarted === false || this.gamePaused === true){
        clearInterval(timerId)
      }
    }, 1000);
    }
  };
}

export default Timer;
