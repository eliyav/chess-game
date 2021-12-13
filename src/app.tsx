import React, { useEffect, useRef, useState } from "react";
import "babylonjs-loaders";
import "./index.css";
import * as BABYLON from "babylonjs";
import MainContent from "./main";
import LoadingScreen from "./component/loading-screen";
import initializeChessApp from "./component/chess-app";
import activateEmitter from "./events/emitter";
import activateSocket from "./events/sockets";
import activateGameInteraction from "./events/game-interaction";
import EventEmitter from "./events/event-emitter";
import { ChessApp } from "./component/chess-app";

const App: React.VFC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [appLoaded, setAppLoaded] = useState(false);
  const chessApp = useRef<ChessApp>();
  const socket = useRef<any>();
  const emitter = useRef<EventEmitter>();

  async function initApp(canvas: HTMLCanvasElement) {
    let engine = new BABYLON.Engine(canvas, true);
    chessApp.current = await initializeChessApp(canvas, engine);
    //Activate Socket
    socket.current = activateSocket(chessApp.current);
    //Activate Emitter
    emitter.current = activateEmitter(chessApp.current, socket);
    //Activate Game Scene interactivity
    activateGameInteraction(chessApp.current, emitter.current);
    setAppLoaded(true);
  }

  useEffect(() => {
    initApp(canvasRef.current!);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} touch-action="none"></canvas>
      {appLoaded ? (
        <MainContent
          chessApp={chessApp.current}
          emitter={emitter.current}
          socket={socket.current}
        />
      ) : (
        <LoadingScreen />
      )}
    </>
  );
};

export default App;
