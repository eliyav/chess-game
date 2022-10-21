import EventEmitter from "../../events/event-emitter";
import { TurnHistory } from "../../helper/game-helpers";
import GamePiece from "../game-logic/game-piece";
import { Match } from "../match";
import { SceneManager } from "../scene-manager";

export const matchController = (
  match: Match,
  sceneManager: SceneManager
): EventEmitter => {
  const emitter = new EventEmitter();

  emitter.on(
    "resolveMove",
    (originPoint: Point, targetPoint: Point, history: TurnHistory) => {
      sceneManager.turnAnimation(originPoint, targetPoint, history);
      if (history.promotion === undefined) {
        match.switchPlayer();
        sceneManager.rotateCamera(match.game);
      } else {
        //Handle Promotion Event
        emitter.emit("promotion-selections");
      }
    }
  );

  emitter.on("selected-promotion-piece", (selection: string) => {
    const turnHistory = match.game.turnHistory.at(-1);
    if (turnHistory !== undefined) {
      const square = turnHistory.targetSquare.square;
      turnHistory.promotedPiece = selection;
      const { color, point, movement } = turnHistory.originPiece!;
      turnHistory.targetSquare.on = new GamePiece(
        selection,
        color,
        point,
        movement
      );
      const symbol = turnHistory.targetSquare.on.getSymbol();
      const annotations = match.game.annotations;
      annotations[annotations.length - 1] = `${square}${symbol}`;
      sceneManager.updateMeshesRender(match.game);
      match.switchPlayer();
      sceneManager.gameScreen!.attachControl();
    }
  });

  emitter.on("board-reset", () => {
    match.resetMatch();
    sceneManager.prepGameScreen(match.game);
  });

  emitter.on("undo-move", () => {
    if (match.isActive) {
      const undo = match.undoTurn();
      if (undo) sceneManager.updateGameView(match.game);
    }
  });

  emitter.on("reset-camera", () => {
    sceneManager.resetCamera(match.game);
  });

  return emitter;
};
