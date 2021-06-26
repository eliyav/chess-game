import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui"; //Unused for now, leave
import chessData from "./data/chessDataImport";
import Game from "./Game";
import Canvas from "./view/Canvas";
import EventEmitter from "./component/EventEmitter";
import { renderScene, calculatePoint } from "./helper/canvasHelpers";
import { io } from "socket.io-client";

async function Main() {
  const canvas = document.getElementById("renderCanvas");
  const resetBoardButton = document.getElementById("reset-board");
  const engine = new BABYLON.Engine(canvas, true);
  const game = new Game(chessData);
  game.setBoard();
  const scene = await Canvas(engine, canvas, game, BABYLON, GUI);
  const emitter = new EventEmitter();
  const socket = io("ws://localhost:3000");

  socket.on("stateChange", (newState) => {
    console.log(newState);
    game.board.grid = newState;
    renderScene(game, scene);
  });

  window.game = game;

  emitter.on("move", (originPoint, targetPoint, mygame = game, myscene = scene) => {
    const resolved = mygame.playerMove(originPoint, targetPoint);
    resolved ? renderScene(game, scene) : null;
    resolved ? mygame.switchTurn() : null;
    resolved ? socket.emit("stateChange", game.board.grid) : null;
  });

  emitter.on("reset-board", () => {
    const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
    if (answer === "Yes" || answer === "yes" || answer === "YES") {
      game.resetBoard();
      renderScene(game, scene);
    }
  });

  resetBoardButton.addEventListener("click", () => emitter.emit("reset-board"));

  //Refactor for the event to await another click event
  let tempMoves = [];
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

  //Scene Renderer
  (async () => {
    engine.runRenderLoop(function () {
      scene.render();
    });
  })();
}

Main();
