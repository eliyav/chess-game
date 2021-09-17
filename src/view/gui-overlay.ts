import { App } from "../app";
import Game from "../game";
import { renderScene } from "../helper/canvas-helpers";
import { CustomScene } from "./start-screen";

const gameOverlay = document.getElementById("gameOverlay") as HTMLDivElement;
const homeButton = document.getElementById("home") as HTMLButtonElement
const startOGButton = document.getElementById("startOG") as HTMLButtonElement;
const createOnlineMatch = document.getElementById("createOnlineMatch") as HTMLButtonElement;
const joinOnlineMatch = document.getElementById("joinOnlineMatch") as HTMLButtonElement;
const resetBoardButton = document.getElementById("resetBoard") as HTMLButtonElement;
const resetCameraButton = document.getElementById("camera") as HTMLButtonElement;
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

  homeButton.addEventListener("click", () => {
    let camera: any = gameScene.cameras[0];
    camera.alpha = Math.PI;
    gameScene.detachControl();
    showDisplay();
    showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
  })

startOGButton.addEventListener("click", () => {
  gameMode.mode = "offline";
  game.resetGame();
  renderScene(game, gameScene);
  hideDisplay();
  startScene.detachControl();
  showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
})

createOnlineMatch.addEventListener("click", () => {
  gameMode.mode = "online";
  socket.emit("create-room");
  game.resetGame();
  renderScene(game, gameScene);
  hideDisplay();
  startScene.detachControl();
  showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
})
joinOnlineMatch.addEventListener("click", () => {
  gameMode.mode = "online";
  //add logic to only emit if join room, replied true
  let room = prompt("Please enter the room key");
  socket.emit("join-room", room);
  game.resetGame();
  renderScene(game, gameScene);
  hideDisplay();
  startScene.detachControl();
  showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
})

resetBoardButton.addEventListener("click", () => {
  emitter!.emit("reset-board");
})


resetCameraButton.addEventListener("click", () => {
  resetCamera(game, gameScene);
})

undoMoveButton.addEventListener("click", () => {
  game.undoTurn();
  renderScene(game, gameScene);
  resetCamera(game, gameScene);
})

pauseButton.addEventListener("click", () => {
  game.timer.pauseTimer();
})

const resetCamera = (game: Game, gameScene: CustomScene) => {
  let camera: any = gameScene.cameras[0];
  if (game.state.currentPlayer === "Black") {
    camera.alpha = 0;
    camera.beta = Math.PI / 4;
    camera.radius = 35;
  } else {
    camera.alpha = Math.PI;
    camera.beta = Math.PI / 4;
    camera.radius = 35;
  }
}

const hideDisplay = () => {
  startOGButton.style.display = "none";
  createOnlineMatch.style.display = "none";
  joinOnlineMatch.style.display = "none";
  gameOverlay.style.display = "unset";
}

const showDisplay = () => {
  gameOverlay.style.display = "none";
  startOGButton.style.display = "unset";
  createOnlineMatch.style.display = "unset";
  joinOnlineMatch.style.display = "unset";
}

}



export default setGUI;
