import EventEmitter from "./event-emitter";
import { CanvasView } from "../view/view-init";
import Match from "../component/match";
import Timer from "../component/game-logic/timer";

type MatchSettings = {
  mode: string | undefined;
  player: string | undefined;
  time: number | undefined;
};

const initEmitter = (
  matchRef: React.MutableRefObject<Match | undefined>,
  view: CanvasView,
  socket: any,
  timerRef: React.MutableRefObject<Timer | undefined>
): EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on("create-match", ({ mode, time, player }: MatchSettings) => {
    matchRef!.current = new Match({ mode, time, player });
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

  emitter.on("resolveMove", (originPoint: Point, targetPoint: Point) => {
    if (matchRef) {
      matchRef.current!.game.switchTurn();
      view.updateGameView(matchRef.current!);
      if (matchRef.current!.matchSettings.mode === "Online") {
        const room = matchRef.current!.matchSettings.room;
        socket.emit("stateChange", { originPoint, targetPoint, room });
      }
    }
  });

  emitter.on("home-screen", () => {
    matchRef.current?.endMatch();
    view.prepareHomeScreen();
  });

  emitter.on("restart-match", () => {
    if (matchRef.current) {
      const answer = confirm("Are you sure you want to reset the board?");
      if (answer) {
        if (matchRef.current.matchSettings.mode === "Online") {
          const room = matchRef.current.matchSettings.room;
          socket.emit("reset-board", room);
        } else {
          matchRef.current.resetMatch();
          view.updateGameView(matchRef.current);
        }
      }
    }
  });

  emitter.on("undo-move", () => {
    if (matchRef.current) {
      if (matchRef.current.timer.gamePaused !== true) {
        if (matchRef.current.matchSettings.mode === "online") {
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
          matchRef.current.game.undoTurn();
          view.updateMeshesRender(matchRef.current.game);
          view.resetCamera(matchRef.current);
        }
      }
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

  emitter.on("join-online-match", () => {
    let room = prompt("Please enter the room key");
    socket.emit("join-room", room);
  });

  emitter.on("reset-camera", () => {
    view.resetCamera(matchRef.current!);
  });

  return emitter;
};

export default initEmitter;
