import { Engine, Scene } from "babylonjs";
import { renderScene } from "../helper/canvas-helpers";
import Game from "./game/game";
import chessData from "../data/chess-data-import";
import startScreen from "../view/start-screen";
import gameScreen from "../view/game-screen";
import activateEmitter from "../events/emitter";
import inputController from "../events/input-controller";
import EventEmitter from "../events/event-emitter";
import { ChessPieceMesh } from "../view/asset-loader";

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
    emitter: undefined,
  };

  const {
    game,
    gameMode,
    showScene,
    scenes: { startScene, gameScene },
  } = app;

  // app.socket = activateSocket(game, gameMode, gameScene, startScene, showScene);
  app.emitter = activateEmitter(app);
  renderScene(game, gameScene);

  gameScene.onPointerDown = async (e: any, pickResult: any) => {
    function onClickEvent() {
      if (pickResult.pickedMesh !== null) {
        const mesh: ChessPieceMesh = pickResult.pickedMesh;
        const isCompleteMove = inputController(mesh, game, gameScene, gameMode);
        isCompleteMove
          ? (() => {
              const [originPoint, targetPoint] = game.moves;
              if (typeof app.emitter !== "undefined") {
                app.emitter.emit("playerMove", originPoint, targetPoint);
              }
            })()
          : null;
      }
    }
    if (gameMode.mode === "online") {
      if (gameMode.player === game.state.currentPlayer) {
        onClickEvent();
      }
    } else {
      onClickEvent();
    }
  };

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
  emitter?: EventEmitter;
  socket?: any;
}

export type GameMode = {
  mode: string | undefined;
  player: string | undefined;
  room: string | undefined;
  time: number | undefined;
};
