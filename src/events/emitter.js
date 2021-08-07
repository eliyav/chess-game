import EventEmitter from "./event-emitter";
import { renderScene } from "../helper/canvas-helpers";

const activateEmitter = (game, gameMode, gameScene) => {
  const emitter = new EventEmitter();

  emitter.on("move", (originPoint, targetPoint) => {
    renderScene(game, gameScene);
    if (gameMode.mode === "offline") {
      const resolved = game.playerMove(originPoint, targetPoint);
      if (resolved) {
        renderScene(game, gameScene);
        game.switchTurn();
        const currentPlayer = game.gameState.currentPlayer;
        const animateTurnSwitch = (color) => {
          let target = color === "Black" ? 0 : -3.14;
          requestAnimationFrame(() => {
            let alpha = gameScene.cameras[0].alpha;
            const absAlpha = Math.abs(alpha);
            const divisible = Math.floor(absAlpha / Math.PI);
            if (divisible > 1) {
              const remainder = absAlpha / Math.PI - divisible;
              let newAlpha = remainder * Math.PI;
              console.log(`Alpha:${alpha}; AbsAlpha:${absAlpha}; remainder:${remainder};newAlpha:${newAlpha}`);
              alpha < 0 ? (newAlpha *= -1) : null;
              console.log(`Alpha:${alpha}; AbsAlpha:${absAlpha}; remainder:${remainder};newAlpha:${newAlpha}`);
              gameScene.cameras[0].alpha = newAlpha;
              alpha = newAlpha;
              //builtd new direction rotation based on the alpha and the target.
            }
            const direction = alpha > target ? "negative" : "positive";
            if (direction === "negative") {
              gameScene.cameras[0].alpha -= 0.05;
              gameScene.cameras[0].alpha < target ? null : animateTurnSwitch(color);
            } else if (direction === "positive") {
              gameScene.cameras[0].alpha += 0.05;
              gameScene.cameras[0].alpha > target ? null : animateTurnSwitch(color);
            }
          });
        };
        animateTurnSwitch(currentPlayer);
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
  });

  emitter.on("reset-board", () => {
    const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
    if (answer === "Yes" || answer === "yes" || answer === "YES") {
      game.resetBoard();
      renderScene(game, gameScene);
      gameScene.cameras[0].alpha = -3.14;
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

/*
    emitter.on("reset-board", () => {
      const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
      if (answer === "Yes" || answer === "yes" || answer === "YES") {
        socket.emit("reset-board");
      }
    });

    emitter.on("draw", () => {
      const answer = prompt("Are you sure you want to reset the board?, Enter Yes or No");
      if (answer === "Yes" || answer === "yes" || answer === "YES") {
        socket.emit("draw");
      }
    });

    emitter.on("resign", () => {
      const answer = prompt("Are you sure you want to resign the game?, Enter Yes or No");
      if (answer === "Yes" || answer === "yes" || answer === "YES") {
        game.resetBoard();
        renderScene(appContext, finalMeshes);
        socket.emit("resign-game");
      }
    });

    */
