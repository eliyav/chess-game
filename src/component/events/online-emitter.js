import EventEmitter from "./component/event-emitter";

if (gameMode === "Online") {
    //Game mode is online
    emitter.on("move", (originPoint, targetPoint) => {
      const resolved = game.playerMove(originPoint, targetPoint);
      if (resolved) {
        renderScene(game, scene);
        game.switchTurn();
        socket.emit("stateChange", { originPoint, targetPoint, room });
        gameAnnotation.innerHTML = game.history;
      }
    });

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
  } else {