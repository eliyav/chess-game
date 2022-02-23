import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import * as icons from "../component/game-overlay/overlay-icons";
import { createView, CanvasView } from "../view/create-view";
import GameOverlay from "../component/game-overlay/game-overlay";
import LoadingScreen from "../component/loading-screen";
import OfflineMatch from "../component/offline-match";
import initCanvasInput from "../view/canvas-input";
import { TurnHistory } from "../helper/game-helpers";
import EventEmitter from "../events/event-emitter";
import { offlineGameEmitter } from "../events/offline-game-emit";
import PromotionModal from "../component/modals/promotion-modal";

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
  const [promotion, setPromotion] = useState(false);

  async function initGame() {
    let engine = new BABYLON.Engine(canvasRef.current!, true);
    canvasView.current = await createView(canvasRef.current!, engine);
    offlineMatch.current = new OfflineMatch({ mode, time });
    offlineEmitter.current = offlineGameEmitter(
      offlineMatch.current!,
      canvasView.current!
    );
    canvasView.current.prepareGame(offlineMatch.current.game);
    initCanvasInput(
      offlineMatch.current.game,
      canvasView.current,
      resolve,
      false
    );

    canvasRef.current?.classList.add("gameCanvas");
    canvasRef.current?.classList.remove("notDisplayed");
    setGameLoaded(true);
    engine.resize();

    offlineEmitter.current.on("promotion-selections", () => {
      setTimeout(() => setPromotion(true), 1000);
    });
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
              onClick: () => offlineEmitter.current!.emit("board-reset"),
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
        <div className="loadingContainer">
          <LoadingScreen text="..." />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="notDisplayed"
        touch-action="none"
      ></canvas>
      {promotion ? (
        <PromotionModal
          submitSelection={(e) => {
            offlineEmitter.current!.emit(
              "selected-promotion-piece",
              e.target.innerText
            );
            setPromotion(false);
          }}
        />
      ) : null}
    </>
  );
};

export type IconsIndex = typeof icons;
