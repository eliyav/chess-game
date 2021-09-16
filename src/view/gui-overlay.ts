import { App } from "../app";
import Game from "../game";
import { renderScene } from "../helper/canvas-helpers";
import { CustomScene } from "./start-screen";

function setGUI(app: App) {

  const {
    game,
    gameMode,
    showScene,
    emitter,
    scenes: { startScene, gameScene },
  } = app;

const gameOverlay = document.getElementById("gameOverlay") as HTMLDivElement;

const startOGButton = document.getElementById("startOG") as HTMLButtonElement
startOGButton.addEventListener("click", () => {
  gameMode.mode = "offline";
  game.resetGame();
  startScene.detachControl();
  showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
  startOGButton.style.display = "none";
  gameOverlay.style.display = "unset";
})

const homeButton = document.getElementById("home") as HTMLButtonElement
homeButton.addEventListener("click", () => {
  let camera: any = gameScene.cameras[0];
  renderScene(game, gameScene);
  camera.alpha = Math.PI;
  gameScene.detachControl();
  showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
  startOGButton.style.display = "unset";
  gameOverlay.style.display = "none";
})


const resetBoardButton = document.getElementById("resetBoard") as HTMLButtonElement
resetBoardButton.addEventListener("click", () => {
  emitter!.emit("reset-board");
})


const resetCameraButton = document.getElementById("camera") as HTMLButtonElement
resetCameraButton.addEventListener("click", () => {
  resetCamera(game, gameScene);
})

const undoMoveButton = document.getElementById("undo") as HTMLButtonElement;
undoMoveButton.addEventListener("click", () => {
  game.undoTurn();
  renderScene(game, gameScene);
  resetCamera(game, gameScene);
})

const pauseButton = document.getElementById("pause") as HTMLButtonElement;
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

}



export default setGUI;
