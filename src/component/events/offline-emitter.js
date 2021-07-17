import EventEmitter from "./event-emitter";
import { renderScene } from "../../helper/canvas-helpers";

const activateEmitter = (scene, game) => {
  const emitter = new EventEmitter();

  emitter.on("move", (originPoint, targetPoint) => {
    const resolved = game.playerMove(originPoint, targetPoint);
    if (resolved) {
      renderScene(game, scene);
      game.switchTurn();

      if (game.gameState.currentPlayer === "Black") {
        scene.cameras[0].alpha = 0;
      } else {
        scene.cameras[0].alpha = -3.14;
      }
    }
  });

  emitter.on("reset-board", () => {
    const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
    if (answer === "Yes" || answer === "yes" || answer === "YES") {
      game.resetBoard();
      renderScene(game, scene);
      scene.cameras[0].alpha = -3.14;
    }
  });

  emitter.on("draw", () => {
    const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
    if (answer === "Yes" || answer === "yes" || answer === "YES") {
      //Add Based on Turn effect
    }
  });

  emitter.on("resign", () => {
    const answer = prompt("Are you sure you want to resign the game?, Enter Yes or No");
    if (answer === "Yes" || answer === "yes" || answer === "YES") {
      //Add based on turn effect
    }
  });

  return emitter;
};

export default activateEmitter;
