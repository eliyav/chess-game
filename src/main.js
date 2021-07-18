import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import Game from "./game";
import startScreen from "./view/start-screen";
import gameScreen from "./view/game-screen";
import { renderScene, reverseCalculateGridPoint, calculateGridPoint } from "./helper/canvas-helpers";
import createGUI from "./view/gui-overlay";
import activateEmitter from "./component/events/emitter";
import { doMovesMatch } from "../src/helper/game-helpers";

async function Main() {
  const canvas = document.getElementById("renderCanvas");
  const appContext = {
    engine: new BABYLON.Engine(canvas, true),
    game: new Game(),
    gameMode: { mode: undefined },
    showScene: 0,
    scenes: {
      startScreen: undefined,
      gameScreen: undefined,
      optionsScreen: undefined,
    },
    emitter: undefined,
    sockets: undefined,
  };
  appContext.game.setBoard();
  appContext.scenes.startScreen = await startScreen(canvas, appContext);
  appContext.scenes.gameScreen = await gameScreen(canvas, appContext);
  appContext.emitter = activateEmitter(appContext);
  createGUI(appContext);
  renderScene(appContext.game, appContext.scenes.gameScreen);

  const greenMat = new BABYLON.StandardMaterial("greenMat", appContext.scenes.gameScreen);
  let tempMoves = [];
  appContext.scenes.gameScreen.onPointerDown = async (e, pickResult) => {
    if (appContext.showScene === 1) {
      const mesh = pickResult.pickedMesh;
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
            appContext.scenes.gameScreen.meshesToRender.push(plane);
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
      } else if (mesh.color) {
        if (mesh.color !== appContext.game.gameState.currentPlayer) {
          const [x, y] = reverseCalculateGridPoint([mesh.position.z, mesh.position.x]);
          const opponentsPiece = appContext.game.board.grid[x][y].on;
          const [x2, y2] = tempMoves[0];
          const originalPiece = appContext.game.board.grid[x2][y2].on;
          const moves = originalPiece.calculateAvailableMoves(appContext.game.board.grid);
          const checkIfTrue = moves.find((move) => doMovesMatch(move, opponentsPiece.point));
          if (checkIfTrue) {
            const [x, y] = reverseCalculateGridPoint([mesh.position.z, mesh.position.x]);
            const piece = appContext.game.board.grid[x][y].on;
            tempMoves.push(piece.point);
          }
        }
      }
      //If tempmoves contains 2 points, move the piece
      tempMoves.length === 2 ? appContext.emitter.emit("move", tempMoves[0], tempMoves[1]) : null;
      tempMoves.length >= 2 ? (tempMoves = []) : null;
    }
  };

  (() => {
    appContext.engine.runRenderLoop(function () {
      switch (appContext.showScene) {
        case 0:
          appContext.scenes.startScreen.attachControl();
          appContext.scenes.startScreen.render();
          break;
        case 1:
          appContext.scenes.gameScreen.attachControl();
          appContext.scenes.gameScreen.render();
          break;
        case 2:
          break;
      }
    });
  })();
}

Main();
