import { renderScene } from "../helper/canvas-helpers";
import {App} from "../app"

function setGUI(app: App) {

  const {
    game,
    gameMode,
    showScene,
    emitter,
    scenes: { startScene, gameScene },
  } = app;

const gameButtons = document.getElementById("gameButtons") as HTMLDivElement;

const startOGButton = document.getElementById("startOG") as HTMLButtonElement
startOGButton.addEventListener("click", () => {
  gameMode.mode = "offline";
  startScene.detachControl();
  showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
  startOGButton.style.display = "none";
  gameButtons.style.display = "unset"
})

const homeButton = document.getElementById("home") as HTMLButtonElement
homeButton.addEventListener("click", () => {
  let camera: any = gameScene.cameras[0];
  game.resetBoard();
  renderScene(game, gameScene);
  camera.alpha = Math.PI;
  gameScene.detachControl();
  showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
  startOGButton.style.display = "unset";
  gameButtons.style.display = "none";
})


const resetBoardButton = document.getElementById("resetBoard") as HTMLButtonElement
resetBoardButton.addEventListener("click", () => {
  emitter!.emit("reset-board");
})


const resetCameraButton = document.getElementById("camera") as HTMLButtonElement
resetCameraButton.addEventListener("click", () => {
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
})

}

export default setGUI;
