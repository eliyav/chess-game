import { ChessApp } from "../component/chess-app";
import EventEmitter from "../events/event-emitter";
import { ChessPieceMesh } from "../view/asset-loader";
import inputController from "./input-controller";

const activateGameInteraction = (chessApp: ChessApp, emitter: EventEmitter) => {
  chessApp.scenes.gameScene.onPointerDown = async (e: any, pickResult: any) => {
    if (chessApp.gameMode.mode === "Online") {
      if (chessApp.gameMode.player === chessApp.game.state.currentPlayer) {
        onClickEvent();
      }
    } else {
      onClickEvent();
    }

    function onClickEvent() {
      if (pickResult.pickedMesh !== null) {
        const mesh: ChessPieceMesh = pickResult.pickedMesh;
        const isCompleteMove = inputController(
          mesh,
          chessApp.game,
          chessApp.scenes.gameScene,
          chessApp.gameMode
        );
        isCompleteMove
          ? (() => {
              const [originPoint, targetPoint] = chessApp.game.moves;
              emitter!.emit("playerMove", originPoint, targetPoint);
            })()
          : null;
      }
    }
  };
};

export default activateGameInteraction;
