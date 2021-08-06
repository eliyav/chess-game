import Game from "./game";
import startScreen from "./view/start-screen";
import gameScreen from "./view/game-screen";
import activateEmitter from "./events/emitter";
import { renderScene } from "./helper/canvas-helpers";
import createGUI from "./view/gui-overlay";
import inputController from "../src/events/input-controller";
import activateSocket from "../server/sockets";

const initializeApp = async (canvas, engine) => {
  const appContext = {
    game: new Game(),
    gameMode: { mode: undefined, player: undefined, room: undefined },
    showScene: { sceneIndex: 0 },
    scenes: {
      startScene: await startScreen(canvas, engine),
      gameScene: await gameScreen(canvas, engine),
    },
  };

  const {
    game,
    gameMode,
    showScene,
    scenes: { startScene, gameScene },
  } = appContext;

  appContext.emitter = activateEmitter(game, gameMode, gameScene);
  //appContext.socket = activateSocket(game, gameMode, gameScene);
  createGUI(startScene, gameScene, showScene, gameMode, appContext.emitter, appContext.socket);
  renderScene(game, gameScene);

  gameScene.onPointerDown = async (e, pickResult) => {
    const mesh = pickResult.pickedMesh;
    const isCompleteMove = inputController(mesh, game, gameMode, gameScene);
    isCompleteMove
      ? (() => {
          appContext.emitter.emit("move", game.moves[0], game.moves[1]);
          game.moves.length = 0;
        })()
      : null;
  };

  return appContext;
};

export default initializeApp;
