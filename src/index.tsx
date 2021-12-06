import React from "react";
import ReactDOM from "react-dom";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import "./index.css";
import Main from "./main";
import initializeChessApp from "./component/chess-app";
import activateEmitter from "./events/emitter";
import LoadingScreen from "./component/loading-screen";
import activateSocket from "./events/sockets";
import activateGameInteraction from "./events/game-interaction";

ReactDOM.render(
  <React.StrictMode>
    <canvas id="renderCanvas" touch-action="none"></canvas>
    <LoadingScreen />
  </React.StrictMode>,
  document.getElementById("root")
);

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
initApp(canvas);

async function initApp(canvas: HTMLCanvasElement) {
  let engine = new BABYLON.Engine(canvas, true);
  const chessApp = await initializeChessApp(canvas, engine);

  //Activate Socket
  const socket = activateSocket(chessApp);

  //Activate Emitter
  const emitter = activateEmitter(chessApp, socket);

  //Activate Game Scene interactivity
  activateGameInteraction(chessApp, emitter);

  ReactDOM.render(
    <React.StrictMode>
      <canvas id="renderCanvas" touch-action="none"></canvas>
      <Main chessApp={chessApp} emitter={emitter} socket={socket} />
    </React.StrictMode>,
    document.getElementById("root")
  );
}
