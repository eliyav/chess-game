import React, { useEffect, useRef, useState } from "react";
import { Location } from "react-router-dom";
import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import * as icons from "../game-overlay/overlay-icons";
import { createView, CanvasView } from "../../view/create-view";
import { LobbySettings } from "./online-lobby";
import { onlineGameEmitter } from "../../../src/events/online-game-emit";
import { TurnHistory } from "../../../src/helper/game-helpers";
import OnlineMatch from "../online-match";
import GameOverlay from "../game-overlay/game-overlay";
import LoadingScreen from "../loading-screen";
import initCanvasInput from "../../../src/view/canvas-input";
import EventEmitter from "../../../src/events/event-emitter";

interface OnlineProps {
  location: Location;
  openNavbar: React.Dispatch<React.SetStateAction<boolean>>;
  socket: any;
}

export const OnlineGameView: React.FC<OnlineProps> = ({
  openNavbar,
  socket,
  location,
}) => {
  const [gameLoaded, setGameLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasView = useRef<CanvasView>();
  const onlineMatch = useRef<OnlineMatch>();
  const onlineEmitter = useRef<EventEmitter>();
  const lobbySettings = useRef<LobbySettings>();

  async function initGame() {
    let engine = new BABYLON.Engine(canvasRef.current!, true);
    canvasView.current = await createView(canvasRef.current!, engine);
    onlineMatch.current = new OnlineMatch();
    onlineEmitter.current = onlineGameEmitter(
      onlineMatch.current!,
      canvasView.current!
    );
    canvasView.current.prepareGame(onlineMatch.current.game);
    initCanvasInput(onlineMatch.current.game, canvasView.current, resolve);

    canvasRef.current?.classList.add("gameCanvas");
    canvasRef.current?.classList.remove("notDisplayed");
    setGameLoaded(true);
    engine.resize();
  }

  function resolve(
    type: string,
    originPoint: Point,
    targetPoint: Point,
    resolved: TurnHistory
  ) {
    const lobbyKey = lobbySettings.current?.lobbyKey;
    onlineEmitter.current!.emit(type, originPoint, targetPoint, resolved);
    socket.emit("resolvedTurn", { originPoint, targetPoint, lobbyKey });
  }

  useEffect(() => {
    socket.on("message", (message: string) => console.log(message));
    socket.on("room-info", (settings: LobbySettings) => {
      lobbySettings.current = settings;
    });
    socket.on(
      "opponentsTurn",
      ({
        originPoint,
        targetPoint,
      }: {
        originPoint: Point;
        targetPoint: Point;
      }) => {
        onlineMatch.current!.game.playerMove(originPoint, targetPoint);
        const turnHistory = onlineMatch.current?.game.turnHistory!;
        canvasView.current!.turnAnimation(
          originPoint,
          targetPoint,
          turnHistory.at(-1)!
        );
        onlineMatch.current!.game.switchTurn();
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lobbyKey = params.get("room");
    socket.emit("get-room-info", lobbyKey);
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
              onClick: () => onlineEmitter.current!.emit("reset-board"),
            },
            {
              text: "undo",
              onClick: () => onlineEmitter.current!.emit("undo-move"),
            },
            {
              text: "camera",
              onClick: () => onlineEmitter.current!.emit("reset-camera"),
            },
          ]}
          icons={icons}
        />
      ) : (
        <div className="loadingContainer">
          <LoadingScreen text="..." />
        </div>
      )}
      <canvas ref={canvasRef} id="notDisplayed" touch-action="none"></canvas>
    </>
  );
};

export type IconsIndex = typeof icons;
