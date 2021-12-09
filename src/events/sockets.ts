import { io } from "socket.io-client";
import { renderScene } from "../helper/canvas-helpers";
import { App } from "../component/chess-app";

const activateSocket = (app: App) => {
  const {
    game,
    gameMode,
    scenes: { gameScene, startScene },
    showScene,
  } = app;

  const socket = io(`ws://${window.location.host}`);

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("stateChange", (newState) => {
    const { originPoint, targetPoint } = newState;
    game.playerMove(originPoint, targetPoint);
    game.switchTurn();
    renderScene(game, gameScene);
  });

  socket.on("assign-room-info", (matchInfo) => {
    ({
      mode: gameMode.mode,
      player: gameMode.player,
      time: gameMode.time,
      room: gameMode.room,
    } = matchInfo);
    socket.emit("check-match-start", gameMode.room);
  });

  socket.on("assign-room-number", (room) => {
    gameMode.room = room;
    socket.emit("check-match-start", room);
  });

  socket.on("request-room-info", () => {
    const { mode, player, time, room } = gameMode;
    const gameModeClone = { mode, player, time, room };
    gameModeClone.player === "White"
      ? (gameModeClone.player = "Black")
      : (gameModeClone.player = "White");
    socket.emit("reply-room-info", gameModeClone);
  });

  socket.on("start-match", () => {
    // Activate Game Settings
    console.log("game has been activated");
    socket.emit("prepare-game-scene-request");
  });

  socket.on("pause-game", ({ currentPlayer, time }) => {
    game.timer.pauseTimer();
    if (currentPlayer === "White") {
      game.timer.timer1 = time;
    } else {
      game.timer.timer2 = time;
    }
  });
  socket.on("reset-board-request", () => {
    const answer = confirm(
      "Opponent has requested to reset the board, do you agree?"
    );
    const string = answer ? "Yes" : "No";
    socket.emit("reset-board-response", { string, gameMode });
  });

  socket.on("reset-board-resolve", (response) => {
    if (response === "Yes") {
      game.resetGame(gameMode.time);
      renderScene(game, gameScene);
    } else {
      console.log("Request Denied");
    }
  });

  socket.on("undo-move-request", () => {
    const answer = confirm(
      "Opponent has requested to undo their last move, do you agree?"
    );
    const string = answer ? "Yes" : "No";
    socket.emit("undo-move-response", { string, gameMode });
  });

  socket.on("undo-move-resolve", (response) => {
    if (response === "Yes") {
      game.undoTurn();
      renderScene(game, gameScene);
    } else {
      console.log("Request Denied");
    }
  });

  return socket;
};

export default activateSocket;
