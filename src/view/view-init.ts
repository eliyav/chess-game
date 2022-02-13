import { Engine } from "babylonjs";
import startScreen from "./start-screen";
import gameScreen from "./game-screen";
import Game from "../component/game-logic/game";
import { findPosition, rotateCamera } from "../helper/canvas-helpers";
import Match from "../component/match";
import { TurnHistory } from "../helper/game-helpers";
import { CustomGameScene, CustomStartScene } from "./asset-loader";
import calcTurnAnimation from "./animation/turn-animation";

export const initCanvasView = async (
  canvas: HTMLCanvasElement,
  engine: Engine
): Promise<CanvasView> => {
  const view = {
    showScene: { index: 0 },
    scenes: {
      startScene: await startScreen(engine),
      gameScene: await gameScreen(canvas, engine),
    },
    updateMeshesRender,
    prepareGameScene,
    resetCamera,
    updateGameView,
    prepareHomeScreen,
    turnAnimation,
  };

  const {
    showScene,
    scenes: { startScene, gameScene },
  } = view;

  function turnAnimation(
    ...props: [originPoint: Point, targetPoint: Point, turnHistory: TurnHistory]
  ) {
    return calcTurnAnimation(gameScene, ...props);
  }

  function updateGameView(match: Match) {
    updateMeshesRender(match.game);
    match.matchSettings.mode === "Offline"
      ? rotateCamera(match.game.state.currentPlayer, gameScene)
      : null;
    gameScene.attachControl();
  }

  function prepareGameScene(match: Match) {
    updateMeshesRender(match.game);
    resetCamera(match);
    showScene.index = 1;
    gameScene.attachControl();
  }

  function prepareHomeScreen() {
    gameScene.detachControl();
    showScene.index = 0;
  }

  function updateMeshesRender(game: Game) {
    //Clears old meshes/memory usage
    !gameScene.meshesToRender ? (gameScene.meshesToRender = []) : null;
    if (gameScene.meshesToRender.length) {
      for (let i = 0; i < gameScene.meshesToRender.length; i++) {
        const mesh = gameScene.meshesToRender[i];
        gameScene.removeMesh(mesh);
        mesh.dispose();
      }
      gameScene.meshesToRender = [];
    }
    //Final Piece Mesh List
    const meshesList = gameScene.finalMeshes!.piecesMeshes;
    //For each active piece, creates a mesh clone and places on board
    game.allPieces().forEach((square) => {
      const { name, color, point } = square.on!;
      const foundMesh = meshesList.find(
        (mesh) => mesh.name === name && mesh.color === color
      );
      const clone = foundMesh!.clone(name, null);
      [clone!.position.z, clone!.position.x] = findPosition(point, true);
      clone!.isVisible = true;
      gameScene.meshesToRender!.push(clone!);
    });
  }

  function resetCamera(match: Match) {
    let camera: any = gameScene.cameras[0];
    if (match.matchSettings.mode === "Online") {
      match.matchSettings.player === "White"
        ? setToWhitePlayer()
        : setToBlackPlayer();
    } else {
      match.game.state.currentPlayer === "White"
        ? setToWhitePlayer()
        : setToBlackPlayer();
    }

    function setToWhitePlayer() {
      camera.alpha = Math.PI;
      camera.beta = Math.PI / 4;
      camera.radius = 40;
    }

    function setToBlackPlayer() {
      camera.alpha = 0;
      camera.beta = Math.PI / 4;
      camera.radius = 40;
    }
  }

  window.onresize = function refreshCanvas() {
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

  engine.runRenderLoop(function () {
    switch (showScene.index) {
      case 0:
        startScene.render();
        break;
      case 1:
        gameScene.render();
        break;
      default:
        break;
    }
  });

  return view;
};

export type CanvasView = {
  showScene: { index: number };
  scenes: { startScene: CustomStartScene; gameScene: CustomGameScene };
  prepareGameScene: (match: Match) => void;
  updateMeshesRender: (game: Game) => void;
  resetCamera: (match: Match) => void;
  updateGameView: (match: Match) => void;
  prepareHomeScreen: () => void;
  turnAnimation: (
    originPoint: Point,
    targetPoint: Point,
    turnHistory: TurnHistory
  ) => void;
};
