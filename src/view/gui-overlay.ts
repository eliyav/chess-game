import { App } from "../component/app";
import Game from "../component/game/game";
import { CustomScene } from "./start-screen";
import x from "../../assets/x.png";
import { GameMode } from "../component/app";

const homeButton = document.getElementById("home") as HTMLButtonElement;
const startOGButton = document.getElementById("startOG") as HTMLButtonElement;
const createOnlineMatch = document.getElementById(
  "createOnlineMatch"
) as HTMLButtonElement;
const joinOnlineMatch = document.getElementById(
  "joinOnlineMatch"
) as HTMLButtonElement;
const resetBoardButton = document.getElementById(
  "resetBoard"
) as HTMLButtonElement;
const resetCameraButton = document.getElementById(
  "camera"
) as HTMLButtonElement;
const undoMoveButton = document.getElementById("undo") as HTMLButtonElement;
const pauseButton = document.getElementById("pause") as HTMLButtonElement;

function setGUI(app: App) {
  const {
    game,
    gameMode,
    showScene,
    emitter,
    socket,
    scenes: { startScene, gameScene },
  } = app;

  const camera: any = gameScene.cameras[0];
  homeButton.addEventListener("click", () => {
    camera.alpha = Math.PI;
    gameScene.detachControl();
    showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
  });

  startOGButton.addEventListener("click", () => {});

  createOnlineMatch.addEventListener("click", () => {
  })

  joinOnlineMatch.addEventListener("click", () => {
    gameMode.mode = "online";
    let room = prompt("Please enter the room key");
    socket.emit("join-room", room);
  });

  resetBoardButton.addEventListener("click", () => {
    emitter!.emit("reset-board");
  });

  resetCameraButton.addEventListener("click", () => {
    resetCamera(game, gameScene, gameMode);
  });

  undoMoveButton.addEventListener("click", () => {
    emitter?.emit("undo-move");
  });

  pauseButton.addEventListener("click", () => {
    pauseButton.innerHTML === "Pause"
      ? (pauseButton.innerHTML = "Paused")
      : (pauseButton.innerHTML = "Pause");
    if (gameMode.mode === "online") {
      if (gameMode.player === game.state.currentPlayer) {
        game.timer.pauseTimer();
        emitter!.emit("pause-game", game.state.currentPlayer);
      }
    } else {
      game.timer.pauseTimer();
    }
  });
}

const resetCamera = (
  game: Game,
  gameScene: CustomScene,
  gameMode: GameMode
) => {
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
};

export { setGUI, resetCamera };
