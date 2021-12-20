import { Engine } from "babylonjs";
import startScreen, { CustomScene } from "./start-screen";
import gameScreen from "./game-screen";
import Game from "../component/game-logic/game";
import { findPosition, rotateCamera } from "../helper/canvas-helpers";
import Match from "../component/match";
import { TurnHistory } from "../helper/game-helpers";
import { createMeshMaterials } from "./materials";

const initCanvasView = async (
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
    playAnimation,
  };

  const {
    showScene,
    scenes: { startScene, gameScene },
  } = view;

  const materials = createMeshMaterials(gameScene);

  function playAnimation(resolved: TurnHistory) {
    if (
      (resolved.type === "standard" && resolved.targetPiece) ||
      resolved.type === "enPassant"
    ) {
      //Look up animation group based on piece breaking,
      const name = resolved.targetPiece?.name;
      const team = resolved.targetPiece?.color;
      let targetPoint = resolved.targetPiece?.point!;
      const [z, x] = findPosition(targetPoint, true);
      //@ts-ignore
      console.log(gameScene.animationsContainer[name]!);
      duplicate(
        //@ts-ignore
        gameScene.animationsContainer![name],
        x,
        z,
        team?.toLocaleLowerCase(),
        2000
      );
    }
    //Function to play the full animation and then dispose resources
    //@ts-ignore
    function duplicate(container, z, x, team, delay) {
      let entries = container.instantiateModelsToScene();
      entries.rootNodes.forEach((mesh: any) =>
        mesh
          .getChildMeshes()
          //@ts-ignore
          .forEach((mesh2: any) => (mesh2.material = materials[team]))
      );
      for (var node of entries.rootNodes) {
        node.position.y = 0.4;
        node.position.x = -z;
        node.position.z = x;
      }

      for (var group of entries.animationGroups) {
        group.play();
      }

      setTimeout(() => {
        entries.rootNodes[0].dispose();
      }, delay);
    }
  }

  function updateGameView(match: Match) {
    updateMeshesRender(match.game);
    match.matchSettings.mode === "Offline"
      ? rotateCamera(match.game.state.currentPlayer, gameScene)
      : null;
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

export default initCanvasView;

export type CanvasView = {
  showScene: { index: number };
  scenes: { startScene: CustomScene; gameScene: CustomScene };
  prepareGameScene: (match: Match) => void;
  updateMeshesRender: (game: Game) => void;
  resetCamera: (match: Match) => void;
  updateGameView: (match: Match) => void;
  prepareHomeScreen: () => void;
  playAnimation: (point: TurnHistory) => void;
};
