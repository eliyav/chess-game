import { Engine } from "babylonjs";
import startScreen, { CustomScene } from "../view/start-screen";
import gameScreen from "../view/game-screen";

const initRender = async (
  canvas: HTMLCanvasElement,
  engine: Engine
): Promise<RenderContext> => {
  const renderContext = {
    showScene: { index: 0 },
    scenes: {
      startScene: await startScreen(engine),
      gameScene: await gameScreen(canvas, engine),
    },
  };

  const {
    showScene,
    scenes: { startScene, gameScene },
  } = renderContext;

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

  return renderContext;
};

export default initRender;

export type RenderContext = {
  showScene: { index: number };
  scenes: { startScene: CustomScene; gameScene: CustomScene };
};
