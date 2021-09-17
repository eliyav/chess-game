import { renderScene } from "./helper/canvas-helpers";
import Game from "./game";
import chessData from "./data/chess-data-import";
import startScreen from "./view/start-screen";
import gameScreen from "./view/game-screen";
import activateEmitter from "./events/emitter";
import setGUI from "./view/gui-overlay";
import inputController from "./events/input-controller";
import {Engine} from "babylonjs"
import { Scene } from "babylonjs";
import EventEmitter from "./events/event-emitter";
import { ChessPieceMesh } from "./view/asset-loader";
import activateSocket from "./component/sockets"

export interface App{
  game: Game,
  gameMode: {mode: string | undefined, player: string | undefined , room: number | undefined}
  showScene: {index: number},
  scenes: {
   startScene: Scene,
   gameScene: Scene,
  }
  emitter?: EventEmitter,
  socket?: any,
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
    socket: undefined,
    emitter: undefined,
  };

  const {
    game,
    gameMode,
    scenes: { gameScene },
  } = app;

  app.socket = activateSocket(game, gameMode, gameScene);
  app.emitter = activateEmitter(game, gameMode, gameScene, app.socket);
  setGUI(app);
  renderScene(game, gameScene);

  gameScene.onPointerDown = async (e: any, pickResult: any) => {
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
