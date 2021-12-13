import { Engine, Scene } from "babylonjs";
import Game from "./game-logic/game";
import chessData from "./game-logic/chess-data-import";
import startScreen from "../view/start-screen";
import gameScreen from "../view/game-screen";

const initializeChessApp = async (
  canvas: HTMLCanvasElement,
  engine: Engine
) => {
  const app: ChessApp = {
    game: new Game(chessData),
    gameMode: {
      mode: undefined,
      player: undefined,
      time: undefined,
      room: undefined,
    },
    showScene: { index: 0 },
    scenes: {
      startScene: await startScreen(engine),
      gameScene: await gameScreen(canvas, engine),
    },
  };

  const {
    showScene,
    scenes: { startScene, gameScene },
  } = app;

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

  const refreshCanvas = () => {
    let startSceneCamera: any = startScene.cameras[0];
    let gameSceneCamera: any = gameScene.cameras[0];
    if (canvas.width < 768) {
      startSceneCamera.radius = 32;
      gameSceneCamera.radius = 65;
    } else {
      startSceneCamera.radius = 30;
      gameSceneCamera.radius = 40;
    }
    engine.resize();
  };

  window.onresize = refreshCanvas;

  return app;
};

export default initializeChessApp;

export interface ChessApp {
  game: Game;
  gameMode: GameMode;
  showScene: { index: number };
  scenes: {
    startScene: Scene;
    gameScene: Scene;
  };
}

export type GameMode = {
  mode: string | undefined;
  player: string | undefined;
  room: string | undefined;
  time: number | undefined;
};
