import EventEmitter from "./event-emitter";
import { renderScene, rotateCamera } from "../helper/canvas-helpers";
import { App, GameMode } from "../component/chess-app";

const activateEmitter = (app: App, socket: any): EventEmitter => {
  const {
    game,
    gameMode,
    showScene,
    scenes: { startScene, gameScene },
  } = app;

  const emitter = new EventEmitter();

  emitter.on("playerMove", (originPoint: Point, targetPoint: Point) => {
    renderScene(game, gameScene);
    const resolved = game.playerMove(originPoint!, targetPoint!);
    if (resolved) {
      if (gameMode.mode === "Offline") {
        game.switchTurn();
        renderScene(game, gameScene);
        rotateCamera(game.state.currentPlayer, gameScene);
      } else if (gameMode.mode === "Online") {
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

  emitter.on("pause-game", (currentPlayer: string, mode: string) => {
    if (gameMode.mode === "Online") {
      if (gameMode.player === game.state.currentPlayer) {
        let time;
        if (currentPlayer === "White") {
          time = game.timer.timer1;
        } else {
          time = game.timer.timer2;
        }
        socket.emit("pause-game", { gameMode, currentPlayer, time });
      }
    } else {
      game.timer.pauseTimer();
    }
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

  emitter.on("create-match", ({ mode, time, player }: GameMode) => {
    gameMode.mode = mode;
    gameMode.time = time;
    gameMode.player = player;
    if (mode === "Offline") {
      emitter.emit("prepare-game-scene");
    } else {
      socket.emit("create-room");
    }
  });

  emitter.on("prepare-game-scene", () => {
    game.resetGame(gameMode.time);
    renderScene(game, gameScene);
    startScene.detachControl();
    showScene.index = 1;
    emitter.emit("reset-camera");
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
      camera.radius = 40;
    }
  });

  emitter.on("home-screen", () => {
    let camera: any = gameScene.cameras[0];
    camera.alpha = Math.PI;
    game.gameStarted = false;
    gameScene.detachControl();
    showScene.index = 0;
  });

  emitter.on("join-online-match", () => {
    gameMode.mode = "online";
    let room = prompt("Please enter the room key");
    socket.emit("join-room", room);
  });

  return emitter;
};

export default activateEmitter;
