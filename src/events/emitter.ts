import EventEmitter from "./event-emitter";
import { CanvasView } from "../view/view-init";
import Match from "../component/match";
import Timer from "../component/game-logic/timer";
import { TurnHistory } from "../helper/game-helpers";
import { rotateCamera } from "../helper/canvas-helpers";

const initEmitter = (
  matchRef: React.MutableRefObject<Match | undefined>,
  view: CanvasView,
  socket: any,
  timerRef: React.MutableRefObject<Timer | undefined>
): EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on("save-game", () => {
    const matchDocument = JSON.stringify(matchRef.current);
    socket.emit("save-game", { match: matchDocument });
  });

  emitter.on("lookup-game", () => {
    const lookupId = "61c243014899ba7db78383ae";
    socket.emit("lookup-game", lookupId);
  });

  emitter.on("load-game", (match: any) => {
    const loadedMatch = JSON.parse(match.match);
    const matchSettings = loadedMatch.matchSettings;
    const gameSettings = loadedMatch.game;
    const timerSettings = loadedMatch.timer;
    matchRef.current = new Match(
      matchSettings,
      emitter,
      gameSettings,
      timerSettings
    );
    timerRef.current = matchRef.current.timer;
    view.prepareGameScene(matchRef.current!);
    emitter.emit("update-game-started");
  });

  emitter.on("create-match", ({ mode, time, player }: MatchSettings) => {
    matchRef!.current = new Match({ mode, time, player }, emitter);
    timerRef.current = matchRef.current.timer;
    if (mode === "Offline") {
      view.prepareGameScene(matchRef.current);
    } else {
      socket.emit("create-room");
    }
  });

  emitter.on("join-match", () => {
    view.prepareGameScene(matchRef.current!);
    matchRef.current?.startMatchTimer();
  });

  emitter.on("assign-room-info", (matchInfo: MatchSettings) => {
    const { mode, player, time, room }: MatchSettings = matchInfo;
    matchRef.current = new Match({ mode, player, time, room }, emitter);
    socket.emit("check-match-start", matchRef.current!.matchSettings.room);
  });

  emitter.on(
    "resolveMove",
    (originPoint: Point, targetPoint: Point, resolved: TurnHistory) => {
      if (matchRef) {
        matchRef.current!.game.switchTurn();
        view.turnAnimation(
          matchRef.current?.game!,
          originPoint,
          targetPoint,
          resolved
        );
        if (matchRef.current!.matchSettings.mode === "Offline") {
          rotateCamera(
            matchRef.current?.game.state.currentPlayer!,
            view.scenes.gameScene
          );
        }
        if (matchRef.current!.matchSettings.mode === "Online") {
          const room = matchRef.current!.matchSettings.room;
          socket.emit("stateChange", { originPoint, targetPoint, room });
        }
      }
    }
  );

  emitter.on("home-screen", () => {
    matchRef.current?.endMatch();
    view.prepareHomeScreen();
  });

  emitter.on("restart-match", () => {
    if (matchRef.current) {
      if (matchRef.current.matchSettings.mode === "Online") {
        const room = matchRef.current.matchSettings.room;
        socket.emit("reset-board", room);
      } else {
        emitter.emit("reset-board");
      }
    }
  });

  emitter.on("reset-board", () => {
    if (matchRef.current) {
      matchRef.current.resetMatch();
      view.updateGameView(matchRef.current);
    }
  });

  emitter.on("undo-move", () => {
    if (matchRef.current) {
      if (matchRef.current.timer.gamePaused !== true) {
        if (matchRef.current.matchSettings.mode === "Online") {
          if (
            matchRef.current.matchSettings.player !==
            matchRef.current.game.state.currentPlayer
          ) {
            const lastTurn = matchRef.current.game.turnHistory.at(-1);
            if (lastTurn !== undefined) {
              const room = matchRef.current.matchSettings.room;
              socket.emit("undo-move", room);
            }
          }
        } else {
          emitter.emit("undo-move-action");
        }
      }
    }
  });

  emitter.on("undo-move-action", () => {
    if (matchRef.current) {
      matchRef.current.game.undoTurn();
      view.updateMeshesRender(matchRef.current.game);
      view.resetCamera(matchRef.current);
    }
  });

  emitter.on("pause-game", (currentPlayer: string) => {
    if (matchRef.current) {
      if (matchRef.current.matchSettings.mode === "Online") {
        if (
          matchRef.current.matchSettings.player ===
          matchRef.current.game.state.currentPlayer
        ) {
          let time;
          if (currentPlayer === "White") {
            time = matchRef.current.timer.timer1;
          } else {
            time = matchRef.current.timer.timer2;
          }
          const room = matchRef.current.matchSettings.room;
          socket.emit("pause-game", {
            room,
            currentPlayer,
            time,
          });
        }
      } else {
        matchRef.current.timer.pauseTimer();
        matchRef.current.timer.gamePaused === true
          ? view.scenes.gameScene.detachControl()
          : view.scenes.gameScene.attachControl();
      }
    }
  });

  emitter.on("join-online-match", (room: string) => {
    socket.emit("join-room", room);
  });

  emitter.on("reset-camera", () => {
    view.resetCamera(matchRef.current!);
  });

  return emitter;
};

export default initEmitter;

type MatchSettings = {
  mode: string | undefined;
  player: string | undefined;
  time: number | undefined;
  room?: string | undefined;
};
