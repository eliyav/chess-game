import { io } from "socket.io-client";
import { CanvasView } from "../view/view-init";
import Match, { MatchSettings } from "../component/match";

const initSocket = (
  matchRef: React.MutableRefObject<Match | undefined>,
  view: CanvasView
) => {
  const socket = io(`ws://${window.location.host}`);

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("stateChange", (newState) => {
    const { originPoint, targetPoint } = newState;
    matchRef.current!.game.playerMove(originPoint, targetPoint);
    matchRef.current!.game.switchTurn();
    view.updateGameView(matchRef.current!);
  });

  // socket.on("assign-room-info", (matchInfo) => {
  //   const { mode, player, time, room }: MatchSettings = matchInfo;
  //   matchRef.current = new Match({ mode, player, time, room });
  //   socket.emit("check-match-start", matchRef.current!.matchSettings.room);
  // });

  socket.on("assign-room-number", (room) => {
    matchRef.current!.matchSettings.room = room;
  });

  socket.on("request-room-info", () => {
    const { mode, player, time, room } = matchRef.current!.matchSettings;
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
    matchRef.current!.timer.pauseTimer();
    if (currentPlayer === "White") {
      matchRef.current!.timer.timer1 = time;
    } else {
      matchRef.current!.timer.timer2 = time;
    }
  });

  return socket;
};

export default initSocket;
