import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import * as icons from "../game-overlay/overlay-icons";
import { createView, CanvasView } from "../../view/create-view";
import GameOverlay from "../game-overlay/game-overlay";
import LoadingScreen from "../loading-screen";
import OfflineMatch from "../offline-match";
import initCanvasInput from "../../../src/view/canvas-input";
import { TurnHistory } from "../../../src/helper/game-helpers";
import EventEmitter from "../../../src/events/event-emitter";
import offlineGameEmitter from "../../../src/events/offline-game-emit";

interface OfflineProps {
  openNavbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OfflineGameView: React.FC<OfflineProps> = ({ openNavbar }) => {
  const [gameLoaded, setGameLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasView = useRef<CanvasView>();
  const offlineMatch = useRef<OfflineMatch>();
  const offlineEmitter = useRef<EventEmitter>();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode")!;
  const time = parseInt(params.get("time")!);

  async function initGame() {
    let engine = new BABYLON.Engine(canvasRef.current!, true);
    canvasView.current = await createView(canvasRef.current!, engine);
    offlineMatch.current = new OfflineMatch({ mode, time });
    offlineEmitter.current = offlineGameEmitter(
      offlineMatch.current!,
      canvasView.current!
    );
    canvasView.current.prepareGame(offlineMatch.current.game);
    initCanvasInput(offlineMatch.current.game, canvasView.current, resolve);
    setGameLoaded(true);
  }

  function resolve(
    type: string,
    originPoint: Point,
    targetPoint: Point,
    resolved: TurnHistory
  ) {
    offlineEmitter.current!.emit(type, originPoint, targetPoint, resolved);
  }

  useEffect(() => {
    //   emitter.on("piece-promotion", () => {
    //     emitter.emit("detach-game-control");
    //     setShowPromotionModal(true);
    //   });
  }, []);

  useEffect(() => {
    initGame();
  }, []);

  return (
    <>
      {gameLoaded ? (
        <GameOverlay
          items={[
            {
              text: "menu",
              onClick: () => openNavbar(true),
            },
            {
              text: "restart",
              onClick: () => offlineEmitter.current!.emit("reset-board"),
            },
            {
              text: "undo",
              onClick: () => offlineEmitter.current!.emit("undo-move"),
            },
            {
              text: "camera",
              onClick: () => offlineEmitter.current!.emit("reset-camera"),
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
