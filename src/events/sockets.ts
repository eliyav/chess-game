import { io } from "socket.io-client";
import { CanvasView } from "../view/view-init";
import Match, { MatchSettings } from "../component/match";

const initSocket = (
  match: React.MutableRefObject<Match | undefined>,
  view: CanvasView
) => {
  const socket = io(`ws://${window.location.host}`);

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("stateChange", (newState) => {
    const { originPoint, targetPoint } = newState;
    match.current!.game.playerMove(originPoint, targetPoint);
    match.current!.game.switchTurn();
    view.updateGameView(match.current!);
  });

  socket.on("assign-room-info", (matchInfo) => {
    const { mode, player, time, room }: MatchSettings = matchInfo;
    match.current = new Match({ mode, player, time, room });
    socket.emit("check-match-start", match.current!.matchSettings.room);
  });

  socket.on("assign-room-number", (room) => {
    match.current!.matchSettings.room = room;
  });

  socket.on("request-room-info", () => {
    const { mode, player, time, room } = match.current!.matchSettings;
    const matchInfo = { mode, player, time, room };
    matchInfo.player === "White"
      ? (matchInfo.player = "Black")
      : (matchInfo.player = "White");
    socket.emit("reply-room-info", matchInfo);
  });

  socket.on("start-match", () => {
    // Activate Game Settings
    console.log("game has been activated");
    socket.emit("prepare-game-request");
  });

  socket.on("pause-game", ({ currentPlayer, time }) => {
    match.current!.timer.pauseTimer();
    if (currentPlayer === "White") {
      match.current!.timer.timer1 = time;
    } else {
      match.current!.timer.timer2 = time;
    }
  });
  socket.on("reset-board-request", () => {
    const room = match.current!.matchSettings.room;
    const answer = confirm(
      "Opponent has requested to reset the board, do you agree?"
    );
    const string = answer ? "Yes" : "No";
    socket.emit("reset-board-response", { string, room });
  });

  socket.on("reset-board-resolve", (response) => {
    if (response === "Yes") {
      match.current!.game.resetGame();
      view.updateGameView(match.current!);
    } else {
      console.log("Request Denied");
    }
  });

  socket.on("undo-move-request", () => {
    const room = match.current!.matchSettings.room;
    const answer = confirm(
      "Opponent has requested to undo their last move, do you agree?"
    );
    const string = answer ? "Yes" : "No";
    socket.emit("undo-move-response", { string, room });
  });

  socket.on("undo-move-resolve", (response) => {
    if (response === "Yes") {
      match.current!.game.undoTurn();
      view.updateGameView(match.current!);
    } else {
      console.log("Request Denied");
    }
  });

  return socket;
};

export default initSocket;
