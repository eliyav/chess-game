import { io } from "socket.io-client";

const activateSocket = (game, scene) => {
  const socket = io("ws://localhost:3000");
  let room;

  socket.on("stateChange", (newState) => {
    const { originPoint, targetPoint } = newState;
    game.playerMove(originPoint, targetPoint);
    game.switchTurn();
    renderScene(game, scene, finalMeshes);
  });

  socket.on("reply-room-id", (id) => {
    console.log(id);
    room = id;
  });

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("room-info", (info) => {
    let user;
    if (info.length === 2) {
      console.log("game has been activated");
      socket.id === info[0] ? (user = "White") : (user = "Black");
      activateOnlineGame(user);
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
      renderScene(game, scene, finalMeshes);
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
      renderScene(game, scene, finalMeshes);
    }
  });

  socket.on("resign-request", () => {
    game.resetBoard();
    renderScene(game, scene, finalMeshes);
  });

  return socket;
};

export default activateSocket;
