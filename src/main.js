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
  let engine, game, scene, socket, emitter, room, player, tempMoves, gameMode;
  //#region HTML Selectors
  const homeButton = document.getElementById("home");
  const resetBoardButton = document.getElementById("reset-board");
  const startGameButton = document.getElementById("start-game");
  const createRoomButton = document.getElementById("create-room");
  const joinRoomButton = document.getElementById("join-room");
  const gameUndoButton = document.getElementById("undo-turn");
  const gameDrawButton = document.getElementById("request-draw");
  const gameResignButton = document.getElementById("resign-game");
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
    gameMode = "Offline";
    startOfflineGame();
  });

  createRoomButton.addEventListener("click", () => {
    createOnlineGame();
  });

  joinRoomButton.addEventListener("click", () => {
    joinOnlineGame();
  });

  const startOfflineGame = async () => {
    resetGameContext();
    if (gameStarted === false) await activateGame();
    activateEmitter();
    activateInput(emitter);
  };

  const createOnlineGame = async () => {
    resetGameContext();
    gameMode = "Online";
    activateSockets();
    socket.emit("request-room-id");
    await activateGame();
    activateEmitter();
  };

  const joinOnlineGame = async () => {
    resetGameContext();
    gameMode = "Online";
    activateSockets();
    await activateGame();
    activateEmitter();
    room = prompt("Please enter the room key");
    socket.emit("join-room", room);
  };

  const activateOnlineGame = (user) => {
    activateInput();
    if (user === "White") {
      player = "White";
    } else {
      player = "Black";
      scene.cameras[0].alpha = 0;
    }
  };
  //#endregion

  //#region Game Activation Functions
  const activateGame = async () => {
    gameStarted = true;
    canvas.style.display = "block";
    middleContent.style.display = "none";
    engine = new BABYLON.Engine(canvas, true);
    game = new Game(chessData);
    game.setBoard();
    scene = await Canvas(engine, canvas, game, BABYLON, GUI);
    tempMoves = [];
    window.game = game;
    //Scene Renderer
    (async () => {
      engine.runRenderLoop(function () {
        scene.render();
      });
    })();
  };

  const resetGameContext = () => {
    if (engine !== undefined) engine.stopRenderLoop();
    if (game !== undefined) game.resetBoard();
    if (game !== undefined && scene !== undefined) renderScene(game, scene);
    if (scene !== undefined) scene.onPointerDown = undefined;
    gameStarted = false;
    player = undefined;
    gameAnnotation.innerHTML = "";
    engine = undefined;
    game = undefined;
    emitter = undefined;
    scene = undefined;
    tempMoves = undefined;
    gameMode = undefined;
    room = undefined;
    socket = undefined;
  };

  const activateInput = () => {
    tempMoves = [];
    if (scene !== undefined) {
      if (scene.onPointerDown === undefined) {
        scene.onPointerDown = async (e, pickResult) => {
          let isCurrentPlayer;
          //Calculate X/Y point for grid from the canvas X/Z
          if (gameMode === "Online") {
            isCurrentPlayer = player === game.gameState.currentPlayer;
          } else {
            isCurrentPlayer = true;
          }
          if (isCurrentPlayer) {
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
          } else {
            console.log("Opponents Turn!");
          }
        };
      }
    }
  };

  //#endregion

  //#region Sockets
  const activateSockets = () => {
    socket = io("ws://localhost:3000");

    socket.on("stateChange", (newState) => {
      const { originPoint, targetPoint } = newState;
      game.playerMove(originPoint, targetPoint);
      game.switchTurn();
      renderScene(game, scene);
    });

    socket.on("reply-room-id", (id) => {
      console.log(id);
      room = id;
    });

    socket.on("message", (message) => {
      console.log(message);
    });

    socket.on("room-info", (info) => {
      let user;
      if (info.length === 2) {
        console.log("game has been activated");
        socket.id === info[0] ? (user = "White") : (user = "Black");
        activateOnlineGame(user);
      }
    });

    socket.on("reset-board-request", () => {
      const answer = prompt("Opponent has requested to reset the board, do you agree?, Enter Yes or No");
      if (answer === "Yes" || answer === "yes" || answer === "YES") {
        socket.emit("reset-board-response", "Yes");
      }
    });

    socket.on("reset-board-resolve", (response) => {
      if (response === "Yes") {
        game.resetBoard();
        renderScene(game, scene);
      }
    });

    socket.on("draw-request", () => {
      const answer = prompt("Opponent has offered a game Draw, do you accept?, Enter Yes or No");
      if (answer === "Yes" || answer === "yes" || answer === "YES") {
        socket.emit("draw-response", "Yes");
      }
    });

    socket.on("draw-resolve", (response) => {
      if (response === "Yes") {
        game.resetBoard();
        renderScene(game, scene);
      }
    });

    socket.on("resign-request", () => {
      game.resetBoard();
      renderScene(game, scene);
    });
  };
  //#endregion

  //#region Emitter
  const activateEmitter = () => {
    emitter = new EventEmitter();
    if (resetBoardButton.getAttribute("listener") !== "true") {
      resetBoardButton.setAttribute("listener", "true");
      resetBoardButton.addEventListener("click", () => emitter.emit("reset-board"));
    }

    if (gameDrawButton.getAttribute("listener") !== "true") {
      gameDrawButton.setAttribute("listener", "true");
      gameDrawButton.addEventListener("click", () => emitter.emit("draw"));
    }

    if (gameResignButton.getAttribute("listener") !== "true") {
      gameResignButton.setAttribute("listener", "true");
      gameResignButton.addEventListener("click", () => emitter.emit("resign"));
    }

    if (gameMode === "Online") {
      //Game mode is online
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
          socket.emit("reset-board");
        }
      });

      emitter.on("draw", () => {
        const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
        if (answer === "Yes" || answer === "yes" || answer === "YES") {
          socket.emit("draw");
        }
      });

      emitter.on("resign", () => {
        const answer = prompt("Are you sure you want to resign the game?, Enter Yes or No");
        if (answer === "Yes" || answer === "yes" || answer === "YES") {
          game.resetBoard();
          renderScene(game, scene);
          socket.emit("resign-game");
        }
      });
    } else {
      //Game mode is offline
      emitter.on("move", (originPoint, targetPoint, mygame = game, myscene = scene) => {
        const resolved = mygame.playerMove(originPoint, targetPoint);
        if (resolved) {
          renderScene(mygame, myscene);
          mygame.switchTurn();
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

      emitter.on("draw", () => {
        const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
        if (answer === "Yes" || answer === "yes" || answer === "YES") {
          //Add Based on Turn effect
        }
      });

      emitter.on("resign", () => {
        const answer = prompt("Are you sure you want to resign the game?, Enter Yes or No");
        if (answer === "Yes" || answer === "yes" || answer === "YES") {
          //Add based on turn effect
        }
      });
    }
  };
  //#endregion
}

Main();
