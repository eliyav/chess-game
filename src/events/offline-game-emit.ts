import EventEmitter from "../../src/events/event-emitter";
import { CanvasView } from "../../src/view/create-view";
import { TurnHistory } from "../../src/helper/game-helpers";
import GamePiece from "../../src/component/game-logic/game-piece";
import OfflineMatch from "../component/offline-match";

const offlineGameEmitter = (
  offlineMatch: OfflineMatch,
  canvasView: CanvasView
): EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on(
    "resolveMove",
    (originPoint: Point, targetPoint: Point, resolved: TurnHistory) => {
      canvasView.turnAnimation(originPoint, targetPoint, resolved);
      if (resolved.promotion === undefined) {
        const isMatchOver = offlineMatch.game.switchTurn();
        canvasView.rotateCamera(offlineMatch.game);
        isMatchOver ? canvasView.gameScene.detachControl() : null;
      } else {
        //Handle Promotion Event
        emitter.emit("piece-promotion");
      }
    }
  );

  emitter.on("promotion-selection", (selection: string) => {
    const turnHistory = offlineMatch.game.turnHistory.at(-1);
    if (turnHistory !== undefined) {
      const square = turnHistory.targetSquare.square;
      turnHistory.promotion = selection;
      const { color, point, movement } = turnHistory.originPiece!;
      turnHistory.targetSquare.on = new GamePiece(
        selection,
        color,
        point,
        movement
      );
      const symbol = turnHistory.targetSquare.on.getSymbol();
      const annotations = offlineMatch.game.annotations;
      annotations[annotations.length - 1] = `${square}${symbol}`;
      canvasView.updateMeshesRender(offlineMatch.game);
      offlineMatch.game.switchTurn();
      canvasView.gameScene.attachControl();
    }
  });

  emitter.on("detach-game-control", () => {
    canvasView.gameScene.detachControl();
  });

  emitter.on("reset-board", () => {
    offlineMatch.resetMatch();
    canvasView.updateMeshesRender(offlineMatch.game);
  });

  emitter.on("undo-move", () => {
    offlineMatch.game.undoTurn();
    canvasView.updateGameView(offlineMatch.game);
  });

  emitter.on("reset-camera", () => {
    canvasView.resetCamera(offlineMatch.game);
  });

  return emitter;
};

export default offlineGameEmitter;
