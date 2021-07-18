import EventEmitter from "./event-emitter";
import { renderScene } from "../../helper/canvas-helpers";

const activateEmitter = (appContext) => {
  const emitter = new EventEmitter();
  const {
    gameMode: gameMode,
    game: game,
    scenes: { gameScreen: scene },
  } = appContext;

  emitter.on("move", (originPoint, targetPoint) => {
    console.log("emitter activated");
    renderScene(game, scene);
    if (gameMode.mode === "offline") {
      const resolved = game.playerMove(originPoint, targetPoint);
      if (resolved) {
        renderScene(game, scene);
        game.switchTurn();
        if (game.gameState.currentPlayer === "Black") {
          const animateTurnSwitch = () => {
            requestAnimationFrame(() => {
              scene.cameras[0].alpha += 0.05;
              scene.cameras[0].alpha < 0 ? animateTurnSwitch() : (scene.cameras[0].alpha = 0);
            });
          };
          animateTurnSwitch();
        } else {
          const animateTurnSwitch = () => {
            requestAnimationFrame(() => {
              scene.cameras[0].alpha -= 0.05;
              scene.cameras[0].alpha > -3.14 ? animateTurnSwitch() : (scene.cameras[0].alpha = -3.14);
            });
          };
          animateTurnSwitch();
        }
      }
    } else if (gameMode.mode === "online") {
      console.log("!");
      const resolved = game.playerMove(originPoint, targetPoint);
      if (resolved) {
        renderScene(game, scene);
        game.switchTurn();
        //socket.emit("stateChange", { originPoint, targetPoint, room });
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
        renderScene(game, scene, finalMeshes);
        socket.emit("resign-game");
      }
    });

    */
