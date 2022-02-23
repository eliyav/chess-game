import EventEmitter from "../../src/events/event-emitter";
import { CanvasView } from "../../src/view/create-view";
import { TurnHistory } from "../../src/helper/game-helpers";
import GamePiece from "../../src/component/game-logic/game-piece";
import OnlineMatch from "../../src/component/online-match";

export const onlineGameEmitter = (
  onlineMatch: OnlineMatch,
  canvasView: CanvasView
): EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on(
    "resolveMove",
    (originPoint: Point, targetPoint: Point, history: TurnHistory) => {
      canvasView.turnAnimation(originPoint, targetPoint, history);
      if (history.promotion === undefined) {
        const isMatchOver = onlineMatch.game.switchTurn();
        if (isMatchOver) {
          canvasView.gameScene.detachControl();
          const winningTeam =
            onlineMatch.game.state.currentPlayer === onlineMatch.game.teams[0]
              ? onlineMatch.game.teams[1]
              : onlineMatch.game.teams[0];
          emitter.emit("end-match", winningTeam);
        }
      } else {
        //Handle Promotion Event
        emitter.emit("promotion-selections");
      }
    }
  );

  emitter.on("selected-promotion-piece", (selection: string) => {
    const turnHistory = onlineMatch.game.turnHistory.at(-1);
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
      const annotations = onlineMatch.game.annotations;
      annotations[annotations.length - 1] = `${square}${symbol}`;
      canvasView.updateMeshesRender(onlineMatch.game);
      onlineMatch.game.switchTurn();
      canvasView.gameScene.attachControl();
    }
  });

  emitter.on("board-reset", () => {
    onlineMatch.resetMatch();
    canvasView.updateMeshesRender(onlineMatch.game);
  });

  emitter.on("undo-move", () => {
    onlineMatch.game.undoTurn();
    canvasView.updateGameView(onlineMatch.game);
  });

  emitter.on("reset-camera", () => {
    canvasView.resetCamera(onlineMatch.game);
  });

  return emitter;
};
