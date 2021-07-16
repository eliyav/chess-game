import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import Game from "./game";
import startScreen from "./view/start-screen";
import gameScreen from "./view/game-screen";
import { renderScene } from "./helper/canvas-helpers";
import createGUI from "./view/gui-overlay";

async function Main() {
  const appContext = {
    gameStarted: false,
    showScene: 0,
    scenes: {
      activeScene: undefined,
      startScreen: undefined,
      gameScreen: undefined,
      optionsScreen: undefined,
    },
    game: undefined,
  };
  let advancedTexture;
  const canvas = document.getElementById("renderCanvas");
  appContext.game = new Game();
  appContext.game.setBoard();
  appContext.engine = new BABYLON.Engine(canvas, true);
  appContext.scenes.startScreen = await startScreen(canvas, appContext);
  appContext.scenes.gameScreen = await gameScreen(canvas, appContext);
  appContext.scenes.activeScene = appContext.scenes.startScreen;
  createGUI(appContext);
  renderScene(appContext.game, appContext.scenes.gameScreen);

  (() => {
    appContext.engine.runRenderLoop(function () {
      switch (appContext.showScene) {
        case 0:
          appContext.scenes.activeScene.attachControl();
          appContext.scenes.startScreen.render();
          appContext.scenes.activeScene = appContext.scenes.startScreen;
          break;
        case 1:
          appContext.scenes.activeScene.attachControl();
          appContext.scenes.gameScreen.render();
          appContext.scenes.activeScene = appContext.scenes.gameScreen;
          break;
        case 2:
          break;
      }
    });
  })();
}

Main();
