import EventEmitter from "./event-emitter";
import { renderScene, rotateCamera } from "../helper/canvas-helpers";
import { RenderContext } from "../view/render-context";
import Game from "../component/game-logic/game";
import MatchContext from "../component/match-context";

const activateEmitter = (
  chessGame: Game,
  matchContext: MatchContext,
  renderContext: RenderContext,
  socket: any
): EventEmitter => {
  const {
    showScene,
    scenes: { gameScene, startScene },
  } = renderContext;

  const emitter = new EventEmitter();

  emitter.on("playerMove", (originPoint: Point, targetPoint: Point) => {
    renderScene(chessGame, gameScene);
    const resolved = chessGame.playerMove(originPoint!, targetPoint!);
    if (resolved) {
      if (matchContext.mode === "Offline") {
        chessGame.switchTurn();
        renderScene(chessGame, gameScene);
        rotateCamera(chessGame.state.currentPlayer, gameScene);
      } else if (matchContext.mode === "Online") {
        const room = matchContext.room;
        renderScene(chessGame, gameScene);
        chessGame.switchTurn();
        socket.emit("stateChange", { originPoint, targetPoint, room });
      }
    }
    chessGame.moves.length = 0;
  });

  emitter.on("reset-board", () => {
    const answer = confirm("Are you sure you want to reset the board?");
    if (answer) {
      if (matchContext.mode === "online") {
        socket.emit("reset-board", matchContext);
      } else {
        chessGame.resetGame(matchContext.time);
        renderScene(chessGame, gameScene);
        let camera: any = gameScene.cameras[0];
        camera.alpha = Math.PI;
      }
    }
  });

  emitter.on("pause-game", (currentPlayer: string) => {
    if (matchContext.mode === "Online") {
      if (matchContext.player === chessGame.state.currentPlayer) {
        let time;
        if (currentPlayer === "White") {
          time = chessGame.timer.timer1;
        } else {
          time = chessGame.timer.timer2;
        }
        socket.emit("pause-game", {
          matchContext,
          currentPlayer,
          time,
        });
      }
    } else {
      chessGame.timer.pauseTimer();
    }
  });

  emitter.on("undo-move", () => {
    if (matchContext.mode === "online") {
      if (matchContext.player !== chessGame.state.currentPlayer) {
        const lastTurn = chessGame.turnHistory.at(-1);
        if (lastTurn !== undefined) {
          socket.emit("undo-move", matchContext);
        }
      }
    } else {
      chessGame.undoTurn();
      renderScene(chessGame, gameScene);
      emitter.emit("reset-camera");
    }
  });

  emitter.on("create-match", ({ mode, time, player }: MatchContext) => {
    matchContext.mode = mode;
    matchContext.time = time;
    matchContext.player = player;
    if (mode === "Offline") {
      emitter.emit("prepare-game-scene");
    } else {
      socket.emit("create-room");
    }
  });

  emitter.on("prepare-game-scene", () => {
    chessGame.resetGame(matchContext.time);
    renderScene(chessGame, gameScene);
    startScene.detachControl();
    showScene.index = 1;
    emitter.emit("reset-camera");
  });

  emitter.on("reset-camera", () => {
    let camera: any = gameScene.cameras[0];
    if (matchContext.mode === "online") {
      matchContext.player === "White" ? setToWhitePlayer() : setToBlackPlayer();
    } else {
      chessGame.state.currentPlayer === "White"
        ? setToWhitePlayer()
        : setToBlackPlayer();
    }

    function setToWhitePlayer() {
      camera.alpha = Math.PI;
      camera.beta = Math.PI / 4;
      camera.radius = 40;
    }

    function setToBlackPlayer() {
      camera.alpha = 0;
      camera.beta = Math.PI / 4;
      camera.radius = 40;
    }
  });

  emitter.on("home-screen", () => {
    let camera: any = gameScene.cameras[0];
    camera.alpha = Math.PI;
    chessGame.gameStarted = false;
    gameScene.detachControl();
    showScene.index = 0;
  });

  emitter.on("join-online-match", () => {
    matchContext.mode = "online";
    let room = prompt("Please enter the room key");
    socket.emit("join-room", room);
  });

  return emitter;
};

export default activateEmitter;
