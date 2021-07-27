import { io } from "socket.io-client";
import { renderScene } from "../src/helper/canvas-helpers";

const activateSocket = (game, gameMode, scene) => {
  const socket = io("ws://localhost:3000");

  socket.on("stateChange", (newState) => {
    const { originPoint, targetPoint } = newState;
    game.playerMove(originPoint, targetPoint);
    game.switchTurn();
    renderScene(game, scene);
  });

  socket.on("reply-room-id", (id) => {
    console.log(id);
    gameMode.room = id;
  });

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("room-info", (info) => {
    let player;
    if (info.length === 2) {
      console.log("game has been activated");
      socket.id === info[0] ? (player = "White") : (player = "Black");
      gameMode.player = player;
    }
  });

  socket.on("reset-board-request", () => {
    const answer = prompt("Opponent has requested to reset the board, do you agree?, Enter Yes or No");
    if (answer === "Yes" || answer === "yes" || answer === "YES") {
      socket.emit("reset-board-response", "Yes");
    }
  });

  socket.on("reset-board-resolve", (response) => {
    if (response === "Yes") {
      game.resetBoard();
      renderScene(game, scene);
    }
  });

  socket.on("draw-request", () => {
    const answer = prompt("Opponent has offered a game Draw, do you accept?, Enter Yes or No");
    if (answer === "Yes" || answer === "yes" || answer === "YES") {
      socket.emit("draw-response", "Yes");
    }
  });

  socket.on("draw-resolve", (response) => {
    if (response === "Yes") {
      game.resetBoard();
      renderScene(game, gameScene);
    }
  });

  socket.on("resign-request", () => {
    game.resetBoard();
    renderScene(game, gameScene);
  });

  return socket;
};

export default activateSocket;
