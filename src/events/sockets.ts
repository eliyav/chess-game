import { io } from "socket.io-client";
import MatchContext from "../component/match-context";
import Game from "../component/game-logic/game";
import { renderScene } from "../helper/canvas-helpers";
import { RenderContext } from "../view/render-context";

const activateSocket = (
  chessGame: Game,
  matchContext: MatchContext,
  renderContext: RenderContext
) => {
  const {
    scenes: { gameScene },
  } = renderContext;

  const socket = io(`ws://${window.location.host}`);

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("stateChange", (newState) => {
    const { originPoint, targetPoint } = newState;
    chessGame.playerMove(originPoint, targetPoint);
    chessGame.switchTurn();
    renderScene(chessGame, gameScene);
  });

  socket.on("assign-room-info", (matchInfo) => {
    ({
      mode: matchContext.mode,
      player: matchContext.player,
      time: matchContext.time,
      room: matchContext.room,
    } = matchInfo);
    socket.emit("check-match-start", matchContext.room);
  });

  socket.on("assign-room-number", (room) => {
    matchContext.room = room;
    socket.emit("check-match-start", room);
  });

  socket.on("request-room-info", () => {
    const { mode, player, time, room } = matchContext;
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
    chessGame.timer.pauseTimer();
    if (currentPlayer === "White") {
      chessGame.timer.timer1 = time;
    } else {
      chessGame.timer.timer2 = time;
    }
  });
  socket.on("reset-board-request", () => {
    const answer = confirm(
      "Opponent has requested to reset the board, do you agree?"
    );
    const string = answer ? "Yes" : "No";
    socket.emit("reset-board-response", { string, matchContext });
  });

  socket.on("reset-board-resolve", (response) => {
    if (response === "Yes") {
      chessGame.resetGame(matchContext.time);
      renderScene(chessGame, gameScene);
    } else {
      console.log("Request Denied");
    }
  });

  socket.on("undo-move-request", () => {
    const answer = confirm(
      "Opponent has requested to undo their last move, do you agree?"
    );
    const string = answer ? "Yes" : "No";
    socket.emit("undo-move-response", { string, matchContext });
  });

  socket.on("undo-move-resolve", (response) => {
    if (response === "Yes") {
      chessGame.undoTurn();
      renderScene(chessGame, gameScene);
    } else {
      console.log("Request Denied");
    }
  });

  return socket;
};

export default activateSocket;
