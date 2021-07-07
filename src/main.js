import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui"; //Unused for now, leave
import { io } from "socket.io-client";
import chessData from "./data/chessDataImport";
import Game from "./Game";
import Canvas from "./view/Canvas";
import EventEmitter from "./component/EventEmitter";
import { renderScene, calculatePoint } from "./helper/canvasHelpers";

async function Main() {
  let gameStarted = false;
  let engine, game, scene, socket, emitter, room, tempMoves;
  //#region HTML Selectors
  const homeButton = document.getElementById("home");
  const resetBoardButton = document.getElementById("reset-board");
  const startGameButton = document.getElementById("start-game");
  const createRoomButton = document.getElementById("create-room");
  const joinRoomButton = document.getElementById("join-room");
  const canvas = document.getElementById("renderCanvas");
  const middleContent = document.getElementById("intro");
  const gameAnnotation = document.querySelector(".game-history");
  //#endregion

  //#region buttons event listeners
  homeButton.addEventListener("click", () => {
    if (gameStarted === true) resetGameContext();
    canvas.style.display = "none";
    middleContent.style.display = "block";
  });

  startGameButton.addEventListener("click", () => {
    startOfflineGame();
  });

  createRoomButton.addEventListener("click", () => {
    CreateOnlineGame();
  });

  joinRoomButton.addEventListener("click", () => {
    joinOnlineGame();
  });

  const startOfflineGame = () => {
    if (gameStarted === false) activateGame();
    activateOfflineEmitter();
  };

  const CreateOnlineGame = () => {
    activateSockets();
    activateGame();
    activateEmitter();
    //Activate Sockets and generate Room
    //Use while loop for room size. While room is under 2 length wait for another player
    //Once two players connected start game
    //Add randomization of team side
  };

  const joinOnlineGame = () => {};

  //#endregion

  //#region Functions
  const activateGame = async () => {
    gameStarted = true;
    canvas.style.display = "block";
    middleContent.style.display = "none";
    engine = new BABYLON.Engine(canvas, true);
    game = new Game(chessData);
    game.setBoard();
    scene = await Canvas(engine, canvas, game, BABYLON, GUI);
    tempMoves = [];
    if (scene.onPointerDown === undefined) activateInput(emitter);

    //Scene Renderer
    (async () => {
      engine.runRenderLoop(function () {
        scene.render();
      });
    })();
  };

  const resetGameContext = () => {
    gameStarted = false;
    game.resetBoard();
    renderScene(game, scene);
    gameAnnotation.innerHTML = "";
    if (engine !== undefined) engine.stopRenderLoop();
    scene.onPointerDown = undefined;
    engine = undefined;
    game = undefined;
    emitter = undefined;
    scene = undefined;
    tempMoves = undefined;
  };

  const activateSockets = () => {
    socket = io("ws://localhost:3000");

    socket.on("stateChange", (newState) => {
      const { originPoint, targetPoint } = newState;
      game.playerMove(originPoint, targetPoint);
      game.switchTurn();
      renderScene(game, scene);
    });

    socket.emit("get-id");
    socket.on("sent-id", (id) => {
      console.log(id);
      room = id;
    });

    socket.on("message", (message) => {
      console.log(message);
    });

    socket.on("room-info", (data) => {
      console.log(data);
    });

    joinRoomButton.addEventListener("click", () => {
      room = prompt("Please enter the room key");
      socket.emit("join-room", room);
    });
  };

  const activateEmitter = () => {
    emitter = new EventEmitter();
    if (resetBoardButton.getAttribute("listener") !== "true") {
      resetBoardButton.setAttribute("listener", "true");
      resetBoardButton.addEventListener("click", () => emitter.emit("reset-board"));
    }

    emitter.on("move", (originPoint, targetPoint, mygame = game, myscene = scene) => {
      const resolved = mygame.playerMove(originPoint, targetPoint);
      if (resolved) {
        renderScene(mygame, myscene);
        mygame.switchTurn();
        socket.emit("stateChange", { originPoint, targetPoint, room });
        gameAnnotation.innerHTML = game.history;
      }
    });

    emitter.on("reset-board", () => {
      const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
      if (answer === "Yes" || answer === "yes" || answer === "YES") {
        game.resetBoard();
        gameAnnotation.innerHTML = "";
        renderScene(game, scene);
      }
    });
  };

  const activateOfflineEmitter = () => {
    emitter = new EventEmitter();
    if (resetBoardButton.getAttribute("listener") !== "true") {
      resetBoardButton.setAttribute("listener", "true");
      resetBoardButton.addEventListener("click", () => emitter.emit("reset-board"));
    }

    emitter.on("move", (originPoint, targetPoint, mygame = game, myscene = scene) => {
      const resolved = mygame.playerMove(originPoint, targetPoint);
      if (resolved) {
        renderScene(mygame, myscene);
        mygame.switchTurn();
        console.log(myscene);
        if (mygame.gameState.currentPlayer === "Black") {
          myscene.cameras[0].alpha = 0;
          //myscene.cameras[0].beta = 0;
        } else {
          myscene.cameras[0].alpha = -3.14;
          //myscene.cameras[0].beta =
        }

        gameAnnotation.innerHTML = game.history;
      }
    });

    emitter.on("reset-board", (myscene = scene) => {
      const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
      if (answer === "Yes" || answer === "yes" || answer === "YES") {
        game.resetBoard();
        gameAnnotation.innerHTML = "";
        renderScene(game, scene);
        myscene.cameras[0].alpha = -3.14;
      }
    });
  };

  const activateInput = (emitter) => {
    tempMoves = [];
    scene.onPointerDown = async (e, pickResult) => {
      //Calculate X/Y point for grid from the canvas X/Z
      if (pickResult.hit === false) {
        return console.log("Please click on the board!");
      } else {
        const y = pickResult.pickedPoint.x;
        const x = pickResult.pickedPoint.z;
        if (x > 12 || y > 12 || x < -12 || y < -12) {
          return console.log("Please click on a square!");
        }
        const point = calculatePoint(x, y);
        //If point is valid, push it to tempMoves
        if (tempMoves.length === 0) {
          if (game.board.grid[point[0]][point[1]].on === undefined) {
            return console.log("Not a game piece!");
          }
          typeof point == "object" && game.board.grid[point[0]][point[1]].on.color === game.gameState.currentPlayer
            ? tempMoves.push(point)
            : null;
        } else {
          typeof point == "object" ? tempMoves.push(point) : null;
        }
        //If tempmoves contains 2 points, move the piece
        tempMoves.length === 2 ? emitter.emit("move", tempMoves[0], tempMoves[1]) : null;
        tempMoves.length >= 2 ? (tempMoves = []) : null;
      }
    };
  };
  //#endregion
}

Main();
