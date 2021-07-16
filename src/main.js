import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import Game from "./game";
import startScreen from "./view/start-screen";

async function Main() {
  const appContext = {
    gameStarted: false,
    showScene: 0,
    scenes: {
      startScreen: undefined,
      gameScreen: undefined,
      optionsScreen: undefined,
    },
  };

  const canvas = document.getElementById("renderCanvas");
  appContext.engine = new BABYLON.Engine(canvas, true);
  appContext.scenes.startScreen = await startScreen(canvas, appContext.engine);
  (() => {
    appContext.engine.runRenderLoop(function () {
      switch (appContext.showScene) {
        case 1:
          break;
        case 2:
          break;
        default:
          appContext.scenes.startScreen.render();
      }
    });
  })();
}

Main();
