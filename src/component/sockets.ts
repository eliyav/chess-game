import { io } from "socket.io-client";
import Game from "../game";
import { renderScene } from "../helper/canvas-helpers";
import { CustomScene } from "../view/start-screen";
import {hideDisplay} from "../view/gui-overlay";

const activateSocket = (
  game: Game,
  gameMode: { mode: string | undefined, player: string | undefined, room: number | undefined },
  gameScene: CustomScene,
  startScene: CustomScene,
  showScene: {index: number},
) => {

  //const socket = io(`ws://localhost:3000`);
  const socket = io(`ws://${window.location.host}`);

  socket.on("stateChange", (newState) => {
    const { originPoint, targetPoint } = newState;
    game.playerMove(originPoint, targetPoint);
    game.switchTurn();
    renderScene(game, gameScene);
  }); 

  socket.on("reply-room-id", (id) => {
    gameMode.room = id;

    if(document.getElementById("gameOptionsScreen") !== null){
      const inviteCodeText = document.getElementById("gameOptionsInviteCodeText") as HTMLParagraphElement
      inviteCodeText.innerText = id;
      const inviteCode = document.getElementById("gameOptionsInviteCode") as HTMLDivElement
      inviteCode.style.display = "unset"
    }
  });

  socket.on("message", (message) => {
    console.log(message);
  });

  socket.on("room-info", (info) => {
    let player;
    if (info.length === 2) {
      console.log("game has been activated");
      const gameOptionsScreen = document.getElementById("gameOptionsScreen") as HTMLDivElement
      if(gameOptionsScreen !== null){
        const domApp = document.getElementsByClassName("app")
        domApp[0].removeChild(gameOptionsScreen);//
      }
      socket.id === info[0] ? (player = "White") : (player = "Black");
      gameMode.player = player;
      game.resetGame();
      renderScene(game, gameScene);
      hideDisplay();
      startScene.detachControl();
      showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
    }
  });

  socket.on("reset-board-request", () => {
    const answer = confirm("Opponent has requested to reset the board, do you agree?");
    answer && socket.emit("reset-board-response", "Yes");
  });

  socket.on("reset-board-resolve", (response) => {
    if (response === "Yes") {
      game.resetGame();
      renderScene(game, gameScene);
    }
  });

  socket.on("draw-request", () => {
    const answer = confirm("Opponent has offered a game Draw, do you accept?");
    answer && socket.emit("draw-response", "Yes");
  });

  socket.on("draw-resolve", (response) => {
    if (response === "Yes") {
      game.resetGame();
      renderScene(game, gameScene);
    }
  });

  socket.on("resign-request", () => {
    game.resetGame();
    renderScene(game, gameScene);
  });

  return socket;
};

export default activateSocket;
