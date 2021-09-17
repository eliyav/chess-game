import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import initializeApp from "./app";
import { Engine } from "babylonjs/Engines/engine";
 
async function Main() {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  let engine:Engine = new BABYLON.Engine(canvas, true);
  const app = await initializeApp(canvas, engine);

  const {
    showScene,
    scenes: { startScene, gameScene },
  } = app;

const refreshCanvas = () => {
  engine.resize();
  let camera: any = startScene.cameras[0]
  if(canvas.width < 768) {
    camera.radius = 33;
  } else {
    camera.radius = 30;
  }
}

const loadingEnd = () => {
  refreshCanvas();
  const loadingDiv = document.getElementById("loading") as HTMLDivElement;
  setTimeout(() => {
    loadingDiv.style.display = "none"
  }, 1000)
}

  window.onresize = refreshCanvas;
  window.onload = loadingEnd;

  (() => {
    engine.runRenderLoop(function () {
      switch (showScene.index) {
        case 0:
          gameScene.detachControl();
          startScene.attachControl();
          startScene.render();
          break;
        case 1:
          gameScene.attachControl();
          gameScene.render();
          break;
        default:
          break;
      }
    });
  })();
}

Main();
