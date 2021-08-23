import EventEmitter from "./event-emitter";
import { renderScene, rotateCamera } from "../helper/canvas-helpers";

const activateEmitter = (game, gameMode, gameScene) => {
  const emitter = new EventEmitter();

  emitter.on("playerMove", (originPoint, targetPoint) => {
    renderScene(game, gameScene);
    if (gameMode.mode === "offline") {
      const resolved = game.playerMove(originPoint, targetPoint);
      if (resolved) {
        renderScene(game, gameScene);
        game.switchTurn();
        const currentPlayer = game.state.currentPlayer;
        rotateCamera(currentPlayer, gameScene);
      }
    } else if (gameMode.mode === "online") {
      const resolved = game.playerMove(originPoint, targetPoint);
      if (resolved) {
        renderScene(game, gameScene);
        game.switchTurn();
        const room = gameMode.room;
        sockets.emit("stateChange", { originPoint, targetPoint, room });
      }
    }
    game.moves.length = 0;
  });

  emitter.on("reset-board", () => {
    const answer = confirm("Are you sure you want to reset the board?");
    if (answer) {
      game.resetBoard();
      renderScene(game, gameScene);
      gameScene.cameras[0].alpha = -3.14;
    }
  });

  emitter.on("draw", () => {
    const answer = confirm("Are you sure you want to reset the board?");
    if (answer) {
      //Add Based on Turn effect
    }
  });

  emitter.on("resign", () => {
    const answer = confirm("Are you sure you want to resign the game?");
    if (answer) {
      //Add based on turn effect
    }
  });

  return emitter;
};

export default activateEmitter;
