import { Engine } from "babylonjs";
import { gameScreen } from "./game-screen";
import Game from "../component/game-logic/game";
import { findPosition } from "../helper/canvas-helpers";
import { TurnHistory } from "../helper/game-helpers";
import { CustomGameScene } from "./game-assets";
import calcTurnAnimation from "./animation/turn-animation";

export const createView = async (
  canvas: HTMLCanvasElement,
  engine: Engine
): Promise<CanvasView> => {
  const view = {
    gameScene: await gameScreen(canvas, engine),
    prepareGame,
    updateMeshesRender,
    updateGameView,
    turnAnimation,
    resetCamera,
    rotateCamera,
  };

  const { gameScene } = view;

  function turnAnimation(
    ...props: [originPoint: Point, targetPoint: Point, turnHistory: TurnHistory]
  ) {
    return calcTurnAnimation(gameScene, ...props);
  }

  function prepareGame(game: Game, team?: string) {
    updateMeshesRender(game);
    resetCamera(game, team);
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

  function updateGameView(game: Game) {
    updateMeshesRender(game);
    rotateCamera(game);
  }

  function resetCamera(game: Game, team?: string) {
    let camera: any = gameScene.cameras[0];
    if (!team) {
      game.state.currentPlayer === "White"
        ? setToWhitePlayer()
        : setToBlackPlayer();
    } else {
      parseInt(team) === 1 ? setToWhitePlayer() : setToBlackPlayer();
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

  function rotateCamera(game: Game) {
    let currentPlayer = game.state.currentPlayer;
    let camera: any = gameScene.cameras[0];
    let alpha = camera.alpha;
    let ratio;
    let subtractedRatio;
    let piDistance;
    let remainingDistance: number;
    let remainder: number;

    if (alpha < 0) {
      ratio = Math.ceil(alpha / Math.PI);
      subtractedRatio = alpha - ratio * Math.PI;
      piDistance = Math.abs(Math.PI + subtractedRatio);
    } else {
      ratio = Math.floor(alpha / Math.PI);
      subtractedRatio = alpha - ratio * Math.PI;
      piDistance = Math.PI - subtractedRatio;
    }

    remainder = ratio % 2;

    if (currentPlayer === "Black") {
      remainder
        ? (remainingDistance = piDistance)
        : (remainingDistance = Math.PI - piDistance);
    } else {
      remainder
        ? (remainingDistance = Math.PI - piDistance)
        : (remainingDistance = piDistance);
    }

    const animateCameraRotation = (currentPlayer: string) => {
      requestAnimationFrame(() => {
        const playerFlag = currentPlayer === "Black" ? true : false;
        const rotateAmount = remainingDistance > 0.05 ? 0.05 : 0.01;
        rotateCam(playerFlag, rotateAmount);
      });

      const rotateCam = (playerFlag: boolean, rotateAmount: number) => {
        if (remainder) {
          if (alpha < 0) {
            playerFlag
              ? (camera.alpha -= rotateAmount)
              : (camera.alpha += rotateAmount);
          } else {
            playerFlag
              ? (camera.alpha += rotateAmount)
              : (camera.alpha -= rotateAmount);
          }
        } else {
          if (alpha > 0) {
            playerFlag
              ? (camera.alpha -= rotateAmount)
              : (camera.alpha += rotateAmount);
          } else {
            playerFlag
              ? (camera.alpha += rotateAmount)
              : (camera.alpha -= rotateAmount);
          }
        }
        remainingDistance -= rotateAmount;
        if (remainingDistance > 0.01) {
          animateCameraRotation(currentPlayer);
        }
      };
    };
    animateCameraRotation(currentPlayer);
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
  prepareGame: (game: Game, team?: string) => void;
  updateMeshesRender: (game: Game) => void;
  updateGameView: (game: Game) => void;
  resetCamera: (game: Game, team?: string) => void;
  rotateCamera: (game: Game) => void;
  turnAnimation: (
    originPoint: Point,
    targetPoint: Point,
    turnHistory: TurnHistory
  ) => void;
};
