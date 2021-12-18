import Match from "../component/match";
import EventEmitter from "../events/event-emitter";
import { ChessPieceMesh } from "../view/asset-loader";
import { CanvasView } from "../view/view-init";
import inputController from "./input-controller";

const initGameController = (
  match: Match | undefined,
  view: CanvasView | undefined,
  emitter: EventEmitter | undefined
) => {
  view!.scenes.gameScene.onPointerDown = async (e: any, pickResult: any) => {
    if (match !== undefined) {
      if (match.matchSettings.mode === "Online") {
        if (match.matchSettings.player === match.game.state.currentPlayer) {
          onClickEvent(match);
        }
      } else {
        onClickEvent(match);
      }

      function onClickEvent(match: Match) {
        if (pickResult.pickedMesh !== null) {
          const mesh: ChessPieceMesh = pickResult.pickedMesh;
          const isCompleteMove = inputController(mesh, view!, match);
          isCompleteMove
            ? (() => {
                const [originPoint, targetPoint] = match.game.moves;
                view!.updateMeshesRender(match.game);
                const resolved = match.game.playerMove(
                  originPoint!,
                  targetPoint!
                );
                if (resolved) {
                  emitter!.emit("resolveMove", originPoint, targetPoint);
                }
                match.game.resetMoves();
              })()
            : null;
        }
      }
    }
  };
};

export default initGameController;
