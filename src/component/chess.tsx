import * as BABYLON from "babylonjs";
import React, { useEffect, useRef } from "react";
import EventEmitter from "../events/event-emitter";
import inputController from "../events/input-controller";
import { ChessPieceMesh } from "../view/asset-loader";
import initializeApp, { App } from "./app";

interface Props {
  chessRef: React.MutableRefObject<App | undefined>;
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  emitter: EventEmitter | undefined;
}

const Chess: React.FC<Props> = ({ setLoaded, chessRef, emitter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const init = async () => {
    if (canvasRef.current) {
      const app = await initApp(canvasRef.current);
      chessRef.current = app;
      setLoaded(true);
    }
  };

  useEffect(() => {
    init();
  }, [canvasRef]);

  useEffect(() => {
    if (emitter !== undefined) {
      chessRef.current!.scenes.gameScene.onPointerDown = async (
        e: any,
        pickResult: any
      ) => {
        if (chessRef.current!.gameMode.mode === "online") {
          if (
            chessRef.current!.gameMode.player ===
            chessRef.current!.game.state.currentPlayer
          ) {
            onClickEvent();
          }
        } else {
          onClickEvent();
        }

        function onClickEvent() {
          if (pickResult.pickedMesh !== null) {
            const mesh: ChessPieceMesh = pickResult.pickedMesh;
            const isCompleteMove = inputController(
              mesh,
              chessRef.current!.game,
              chessRef.current!.scenes.gameScene,
              chessRef.current!.gameMode
            );
            isCompleteMove
              ? (() => {
                  const [originPoint, targetPoint] =
                    chessRef.current!.game.moves;
                  emitter!.emit("playerMove", originPoint, targetPoint);
                })()
              : null;
          }
        }
      };
    }
  }, [emitter]);

  return <canvas ref={canvasRef} touch-action="none"></canvas>;
};

export default Chess;

const initApp = async (canvas: HTMLCanvasElement) => {
  let engine = new BABYLON.Engine(canvas, true);
  const app = await initializeApp(canvas, engine);

  const {
    showScene,
    scenes: { startScene, gameScene },
  } = app;

  engine.runRenderLoop(function () {
    switch (showScene.index) {
      case 0:
        gameScene.detachControl();
        startScene.attachControl();
        startScene.render();
        break;
      case 1:
        gameScene.attachControl();
        gameScene.render();
        break;
      default:
        break;
    }
  });

  const refreshCanvas = () => {
    let startSceneCamera: any = startScene.cameras[0];
    let gameSceneCamera: any = gameScene.cameras[0];
    if (canvas.width < 768) {
      startSceneCamera.radius = 32;
      gameSceneCamera.radius = 65;
    } else {
      startSceneCamera.radius = 30;
      gameSceneCamera.radius = 40;
    }
    engine.resize();
  };

  window.onresize = refreshCanvas;

  return app;
};
