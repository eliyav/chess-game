import EventEmitter from "./event-emitter";
import { CanvasView } from "../view/view-init";
import Match from "../component/match";

type MatchSettings = {
  mode: string | undefined;
  player: string | undefined;
  time: number | undefined;
};

const initEmitter = (
  match: React.MutableRefObject<Match | undefined>,
  view: CanvasView
  // socket: any
): EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on("create-match", ({ mode, time, player }: MatchSettings) => {
    match!.current = new Match({ matchSettings: { mode, time, player } });
    if (mode === "Offline") {
      view.prepareGameScene(match.current);
    } else {
      // socket.emit("create-room");
    }
  });

  emitter.on("resolveMove", (originPoint: Point, targetPoint: Point) => {
    if (match !== null) {
      match.current!.game.switchTurn();
      view.updateGameView(match.current!);
      if (match.current!.matchSettings.mode === "Online") {
        const room = match.current!.matchSettings.room;
        // socket.emit("stateChange", { originPoint, targetPoint, room });
      }
    }
  });

  return emitter;
};

export default initEmitter;

// emitter.on("reset-board", () => {
//   const answer = confirm("Are you sure you want to reset the board?");
//   if (answer) {
//     if (match.matchSettings.mode === "online") {
//       socket.emit("reset-board", match.matchSettings);
//     } else {
//       match.game.resetGame(match.matchSettings.time);
//       renderScene(match.game, gameScene);
//       let camera: any = gameScene.cameras[0];
//       camera.alpha = Math.PI;
//     }
//   }
// });

// emitter.on("pause-game", (currentPlayer: string) => {
//   if (match.matchSettings.mode === "Online") {
//     if (match.matchSettings.player === match.game.state.currentPlayer) {
//       let time;
//       if (currentPlayer === "White") {
//         time = match.game.timer.timer1;
//       } else {
//         time = match.game.timer.timer2;
//       }
//       socket.emit("pause-game", {
//         match.matchSettings,
//         currentPlayer,
//         time,
//       });
//     }
//   } else {
//     match.game.timer.pauseTimer();
//   }
// });

// emitter.on("undo-move", () => {
//   if (match.matchSettings.mode === "online") {
//     if (match.matchSettings.player !== match.game.state.currentPlayer) {
//       const lastTurn = match.game.turnHistory.at(-1);
//       if (lastTurn !== undefined) {
//         socket.emit("undo-move", match.matchSettings);
//       }
//     }
//   } else {
//     match.game.undoTurn();
//     renderScene(match.game, gameScene);
//     emitter.emit("reset-camera");
//   }
// });

// emitter.on("home-screen", () => {
//   let camera: any = gameScene.cameras[0];
//   camera.alpha = Math.PI;
//   match.game.gameStarted = false;
//   gameScene.detachControl();
//   showScene.index = 0;
// });

// emitter.on("join-online-match", () => {
//   match.matchSettings.mode = "online";
//   let room = prompt("Please enter the room key");
//   socket.emit("join-room", room);
// });
