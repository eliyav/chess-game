import { io } from "socket.io-client";
import Game from "../game";
import { renderScene } from "../helper/canvas-helpers";
import { CustomScene } from "../view/start-screen";

const activateSocket = (
  game: Game,
  gameMode: { mode: string | undefined, player: string | undefined, room: number | undefined },
  scene: CustomScene
) => {

  const socket = io(`ws://${window.location.host}:8080`);

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
    const answer = confirm("Opponent has requested to reset the board, do you agree?");
    answer && socket.emit("reset-board-response", "Yes");
  });

  socket.on("reset-board-resolve", (response) => {
    if (response === "Yes") {
      game.resetGame();
      renderScene(game, scene);
    }
  });

  socket.on("draw-request", () => {
    const answer = confirm("Opponent has offered a game Draw, do you accept?");
    answer && socket.emit("draw-response", "Yes");
  });

  socket.on("draw-resolve", (response) => {
    if (response === "Yes") {
      game.resetGame();
      renderScene(game, scene);
    }
  });

  socket.on("resign-request", () => {
    game.resetGame();
    renderScene(game, scene);
  });

  return socket;
};

export default activateSocket;
