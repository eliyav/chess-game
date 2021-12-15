import React, { useEffect, useRef, useState } from "react";
import "babylonjs-loaders";
import "./index.css";
import * as BABYLON from "babylonjs";
import MainContent from "./main-content";
import LoadingScreen from "./component/loading-screen";
import activateEmitter from "./events/emitter";
import activateSocket from "./events/sockets";
import activateGameInteraction from "./events/game-interaction";
import EventEmitter from "./events/event-emitter";
import Game from "./component/game-logic/game";
import chessData from "./component/game-logic/chess-data-import";
import initRender, { RenderContext } from "./view/render-context";
import MatchContext from "./component/match-context";

const App: React.VFC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [appLoaded, setAppLoaded] = useState(false);
  const chessGame = useRef<Game>(new Game(chessData));
  const matchContext = useRef<MatchContext>(new MatchContext({}));
  const renderContext = useRef<RenderContext>();
  const socket = useRef<any>();
  const emitter = useRef<EventEmitter>();

  async function initApp(canvas: HTMLCanvasElement) {
    let engine = new BABYLON.Engine(canvas, true);
    renderContext.current = await initRender(canvasRef.current!, engine);
    //Activate Socket
    socket.current = activateSocket(
      chessGame.current,
      matchContext.current,
      renderContext.current
    );
    //Activate Emitter
    emitter.current = activateEmitter(
      chessGame.current,
      matchContext.current,
      renderContext.current,
      socket.current
    );
    //Activate Game Scene interactivity
    activateGameInteraction(
      chessGame.current,
      matchContext.current,
      renderContext.current,
      emitter.current
    );
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
          chessGame={chessGame.current}
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
