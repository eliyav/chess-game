import { renderScene } from "./helper/canvas-helpers";
import Game from "./game";
import chessData from "./data/chess-data-import";
import startScreen from "./view/start-screen";
import gameScreen from "./view/game-screen";
import activateEmitter from "./events/emitter";
import setGUI from "./view/gui-overlay";
import inputController from "./events/input-controller";
import { Engine } from "babylonjs/Engines/engine";
import { Scene } from "babylonjs/scene";
import EventEmitter from "./events/event-emitter";
import activateSocket from "./server/sockets";
import { ChessPieceMesh } from "./view/asset-loader";

export interface App{
  game: Game,
  gameMode: {mode: string | undefined, player: string | undefined , room: number | undefined}
  showScene: {index: number},
  scenes: {
   startScene: Scene,
   gameScene: Scene,
  }
  emitter?: EventEmitter,
  socket?: undefined,
}

const initializeApp = async (canvas: HTMLCanvasElement, engine: Engine) => {
  const app: App = {
    game: new Game(chessData),
    gameMode: { mode: undefined, player: undefined, room: undefined },
    showScene: { index: 0 },
    scenes: { 
      startScene: await startScreen(canvas, engine), 
      gameScene: await gameScreen(canvas, engine)
    },
    emitter: undefined,
  };

  const {
    game,
    gameMode,
    showScene,
    scenes: { startScene, gameScene },
  } = app;

  app.emitter = activateEmitter(game, gameMode, gameScene);
  //appContext.socket = activateSocket(game, gameMode, gameScene);
  setGUI(app);
  renderScene(game, gameScene);

  gameScene.onPointerDown = async (e, pickResult) => {
    if(pickResult.pickedMesh !== null){
      const mesh: ChessPieceMesh = pickResult.pickedMesh;
      const isCompleteMove = inputController(mesh, game, gameScene);
      isCompleteMove
        ? (() => {
            const [originPoint, targetPoint] = game.moves;
            if(typeof app.emitter !== "undefined"){
              app.emitter.emit("playerMove", originPoint, targetPoint);
            }
          })()
        : null;
    };
    }


  return app;
};

export default initializeApp;
