import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import Game from "./game";
import startScreen from "./view/start-screen";
import gameScreen from "./view/game-screen";
import { renderScene, calculatePoint, reverseCalculateGridPoint, calculateGridPoint } from "./helper/canvas-helpers";
import createGUI from "./view/gui-overlay";
import activateEmitter from "./component/events/offline-emitter";

async function Main() {
  const canvas = document.getElementById("renderCanvas");
  const appContext = {
    gameStarted: false,
    showScene: 0,
    scenes: {
      activeScene: undefined,
      startScreen: undefined,
      gameScreen: undefined,
      optionsScreen: undefined,
    },
    engine: new BABYLON.Engine(canvas, true),
    game: new Game(),
  };
  appContext.game.setBoard();
  appContext.scenes.startScreen = await startScreen(canvas, appContext);
  appContext.scenes.gameScreen = await gameScreen(canvas, appContext);
  appContext.scenes.activeScene = appContext.scenes.startScreen;
  createGUI(appContext);
  renderScene(appContext.game, appContext.scenes.gameScreen);
  const emitter = activateEmitter(appContext.scenes.gameScreen, appContext.game);
  const greenMat = new BABYLON.StandardMaterial("greenMat", appContext.scenes.gameScreen);
  let tempMoves = [];
  appContext.scenes.gameScreen.onPointerDown = async (e, pickResult) => {
    console.log(pickResult);
    if (appContext.showScene === 1) {
      const mesh = pickResult.pickedMesh;
      console.log(mesh);
      if (tempMoves.length === 0) {
        if (mesh.color === appContext.game.gameState.currentPlayer) {
          const [x, y] = reverseCalculateGridPoint([mesh.position.z, mesh.position.x]);
          const piece = appContext.game.board.grid[x][y].on;
          const moves = piece.calculateAvailableMoves(appContext.game.board.grid);
          tempMoves.push(piece.point);
          moves.forEach((point, idx) => {
            const plane = BABYLON.MeshBuilder.CreatePlane(`plane`, { width: 2.8, height: 2.8 });
            greenMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
            const gridPoint = calculateGridPoint(point);
            plane.position.z = gridPoint[0];
            plane.position.x = -gridPoint[1];
            plane.position.y += 0.01;
            plane.material = greenMat;
            plane.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
            plane.point = point;
            appContext.scenes.activeScene.meshesToRender.push(plane);
          });
        }
      } else if (mesh.color === appContext.game.gameState.currentPlayer) {
        //Check for castling first

        //If not castling, then show the available moves of the newly clicked piece
        tempMoves = [];
        renderScene(appContext.game, appContext.scenes.gameScreen);
        const [x, y] = reverseCalculateGridPoint([mesh.position.z, mesh.position.x]);
        const piece = appContext.game.board.grid[x][y].on;
        const moves = piece.calculateAvailableMoves(appContext.game.board.grid);
        tempMoves.push(piece.point);
        moves.forEach((point, idx) => {
          const plane = BABYLON.MeshBuilder.CreatePlane(`plane`, { width: 2.8, height: 2.8 });
          greenMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
          const gridPoint = calculateGridPoint(point);
          plane.position.z = gridPoint[0];
          plane.position.x = -gridPoint[1];
          plane.position.y += 0.01;
          plane.material = greenMat;
          plane.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
          plane.point = point;
          appContext.scenes.activeScene.meshesToRender.push(plane);
        });
      } else if (mesh.id === "plane") {
        tempMoves.push(mesh.point);
      } else if (mesh.color !== appContext.game.gameState.currentPlayer) {
        const [x, y] = reverseCalculateGridPoint([mesh.position.z, mesh.position.x]);
        const piece = appContext.game.board.grid[x][y].on;
        tempMoves.push(piece.point);
      }
      //If tempmoves contains 2 points, move the piece
      tempMoves.length === 2 ? emitter.emit("move", tempMoves[0], tempMoves[1]) : null;
      tempMoves.length >= 2 ? (tempMoves = []) : null;
    }
  };

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
