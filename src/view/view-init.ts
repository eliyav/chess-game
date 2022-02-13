import { Engine } from "babylonjs";
import gameScreen from "./game-screen";
import Game from "../component/game-logic/game";
import { findPosition, rotateCamera } from "../helper/canvas-helpers";
import Match from "../component/match";
import { TurnHistory } from "../helper/game-helpers";
import { CustomGameScene } from "./asset-loader";
import calcTurnAnimation from "./animation/turn-animation";

export const initCanvasView = async (
  canvas: HTMLCanvasElement,
  engine: Engine
): Promise<CanvasView> => {
  const view = {
    gameScene: await gameScreen(canvas, engine),
    updateMeshesRender,
    prepareGameScene,
    resetCamera,
    updateGameView,
    turnAnimation,
  };

  const { gameScene } = view;

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
    gameScene.attachControl();
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
      camera.radius = 70;
    }

    function setToBlackPlayer() {
      camera.alpha = 0;
      camera.beta = Math.PI / 4;
      camera.radius = 70;
    }
  }

  window.onresize = function refreshCanvas() {
    let gameSceneCamera: any = gameScene.cameras[0];
    gameSceneCamera.radius = 70;
    engine.resize();
  };

  engine.runRenderLoop(function () {
    gameScene.render();
  });

  return view;
};

export type CanvasView = {
  gameScene: CustomGameScene;
  prepareGameScene: (match: Match) => void;
  updateMeshesRender: (game: Game) => void;
  resetCamera: (match: Match) => void;
  updateGameView: (match: Match) => void;
  turnAnimation: (
    originPoint: Point,
    targetPoint: Point,
    turnHistory: TurnHistory
  ) => void;
};
