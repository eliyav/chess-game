import React, { useEffect, useRef } from "react";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import initEmitter from "./events/emitter";
import initSocket from "./events/sockets";
import { initCanvasView, CanvasView } from "./view/view-init";
import EventEmitter from "./events/event-emitter";
import Match from "./component/match";
import Timer from "./component/game-logic/timer";
import initGameController from "./events/game-interaction";

interface Props {}

export const GameView: React.FC<Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasView = useRef<CanvasView>();
  const socket = useRef<any>();
  const emitter = useRef<EventEmitter>();
  const matchRef = useRef<Match>(new Match({}, emitter.current, true));
  const timerRef = useRef<Timer | undefined>();

  async function initApp(canvas: HTMLCanvasElement) {
    let engine = new BABYLON.Engine(canvas, true);
    canvasView.current = await initCanvasView(canvasRef.current!, engine);
    //Activate Socket
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
  }

  useEffect(() => {
    initApp(canvasRef.current!);
  }, []);

  return <canvas ref={canvasRef} touch-action="none"></canvas>;
};
