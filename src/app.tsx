import React, { useEffect, useRef, useState } from "react";
import "babylonjs-loaders";
import "./index.css";
import * as BABYLON from "babylonjs";
import MainContent from "./main-content";
import LoadingScreen from "./component/loading-screen";
import initEmitter from "./events/emitter";
import initSocket from "./events/sockets";
import EventEmitter from "./events/event-emitter";
import initView, { CanvasView } from "./view/view-init";
import Match from "./component/match";
import initGameController from "./events/game-interaction";
import Timer from "./component/game-logic/timer";

const App: React.VFC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [appLoaded, setAppLoaded] = useState(false);
  const matchRef = useRef<Match>();
  const canvasView = useRef<CanvasView>();
  const socket = useRef<any>();
  const emitter = useRef<EventEmitter>();
  const timerRef = useRef<Timer | undefined>();

  async function initApp(canvas: HTMLCanvasElement) {
    let engine = new BABYLON.Engine(canvas, true);
    canvasView.current = await initView(canvasRef.current!, engine);
    //Activate Socket
    socket.current = initSocket(matchRef, canvasView.current);
    //Activate Emitter
    emitter.current = initEmitter(
      matchRef,
      canvasView.current,
      socket.current,
      timerRef
    );
    //Init Game Controller
    initGameController(matchRef, canvasView.current, emitter.current);

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
          timerRef={timerRef}
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
