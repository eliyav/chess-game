import EventEmitter from "../../src/events/event-emitter";
import { CanvasView } from "../../src/view/create-view";
import { TurnHistory } from "../../src/helper/game-helpers";
import GamePiece from "../../src/component/game-logic/game-piece";
import OfflineMatch from "../component/offline-match";

export const offlineGameEmitter = (
  offlineMatch: OfflineMatch,
  canvasView: CanvasView
): EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on(
    "resolveMove",
    (originPoint: Point, targetPoint: Point, history: TurnHistory) => {
      canvasView.turnAnimation(originPoint, targetPoint, history);
      if (history.promotion === undefined) {
        const isMatchOver = offlineMatch.game.switchTurn();
        if (!isMatchOver) canvasView.rotateCamera(offlineMatch.game);
      } else {
        //Handle Promotion Event
        emitter.emit("promotion-selections");
      }
    }
  );

  emitter.on("selected-promotion-piece", (selection: string) => {
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

  emitter.on("board-reset", () => {
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
