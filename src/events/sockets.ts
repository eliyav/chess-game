import { io } from "socket.io-client";
import { CanvasView } from "../view/view-init";
import Match from "../component/match";

const initSocket = (
  matchRef: React.MutableRefObject<Match>,
  view: CanvasView
) => {
  const socket = io(`ws://${window.location.host}`);

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("stateChange", (newState) => {
    const { originPoint, targetPoint } = newState;
    matchRef.current.game.playerMove(originPoint, targetPoint);
    const turnHistory = matchRef.current.game.turnHistory;
    view.turnAnimation(originPoint, targetPoint, turnHistory.at(-1)!);
    matchRef.current.game.switchTurn();
  });

  socket.on("assign-room-number", (room) => {
    matchRef.current.matchSettings.room = room;
  });

  socket.on("request-room-info", () => {
    const { mode, player, time, room } = matchRef.current.matchSettings;
    const matchInfo = { mode, player, time, room };
    matchInfo.player === "White"
      ? (matchInfo.player = "Black")
      : (matchInfo.player = "White");
    socket.emit("reply-room-info", matchInfo);
  });

  socket.on("pause-game", ({ currentPlayer, time }) => {
    console.log("paused timer called");
    matchRef.current.timer.pauseTimer();
    if (currentPlayer === "White") {
      matchRef.current.timer.timer1 = time;
    } else {
      matchRef.current.timer.timer2 = time;
    }
    matchRef.current.timer.gamePaused === true
      ? view.gameScene.detachControl()
      : view.gameScene.attachControl();
  });

  return socket;
};

export default initSocket;
