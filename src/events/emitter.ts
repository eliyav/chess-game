import EventEmitter from "./event-emitter";
import { renderScene, rotateCamera } from "../helper/canvas-helpers";
import { App } from "../component/app";

const activateEmitter = (app: App): EventEmitter => {
  const {
    game,
    gameMode,
    showScene,
    socket,
    scenes: { startScene, gameScene },
  } = app;

  const emitter = new EventEmitter();

  emitter.on("playerMove", (originPoint: Point, targetPoint: Point) => {
    renderScene(game, gameScene);
    const resolved = game.playerMove(originPoint!, targetPoint!);
    if (resolved) {
      if (gameMode.mode === "offline") {
        game.switchTurn();
        renderScene(game, gameScene);
        rotateCamera(game.state.currentPlayer, gameScene);
      } else if (gameMode.mode === "online") {
        const room = gameMode.room;
        renderScene(game, gameScene);
        game.switchTurn();
        socket.emit("stateChange", { originPoint, targetPoint, room });
      }
    }
    game.moves.length = 0;
  });

  emitter.on("reset-board", () => {
    const answer = confirm("Are you sure you want to reset the board?");
    if (answer) {
      if (gameMode.mode === "online") {
        socket.emit("reset-board", gameMode);
      } else {
        game.resetGame(gameMode.time);
        renderScene(game, gameScene);
        let camera: any = gameScene.cameras[0];
        camera.alpha = Math.PI;
      }
    }
  });

  emitter.on("pause-game", (currentPlayer: string) => {
    let time;
    if (currentPlayer === "White") {
      time = game.timer.timer1;
    } else {
      time = game.timer.timer2;
    }
    socket.emit("pause-game", { gameMode, currentPlayer, time });
  });

  emitter.on("undo-move", () => {
    if (gameMode.mode === "online") {
      if (gameMode.player !== game.state.currentPlayer) {
        const lastTurn = game.turnHistory.at(-1);
        if (lastTurn !== undefined) {
          socket.emit("undo-move", gameMode);
        }
      }
    } else {
      game.undoTurn();
      renderScene(game, gameScene);
      emitter.emit("reset-camera");
    }
  });

  emitter.on("start-match", (mode: string) => {
    gameMode.mode = mode;
    game.resetGame(gameMode.time);
    renderScene(game, gameScene);
    startScene.detachControl();
    showScene.index = 1;
  });

  emitter.on("reset-camera", () => {
    let camera: any = gameScene.cameras[0];
    if (gameMode.mode === "online") {
      gameMode.player === "White" ? setToWhitePlayer() : setToBlackPlayer();
    } else {
      game.state.currentPlayer === "White"
        ? setToWhitePlayer()
        : setToBlackPlayer();
    }

    function setToWhitePlayer() {
      camera.alpha = Math.PI;
      camera.beta = Math.PI / 4;
      camera.radius = 40;
    }

    function setToBlackPlayer() {
      camera.alpha = 0;
      camera.beta = Math.PI / 4;
      camera.radius = 60;
    }
  });

  emitter.on("home-screen", () => {
    let camera: any = gameScene.cameras[0];
    camera.alpha = Math.PI;
    gameScene.detachControl();
    showScene.index = 0;
  });

  // joinOnlineMatch.addEventListener("click", () => {
  //   gameMode.mode = "online";
  //   let room = prompt("Please enter the room key");
  //   socket.emit("join-room", room);
  // });

  // pauseButton.addEventListener("click", () => {
  //   pauseButton.innerHTML === "Pause"
  //     ? (pauseButton.innerHTML = "Paused")
  //     : (pauseButton.innerHTML = "Pause");
  //   if (gameMode.mode === "online") {
  //     if (gameMode.player === game.state.currentPlayer) {
  //       game.timer.pauseTimer();
  //       emitter!.emit("pause-game", game.state.currentPlayer);
  //     }
  //   } else {
  //     game.timer.pauseTimer();
  //   }
  // });

  return emitter;
};

export default activateEmitter;
