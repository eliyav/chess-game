import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import initializeApp from "./app";
import { Engine } from "babylonjs/Engines/engine";
 
async function Main() {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  const engine:Engine = new BABYLON.Engine(canvas, true);
  const app = await initializeApp(canvas, engine);

  const {
    showScene,
    scenes: { startScene, gameScene },
  } = app;

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
