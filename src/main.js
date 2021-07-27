import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import initializeApp from "./helper/app-helpers";

async function Main() {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const appContext = await initializeApp(canvas, engine);

  const {
    showScene,
    scenes: { startScene, gameScene },
  } = appContext;

  (() => {
    engine.runRenderLoop(function () {
      switch (showScene.sceneIndex) {
        case 0:
          gameScene.detachControl();
          startScene.attachControl();
          startScene.render();
          break;
        case 1:
          gameScene.attachControl();
          gameScene.render();
          break;
        case 2:
          break;
      }
    });
  })();
}

Main();
