// class Timer {
//   constructor(gameState) {
//     this.gameState = gameState;
//     this.timer1 = 600;
//     this.timer2 = 600;
//   }

//   resetTimers = () => {
//     this.timer1 = 600;
//     this.timer2 = 600;
//   };

//   padZero = (number) => {
//     if (number < 10) {
//       return "0" + number;
//     }
//     return number;
//   };

//   swapPlayer = () => {
//     if (this.gameState.currentPlayer === "White") {
//       let timerId = setInterval(() => {
//         this.timer1 = this.timer1 - 1;
//         console.log(this.gameState.currentPlayer, this.timer1);
//         if (this.gameState.currentPlayer !== "White") {
//           clearInterval(timerId);
//           this.swapPlayer();
//         }
//       }, 1000);
//     } else {
//       let timerId2 = setInterval(() => {
//         this.timer2 = this.timer2 - 1;
//         console.log(this.gameState.currentPlayer, this.timer2);
//         if (this.gameState.currentPlayer !== "Black") {
//           clearInterval(timerId2);
//           this.swapPlayer();
//         }
//       }, 1000);
//     }
//   };

//   startTimer = () => {
//     let timerId = setInterval(() => {
//       if (this.gameState.currentPlayer !== "White") {
//         clearInterval(timerId);
//         this.swapPlayer();
//       }
//       this.timer1 = this.timer1 - 1;
//       console.log(this.gameState.currentPlayer, this.timer1);
//     }, 1000);
//   };
// }

// export default Timer;
