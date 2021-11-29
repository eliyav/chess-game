import { io } from "socket.io-client";
import Game from "../game";
import { renderScene } from "../helper/canvas-helpers";
import { CustomScene } from "../view/start-screen";
import { hideDisplay } from "../view/gui-overlay";
import { GameMode } from "../events/emitter";

const activateSocket = (
  game: Game,
  gameMode: GameMode,
  gameScene: CustomScene,
  startScene: CustomScene,
  showScene: { index: number }
) => {
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
    socket.emit("check-match-start", gameMode);
  });

  socket.on("reply-invite-code", (roomCode) => {
    if (document.getElementById("gameOptionsScreen") !== null) {
      const inviteCodeText = document.getElementById(
        "gameOptionsInviteCodeText"
      ) as HTMLParagraphElement;
      inviteCodeText.innerText = roomCode;
      const inviteCodeEle = document.getElementById(
        "gameOptionsInviteCode"
      ) as HTMLDivElement;
      inviteCodeEle.style.display = "unset";
    }
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
    const gameOptionsScreen = document.getElementById(
      "gameOptionsScreen"
    ) as HTMLDivElement;
    const domApp = document.getElementsByClassName("app");
    gameOptionsScreen !== null
      ? domApp[0].removeChild(gameOptionsScreen)
      : null;
    // Activate Game Settings
    game.resetGame(gameMode.time);
    renderScene(game, gameScene);
    hideDisplay();
    startScene.detachControl();
    showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
    console.log("game has been activated");
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
    let string = answer ? "Yes" : "No";
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

  // socket.on("draw-request", () => {
  //   const answer = confirm("Opponent has offered a game Draw, do you accept?");
  //   answer && socket.emit("draw-response", "Yes");
  // });

  // socket.on("draw-resolve", (response) => {
  //   if (response === "Yes") {
  //     game.resetGame();
  //     renderScene(game, gameScene);
  //   }
  // });

  // socket.on("resign-request", () => {
  //   game.resetGame();
  //   renderScene(game, gameScene);
  // });

  return socket;
};

export default activateSocket;
