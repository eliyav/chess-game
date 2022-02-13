import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import initEmitter from "../events/emitter";
import initSocket from "../events/sockets";
import { initCanvasView, CanvasView } from "../view/view-init";
import EventEmitter from "../events/event-emitter";
import Match from "./match";
import Timer from "./game-logic/timer";
import initGameController from "../events/game-interaction";
import { useLocation } from "react-router-dom";
import GameOverlay from "./game-overlay/game-overlay";
import * as icons from "./game-overlay/overlay-icons";
import LoadingScreen from "./loading-screen";

interface Props {}

export const GameView: React.FC<Props> = () => {
  const [gameLoaded, setGameLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasView = useRef<CanvasView>();
  const socket = useRef<any>();
  const emitter = useRef<EventEmitter>();
  const matchRef = useRef<Match>(new Match({}, emitter.current, true));
  const timerRef = useRef<Timer | undefined>();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode")!;
  const time = parseInt(params.get("time")!);

  async function initApp(canvas: HTMLCanvasElement) {
    let engine = new BABYLON.Engine(canvas, true);
    canvasView.current = await initCanvasView(canvasRef.current!, engine);
    // Activate Socket
    socket.current = initSocket(matchRef, canvasView.current!);
    //Activate Emitter
    emitter.current = initEmitter(
      matchRef,
      canvasView.current!,
      socket.current,
      timerRef
    );
    //Init Game Controller
    initGameController(matchRef, canvasView.current!, emitter.current);

    emitter.current.emit("create-match", { mode, time, player: undefined });
    setGameLoaded(true);
  }

  useEffect(() => {
    initApp(canvasRef.current!);
  }, []);

  return (
    <>
      {gameLoaded ? (
        <GameOverlay
          timerRef={timerRef.current}
          items={[
            {
              text: "menu",
              onClick: () => {},
            },
            {
              text: "restart",
              onClick: () => {},
            },
            {
              text: "undo",
              onClick: () => emitter.current!.emit("undo-move"),
            },
            {
              text: "camera",
              onClick: () => {
                // emitter.emit("reset-camera");
              },
            },
            {
              text: "pause",
              onClick: () => {
                // emitter.emit("pause-game");
              },
            },
          ]}
          icons={icons}
        />
      ) : (
        <LoadingScreen />
      )}
      <canvas ref={canvasRef} touch-action="none"></canvas>
    </>
  );
};

export type IconsIndex = typeof icons;
