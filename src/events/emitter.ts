import EventEmitter from "./event-emitter";
import { renderScene, rotateCamera } from "../helper/canvas-helpers";
import Game from "../game";
import {CustomScene} from "../view/start-screen"

//Fix Any on GameScene. Camera not showing up on Scene class

type GameMode = {mode: string | undefined, player: string | undefined , room: string | undefined}

const activateEmitter = (game: Game, gameMode: GameMode, gameScene: CustomScene, socket: any) : EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on("playerMove", (originPoint, targetPoint) => {
    renderScene(game, gameScene);
    if (gameMode.mode === "offline") {
      if(typeof originPoint !== "undefined" && typeof targetPoint !== "undefined"){
        const resolved = game.playerMove(originPoint, targetPoint);
        if (resolved) {
          renderScene(game, gameScene);
          game.switchTurn();
          rotateCamera(game.state.currentPlayer, gameScene);
        }
      }
    } else if (gameMode.mode === "online") {
      if(typeof originPoint !== "undefined" && typeof targetPoint !== "undefined"){
        const resolved = game.playerMove(originPoint, targetPoint);
      if (resolved) {
        const room = gameMode.room;
        renderScene(game, gameScene);
        game.switchTurn();
        socket.emit("stateChange", { originPoint, targetPoint, room });
      }
    }
    }
    game.moves.length = 0;
  });

  emitter.on("reset-board", () => {
    const answer = confirm("Are you sure you want to reset the board?");
    if (answer) {
      game.resetGame();
      renderScene(game, gameScene);
      let camera:any = gameScene.cameras[0]
      camera.alpha = Math.PI;
    }
  });

  return emitter;
};

export default activateEmitter;
