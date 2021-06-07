import Game from "./Game";
import chessData from "./data/chessDataImport";
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import "babylonjs-loaders";
import Canvas from "../view/Canvas";

async function Main() {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = await Canvas(engine, canvas, BABYLON, chessData);
  const game = new Game(chessData, scene);
  game.setBoard();
  window.game = game;

  (async () => {
    engine.runRenderLoop(function () {
      scene.render();
    });
  })();
}

Main();

// scene.onPointerDown = function (evt, pickResult) {
//   // We try to pick an object
//   if (pickResult.hit) {
//     console.log("clicked");
//     if (pickResult.pickedMesh.isPickable) {
//       console.log(pickResult.pickedMesh);
//       pickResult.pickedMesh.$class.movement();
//       //Represent them on board
//       //Allow to move to one of these options
//     }
//   }
// };
