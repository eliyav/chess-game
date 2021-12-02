import { Engine, Scene } from "babylonjs";
import { renderScene } from "../helper/canvas-helpers";
import Game from "./game/game";
import chessData from "../data/chess-data-import";
import startScreen from "../view/start-screen";
import gameScreen from "../view/game-screen";
import activateSocket from "../events/sockets";

const initializeApp = async (canvas: HTMLCanvasElement, engine: Engine) => {
  const app: App = {
    game: new Game(chessData),
    gameMode: {
      mode: undefined,
      player: undefined,
      time: undefined,
      room: undefined,
    },
    showScene: { index: 0 },
    scenes: {
      startScene: await startScreen(engine),
      gameScene: await gameScreen(canvas, engine),
    },
    socket: undefined,
  };

  const {
    game,
    gameMode,
    showScene,
    scenes: { startScene, gameScene },
  } = app;

  app.socket = activateSocket(game, gameMode, gameScene, startScene, showScene);
  renderScene(game, gameScene);

  return app;
};

export default initializeApp;

export interface App {
  game: Game;
  gameMode: GameMode;
  showScene: { index: number };
  scenes: {
    startScene: Scene;
    gameScene: Scene;
  };
  socket?: any;
}

export type GameMode = {
  mode: string | undefined;
  player: string | undefined;
  room: string | undefined;
  time: number | undefined;
};
