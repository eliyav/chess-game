import { io } from "socket.io-client";
import { CanvasView } from "../view/view-init";
import Match from "../component/match";

const activateSocket = (match: Match, view: CanvasView) => {
  const socket = io(`ws://${window.location.host}`);

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("stateChange", (newState) => {
    const { originPoint, targetPoint } = newState;
    match.game.playerMove(originPoint, targetPoint);
    match.game.switchTurn();
    view.updateGameView(match);
  });

  socket.on("assign-room-info", (matchInfo) => {
    ({
      mode: match.matchSettings.mode,
      player: match.matchSettings.player,
      time: match.matchSettings.time,
      room: match.matchSettings.room,
    } = matchInfo);
    socket.emit("check-match-start", match.matchSettings.room);
  });

  socket.on("assign-room-number", (room) => {
    match.matchSettings.room = room;
    socket.emit("check-match-start", room);
  });

  socket.on("request-room-info", () => {
    const { mode, player, time, room } = match.matchSettings;
    const gameContextClone = { mode, player, time, room };
    gameContextClone.player === "White"
      ? (gameContextClone.player = "Black")
      : (gameContextClone.player = "White");
    socket.emit("reply-room-info", gameContextClone);
  });

  socket.on("start-match", () => {
    // Activate Game Settings
    console.log("game has been activated");
    socket.emit("prepare-game-scene-request");
  });

  socket.on("pause-game", ({ currentPlayer, time }) => {
    match.timer.pauseTimer();
    if (currentPlayer === "White") {
      match.timer.timer1 = time;
    } else {
      match.timer.timer2 = time;
    }
  });
  socket.on("reset-board-request", () => {
    const matchSettings = match.matchSettings;
    const answer = confirm(
      "Opponent has requested to reset the board, do you agree?"
    );
    const string = answer ? "Yes" : "No";
    socket.emit("reset-board-response", { string, matchSettings });
  });

  socket.on("reset-board-resolve", (response) => {
    if (response === "Yes") {
      match.game.resetGame();
      view.updateGameView(match);
    } else {
      console.log("Request Denied");
    }
  });

  socket.on("undo-move-request", () => {
    const matchSettings = match.matchSettings;
    const answer = confirm(
      "Opponent has requested to undo their last move, do you agree?"
    );
    const string = answer ? "Yes" : "No";
    socket.emit("undo-move-response", { string, matchSettings });
  });

  socket.on("undo-move-resolve", (response) => {
    if (response === "Yes") {
      match.game.undoTurn();
      view.updateGameView(match);
    } else {
      console.log("Request Denied");
    }
  });

  return socket;
};

export default activateSocket;
