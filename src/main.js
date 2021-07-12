import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import Game from "./game";
import createScene from "./view/create-scene";
import assetLoader from "./view/asset-loader";
import introScene from "./view/intro-scene";
import activateEmitter from "./component/events/offline-emitter";
import activateInput from "./component/events/activate-input";
import { renderScene } from "./helper/canvas-helpers";
import addEventListeners from "./component/events/add-event-listeners";
import sky from "../assets/sky.jpg";

async function Main() {
  const gameContext = {
    gameStarted: false,
  };
  //#region HTML Selectors
  const canvas = document.getElementById("renderCanvas");
  gameContext.scene = activateScene();
  gameContext.scene.boardMesh = await introScene();
  const boardMesh = gameContext.scene.boardMesh;
  console.log(boardMesh);
  let alpha = Math.PI / 2;
  let beta = 0;
  let gamma = 0;

  const photoDome = new BABYLON.PhotoDome("testdome", sky, { size: 1000 }, gameContext.scene);

  const animateDistance = () => {
    requestAnimationFrame(() => {
      alpha += 0.01;
      beta += 0.01;
      gamma += 0.01;
      // boardMesh[0].rotation = new BABYLON.Vector3(0, 0, 0);
      //boardMesh[1].rotation.y = beta;
      boardMesh[0].rotate(new BABYLON.Vector3(0, beta, 0), (1 * Math.PI) / 500, BABYLON.Space.LOCAL);
      boardMesh[1].rotate(new BABYLON.Vector3(0, -beta * 2, 0), (1 * Math.PI) / 500, BABYLON.Space.LOCAL);
      // boardMesh[2].rotation = new BABYLON.Vector3(0, 0, 0);
      animateDistance();
    });
  };
  animateDistance();

  // const middleContent = document.getElementById("intro");
  // const homeButton = document.getElementById("home");
  // const startGameButton = document.getElementById("start-game");
  // const createRoomButton = document.getElementById("create-room");
  // const joinRoomButton = document.getElementById("join-room");
  //#endregion

  //#region Event listeners
  // homeButton.addEventListener("click", () => {
  //   canvas.style.display = "none";
  //   middleContent.style.display = "block";
  // });

  // startGameButton.addEventListener("click", () => startOfflineGame());

  // createRoomButton.addEventListener("click", () => createOnlineGame());

  // joinRoomButton.addEventListener("click", () => joinOnlineGame());

  //#endregion

  //#region Start Game Modes
  const startOfflineGame = async () => {
    gameContext.gameStarted === true
      ? (() => {
          canvas.style.display = "block";
          middleContent.style.display = "none";
          gameContext.game.resetBoard();
          renderScene(gameContext.game, gameContext.scene);
        })()
      : (async () => {
          gameContext.gameStarted = true;
          gameContext.game = activateGame("Offline");
          gameContext.scene = activateScene();
          gameContext.scene.finalMeshes = await assetLoader(BABYLON.SceneLoader.ImportMeshAsync);
          gameContext.emitter = activateEmitter(gameContext.scene, gameContext.game);
          activateInput(gameContext.scene, gameContext.game, gameContext.emitter);
          addEventListeners(gameContext.emitter);
          renderScene(gameContext.game, gameContext.scene);
        })();
  };

  const createOnlineGame = async () => {
    activateSockets();
    socket.emit("request-room-id");
    activateGame("Online");
    activateEmitter();
  };

  const joinOnlineGame = async () => {
    gameMode = "Online";
    activateSockets();
    await activateGame("Online");
    activateEmitter();
    room = prompt("Please enter the room key");
    socket.emit("join-room", room);
  };

  function activateScene() {
    const { engine, scene } = createScene(canvas);
    (() => {
      engine.runRenderLoop(function () {
        scene.render();
      });
    })();
    return scene;
  }

  // const activateGame = (mode) => {
  //   const game = new Game(mode);
  //   game.setBoard();

  //   return game;
  // };

  // const activateOnlineGame = (user) => {
  //   activateInput();
  //   if (user === "White") {
  //     player = "White";
  //   } else {
  //     player = "Black";
  //     scene.cameras[0].alpha = 0;
  //   }
  // };
}

Main();
