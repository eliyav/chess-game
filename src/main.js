import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import Game from "./Game";
import Canvas from "./view/Canvas";
import EventEmitter from "./component/EventEmitter";
import chessData from "./data/chessDataImport";
import { updateScene, calculatePoint } from "./helper/canvasHelpers";

async function Main() {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = await Canvas(engine, canvas, BABYLON, GUI, chessData);
  const game = new Game(chessData, scene);
  const emitter = new EventEmitter();

  game.setBoard();
  window.game = game;

  emitter.on("move", (originPoint, targetPoint, mygame = game, myscene = scene) => {
    const resolved = mygame.movePiece(originPoint, targetPoint);
    resolved ? updateScene(originPoint, targetPoint, mygame.gameState, myscene) : null;
    resolved ? mygame.switchTurn() : null;
  });

  //Refactor for the event to await another click event
  let tempMoves = [];
  scene.onPointerDown = async (e, pickResult) => {
    //Calculate X/Y point for grid from the canvas X/Z
    const y = pickResult.pickedPoint.x;
    const x = pickResult.pickedPoint.z;
    const point = calculatePoint(x, y);
    //If point is valid, push it to tempMoves
    typeof point == "object" ? tempMoves.push(point) : null;
    console.log(x, y);
    console.log(point);

    //If tempmoves contains 2 points, move the piece
    tempMoves.length === 2 ? emitter.emit("move", tempMoves[0], tempMoves[1]) : null;
    tempMoves.length >= 2 ? (tempMoves = []) : null;
    console.log(tempMoves);
    //console.log(pickResult.pickedPoint.x);
    // console.log(pickResult.pickedPoint.z);
    //emitter.emit("move", origin, target);
  };

  let removeLater;
  //Scene Renderer
  (async () => {
    engine.runRenderLoop(function () {
      scene.render();
    });
  })();
}

Main();
