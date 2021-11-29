import EventEmitter from "./event-emitter";
import { renderScene, rotateCamera } from "../helper/canvas-helpers";
import Game from "../game";
import { CustomScene } from "../view/start-screen";
import { resetCamera } from "../view/gui-overlay";

export type GameMode = {
  mode: string | undefined;
  player: string | undefined;
  room: string | undefined;
  time: number | undefined;
};

const activateEmitter = (
  game: Game,
  gameMode: GameMode,
  gameScene: CustomScene,
  socket: any
): EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on("playerMove", (originPoint, targetPoint) => {
    renderScene(game, gameScene);
    const resolved = game.playerMove(originPoint!, targetPoint!);
    if (resolved) {
      if (gameMode.mode === "offline") {
        game.switchTurn();
        renderScene(game, gameScene);
        rotateCamera(game.state.currentPlayer, gameScene);
      } else if (gameMode.mode === "online") {
        const room = gameMode.room;
        renderScene(game, gameScene);
        game.switchTurn();
        socket.emit("stateChange", { originPoint, targetPoint, room });
      }
    }
    game.moves.length = 0;
  });

  emitter.on("reset-board", () => {
    const answer = confirm("Are you sure you want to reset the board?");
    if (answer) {
      if (gameMode.mode === "online") {
        socket.emit("reset-board", gameMode);
      } else {
        game.resetGame();
        renderScene(game, gameScene);
        let camera: any = gameScene.cameras[0];
        camera.alpha = Math.PI;
      }
    }
  });

  //@ts-ignore
  emitter.on("pause-game", (currentPlayer: string) => {
    let time;
    if (currentPlayer === "White") {
      time = game.timer.timer1;
    } else {
      time = game.timer.timer2;
    }
    socket.emit("pause-game", { gameMode, currentPlayer, time });
  });

  emitter.on("undo-move", () => {
    if (gameMode.mode === "online") {
      if (gameMode.player !== game.state.currentPlayer) {
        const lastTurn = game.turnHistory.at(-1);
        if (lastTurn !== undefined) {
          socket.emit("undo-move", gameMode);
        }
      }
    } else {
      game.undoTurn();
      renderScene(game, gameScene);
      resetCamera(game, gameScene, gameMode);
    }
  });

  return emitter;
};

export default activateEmitter;
