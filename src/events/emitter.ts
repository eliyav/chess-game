import EventEmitter from "./event-emitter";
import { CanvasView } from "../view/view-init";
import Match from "../component/match";

type MatchSettings = {
  mode: string | undefined;
  player: string | undefined;
  time: number | undefined;
};

const initEmitter = (
  match: React.MutableRefObject<Match | undefined>,
  view: CanvasView,
  socket: any
): EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on("create-match", ({ mode, time, player }: MatchSettings) => {
    match!.current = new Match({ mode, time, player });
    if (mode === "Offline") {
      view.prepareGameScene(match.current);
    } else {
      socket.emit("create-room");
    }
  });

  emitter.on("join-match", () => {
    view.prepareGameScene(match.current!);
  });

  emitter.on("resolveMove", (originPoint: Point, targetPoint: Point) => {
    if (match) {
      match.current!.game.switchTurn();
      view.updateGameView(match.current!);
      if (match.current!.matchSettings.mode === "Online") {
        const room = match.current!.matchSettings.room;
        socket.emit("stateChange", { originPoint, targetPoint, room });
      }

      emitter.on("home-screen", () => {
        match.current = undefined;
        view.prepareHomeScreen();
      });
    }
  });

  emitter.on("restart-match", () => {
    if (match.current) {
      const answer = confirm("Are you sure you want to reset the board?");
      if (answer) {
        if (match.current.matchSettings.mode === "Online") {
          const room = match.current.matchSettings.room;
          socket.emit("reset-board", room);
        } else {
          match.current.resetMatch();
          view.updateGameView(match.current);
        }
      }
    }
  });

  emitter.on("undo-move", () => {
    if (match.current) {
      if (match.current.timer.gamePaused !== true) {
        if (match.current.matchSettings.mode === "online") {
          if (
            match.current.matchSettings.player !==
            match.current.game.state.currentPlayer
          ) {
            const lastTurn = match.current.game.turnHistory.at(-1);
            if (lastTurn !== undefined) {
              const room = match.current.matchSettings.room;
              socket.emit("undo-move", room);
            }
          }
        } else {
          match.current.game.undoTurn();
          view.updateMeshesRender(match.current.game);
          view.resetCamera(match.current);
        }
      }
    }
  });

  emitter.on("pause-game", (currentPlayer: string) => {
    if (match.current) {
      if (match.current.matchSettings.mode === "Online") {
        if (
          match.current.matchSettings.player ===
          match.current.game.state.currentPlayer
        ) {
          let time;
          if (currentPlayer === "White") {
            time = match.current.timer.timer1;
          } else {
            time = match.current.timer.timer2;
          }
          const room = match.current.matchSettings.room;
          socket.emit("pause-game", {
            room,
            currentPlayer,
            time,
          });
        }
      } else {
        match.current.timer.pauseTimer();
        match.current.timer.gamePaused === true
          ? view.scenes.gameScene.detachControl()
          : view.scenes.gameScene.attachControl();
      }
    }
  });

  emitter.on("join-online-match", () => {
    let room = prompt("Please enter the room key");
    socket.emit("join-room", room);
  });

  return emitter;
};

export default initEmitter;
