import React, { useEffect, useRef, useState } from "react";
import { Location } from "react-router-dom";
import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import * as icons from "../component/game-overlay/overlay-icons";
import { createView, CanvasView } from "../view/create-view";
import { LobbySettings } from "./online-lobby";
import { onlineGameEmitter } from "../events/online-game-emit";
import { TurnHistory } from "../helper/game-helpers";
import { RequestModal } from "../component/modals/request-modal";
import { MessageModal } from "../component/modals/message-modal";
import { MenuOverlay } from "../component/game-overlay/menu-overlay";
import OnlineMatch from "../component/online-match";
import initCanvasInput from "../view/canvas-input";
import EventEmitter from "../events/event-emitter";
import LoadingScreen from "../component/loading-screen";
import PromotionModal from "../component/modals/promotion-modal";
import { TimerOverlay } from "../timer/timer-overlay";

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
  const [request, setRequest] = useState<{
    question: string;
    onConfirm: () => void;
    onReject: () => void;
  } | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    onConfirm: () => void;
  } | null>(null);
  const [promotion, setPromotion] = useState(false);

  async function initGame(team: string) {
    let engine = new BABYLON.Engine(canvasRef.current!, true);
    canvasView.current = await createView(canvasRef.current!, engine);
    onlineMatch.current = new OnlineMatch(
      team,
      lobbySettings.current?.time!,
      endMatch
    );
    onlineEmitter.current = onlineGameEmitter(
      onlineMatch.current!,
      canvasView.current!
    );
    initCanvasInput(
      onlineMatch.current.game,
      onlineMatch.current.timer,
      canvasView.current,
      resolve,
      true,
      onlineMatch.current.team
    );

    canvasRef.current?.classList.add("gameCanvas");
    canvasRef.current?.classList.remove("notDisplayed");
    canvasView.current.prepareGame(onlineMatch.current.game, team);
    engine.resize();
    setGameLoaded(true);
    onlineMatch.current.startMatch();

    onlineEmitter.current.on("promotion-selections", () => {
      setTimeout(() => setPromotion(true), 1000);
    });

    onlineEmitter.current.on("end-match", (winningTeam: string) => {
      canvasView.current?.gameScene.detachControl();
      setRequest({
        question: `${winningTeam} team has won!, Would you like to play another game?`,
        onConfirm: () => {
          socket.emit("match-restart", lobbySettings.current?.lobbyKey);
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
    history: TurnHistory
  ) {
    const lobbyKey = lobbySettings.current?.lobbyKey;
    onlineEmitter.current!.emit(type, originPoint, targetPoint, history);
    socket.emit("resolvedTurn", { originPoint, targetPoint, lobbyKey });
    if (history.promotion !== undefined)
      socket.emit("promotion-await", lobbyKey);
  }

  function endMatch() {
    const winningTeam =
      onlineMatch.current?.game.state.currentPlayer ===
      onlineMatch.current?.game.teams[0]
        ? onlineMatch.current?.game.teams[1]
        : onlineMatch.current?.game.teams[0];
    onlineEmitter.current?.emit("end-match", winningTeam);
  }

  useEffect(() => {
    socket.on("message", (message: string) => console.log(message));
    socket.on("room-info", (settings: LobbySettings) => {
      lobbySettings.current = settings;
    });
    socket.on(
      "resolvedMove",
      ({
        originPoint,
        targetPoint,
      }: {
        originPoint: Point;
        targetPoint: Point;
      }) => {
        onlineMatch.current!.game.playerMove(originPoint, targetPoint);
        const turnHistoryLog = onlineMatch.current?.game.turnHistory!;
        const turnHistory = turnHistoryLog[turnHistoryLog.length - 1];
        canvasView.current!.turnAnimation(
          originPoint,
          targetPoint,
          turnHistory
        );
        if (turnHistory.promotion === undefined) {
          const isMatchOver = onlineMatch.current!.game.switchTurn();
          if (isMatchOver) {
            canvasView.current?.gameScene.detachControl();
            const winningTeam =
              onlineMatch.current?.game.state.currentPlayer ===
              onlineMatch.current?.game.teams[0]
                ? onlineMatch.current?.game.teams[1]
                : onlineMatch.current?.game.teams[0];
            onlineEmitter.current?.emit("end-match", winningTeam);
          }
        }
      }
    );

    socket.on("promotion-await", () => {
      canvasView.current!.gameScene.detachControl();
      setMessage({
        text: "Please wait for opponent to select his promotion piece",
        onConfirm: () => setMessage(null),
      });
    });

    socket.on("promote-piece", (piece: string) => {
      onlineEmitter.current!.emit("selected-promotion-piece", piece);
    });

    socket.on("match-restart-request", (lobbyKey: string) => {
      setRequest({
        question: "Opponent has requested to restart the match, do you agree?",
        onConfirm: () => {
          socket.emit("match-restart-response", true, lobbyKey);
          setRequest(null);
        },
        onReject: () => {
          socket.emit("match-restart-response", false, lobbyKey);
          setRequest(null);
        },
      });
    });

    socket.on("match-restart-resolve", (response: boolean) => {
      if (response) {
        onlineMatch.current?.resetMatch();
        canvasView.current?.prepareGame(onlineMatch.current?.game!);
        setMessage({
          text: "Match restart request has been accepted",
          onConfirm: () => setMessage(null),
        });
      } else {
        setMessage({
          text: "Board reset request has been denied",
          onConfirm: () => setMessage(null),
        });
      }
    });

    socket.on("board-reset-request", (lobbyKey: string) => {
      setRequest({
        question: "Opponent has requested to reset the board, do you agree?",
        onConfirm: () => {
          socket.emit("board-reset-response", true, lobbyKey);
          setRequest(null);
        },
        onReject: () => {
          socket.emit("board-reset-response", false, lobbyKey);
          setRequest(null);
        },
      });
    }),
      socket.on("board-reset-resolve", (response: boolean) => {
        if (response) {
          onlineEmitter.current!.emit("board-reset");
          setMessage({
            text: "Board reset request has been accepted",
            onConfirm: () => setMessage(null),
          });
        } else {
          setMessage({
            text: "Board reset request has been denied",
            onConfirm: () => setMessage(null),
          });
        }
      });

    socket.on("undo-move-request", (lobbyKey: string) => {
      setRequest({
        question:
          "Opponent has requested to undo their last move, do you agree?",
        onConfirm: () => {
          socket.emit("undo-move-response", true, lobbyKey);
          setRequest(null);
        },
        onReject: () => {
          socket.emit("undo-move-response", false, lobbyKey);
          setRequest(null);
        },
      });
    }),
      socket.on("undo-move-resolve", (response: boolean) => {
        if (response) {
          onlineEmitter.current!.emit("undo-move");
          setMessage({
            text: "Undo move request has been accepted",
            onConfirm: () => setMessage(null),
          });
        } else {
          setMessage({
            text: "Undo move request has been denied",
            onConfirm: () => setMessage(null),
          });
        }
      });

    socket.on("pause-game-request", (lobbyKey: string) => {
      let requestText;
      if (onlineMatch.current?.timer.paused) {
        requestText =
          "Opponent has requested to unpause the game, do you agree?";
      } else {
        requestText = "Opponent has requested to pause the game, do you agree?";
      }
      setRequest({
        question: requestText,
        onConfirm: () => {
          socket.emit("pause-game-response", true, lobbyKey);
          setRequest(null);
        },
        onReject: () => {
          socket.emit("pause-game-response", false, lobbyKey);
          setRequest(null);
        },
      });
    }),
      socket.on("pause-game-resolve", (response: boolean) => {
        const gamePaused = onlineMatch.current?.timer.paused;
        if (response) {
          onlineMatch.current?.timer.toggleTimer();
          setMessage({
            text: `${
              gamePaused ? "Unpause" : "Pause"
            } game request has been accepted`,
            onConfirm: () => setMessage(null),
          });
        } else {
          setMessage({
            text: `${
              gamePaused ? "Unpause" : "Pause"
            } game request has been denied`,
            onConfirm: () => setMessage(null),
          });
        }
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lobbyKey = params.get("room");
    const team = params.get("move") as string;
    socket.emit("get-room-info", lobbyKey);
    initGame(team);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="notDisplayed" touch-action="none"></canvas>
      {gameLoaded ? (
        <MenuOverlay
          items={[
            {
              text: "menu",
              onClick: () => openNavbar(true),
            },
            {
              text: "restart",
              onClick: () =>
                socket.emit("board-reset", lobbySettings.current?.lobbyKey),
            },
            {
              text: "undo",
              onClick: () =>
                socket.emit("undo-move", lobbySettings.current?.lobbyKey),
            },
            {
              text: "camera",
              onClick: () => onlineEmitter.current!.emit("reset-camera"),
            },
            {
              text: "pause",
              onClick: () =>
                socket.emit("pause-game", lobbySettings.current?.lobbyKey),
            },
          ]}
          icons={icons}
        />
      ) : (
        <div className="loadingContainer">
          <LoadingScreen text="..." />
        </div>
      )}
      {gameLoaded && <TimerOverlay timer={onlineMatch.current?.timer!} />}
      {request ? (
        <RequestModal
          question={request.question}
          onConfirm={request.onConfirm}
          onReject={request.onReject}
        />
      ) : null}
      {message ? (
        <MessageModal text={message.text} onConfirm={message.onConfirm} />
      ) : null}
      {promotion ? (
        <PromotionModal
          submitSelection={(e) => {
            onlineEmitter.current!.emit(
              "selected-promotion-piece",
              e.target.innerText
            );
            socket.emit(
              "promote-piece",
              e.target.innerText,
              lobbySettings.current!.lobbyKey
            );
            setPromotion(false);
          }}
        />
      ) : null}
    </>
  );
};

export type IconsIndex = typeof icons;
