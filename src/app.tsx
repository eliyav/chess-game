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
import { useAuth0 } from "@auth0/auth0-react";

const App: React.VFC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [appLoaded, setAppLoaded] = useState(false);
  const canvasView = useRef<CanvasView>();
  const socket = useRef<any>();
  const emitter = useRef<EventEmitter>();
  const matchRef = useRef<Match>(new Match({}, emitter.current, true));
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

  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();

  useEffect(() => {
    if (isAuthenticated)
      (async () => {
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user: {
                email: user?.email,
                sub: user?.sub,
                created: new Date(user?.updated_at!),
                lastLogin: new Date(user?.updated_at!),
                picture: user?.picture,
              },
            }),
          });
        } catch (err) {
          console.log(err);
        }
      })();
  }, [user, isAuthenticated]);

  useEffect(() => {
    initApp(canvasRef.current!);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} touch-action="none"></canvas>
      {appLoaded ? (
        <MainContent
          timerRef={timerRef}
          emitter={emitter.current!}
          socket={socket.current}
        />
      ) : (
        <LoadingScreen />
      )}
    </>
  );
};

export default App;
