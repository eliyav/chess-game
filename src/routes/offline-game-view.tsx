import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import * as icons from "../component/game-overlay/overlay-icons";
import { createView, CanvasView } from "../view/create-view";
import { MenuOverlay } from "../component/game-overlay/menu-overlay";
import LoadingScreen from "../component/loading-screen";
import OfflineMatch from "../component/offline-match";
import initCanvasInput from "../view/canvas-input";
import { TurnHistory } from "../helper/game-helpers";
import EventEmitter from "../events/event-emitter";
import { offlineGameEmitter } from "../events/offline-game-emit";
import PromotionModal from "../component/modals/promotion-modal";
import { RequestModal } from "../component/modals/request-modal";
import { TimerOverlay } from "../timer/timer-overlay";

interface OfflineProps {
  openNavbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OfflineGameView: React.FC<OfflineProps> = ({ openNavbar }) => {
  const [gameLoaded, setGameLoaded] = useState(false);
  const [promotion, setPromotion] = useState(false);
  const [request, setRequest] = useState<{
    question: string;
    onConfirm: () => void;
    onReject: () => void;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasView = useRef<CanvasView>();
  const offlineMatch = useRef<OfflineMatch>();
  const offlineEmitter = useRef<EventEmitter>();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const time = parseInt(params.get("time")!);

  async function initGame() {
    let engine = new BABYLON.Engine(canvasRef.current!, true);
    canvasView.current = await createView(canvasRef.current!, engine);
    offlineMatch.current = new OfflineMatch(time, endMatch);
    offlineEmitter.current = offlineGameEmitter(
      offlineMatch.current!,
      canvasView.current!
    );
    canvasView.current.prepareGame(offlineMatch.current.game);
    initCanvasInput(
      offlineMatch.current.game,
      offlineMatch.current.timer,
      canvasView.current,
      resolve,
      false
    );

    canvasRef.current?.classList.add("gameCanvas");
    canvasRef.current?.classList.remove("notDisplayed");
    setGameLoaded(true);
    engine.resize();
    offlineMatch.current.startMatch();

    offlineEmitter.current.on("promotion-selections", () => {
      setTimeout(() => setPromotion(true), 1000);
    });

    offlineEmitter.current.on("end-match", (winningTeam: string) => {
      canvasView.current?.gameScene.detachControl();
      setRequest({
        question: `${winningTeam} team has won!, Would you like to play another game?`,
        onConfirm: () => {
          offlineMatch.current?.resetMatch();
          canvasView.current?.prepareGame(offlineMatch.current?.game!);
          setRequest(null);
        },
        onReject: () => {
          setRequest(null);
        },
      });
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

  function endMatch() {
    const winningTeam =
      offlineMatch.current?.game.state.currentPlayer ===
      offlineMatch.current?.game.teams[0]
        ? offlineMatch.current?.game.teams[1]
        : offlineMatch.current?.game.teams[0];
    offlineEmitter.current?.emit("end-match", winningTeam);
  }

  useEffect(() => {
    initGame();

    return () => offlineMatch.current?.resetMatch();
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="notDisplayed"
        touch-action="none"
      ></canvas>
      {gameLoaded ? (
        <MenuOverlay
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
            {
              text: "pause",
              onClick: () => offlineMatch.current?.timer.toggleTimer(),
            },
          ]}
          icons={icons}
        />
      ) : (
        <div className="loadingContainer">
          <LoadingScreen text="..." />
        </div>
      )}
      {gameLoaded && <TimerOverlay timer={offlineMatch.current?.timer!} />}
      {request ? (
        <RequestModal
          question={request.question}
          onConfirm={request.onConfirm}
          onReject={request.onReject}
        />
      ) : null}
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
