import Match from "../component/match";
import EventEmitter from "../events/event-emitter";
import { ChessPieceMesh } from "../view/asset-loader";
import { CanvasView } from "../view/view-init";
import inputController from "./input-controller";

const initGameController = (
  match: React.MutableRefObject<Match | undefined>,
  view: CanvasView | undefined,
  emitter: EventEmitter | undefined
) => {
  view!.scenes.gameScene.onPointerDown = async (e: any, pickResult: any) => {
    if (match.current !== undefined) {
      if (match.current.matchSettings.mode === "Online") {
        if (
          match.current.matchSettings.player ===
          match.current.game.state.currentPlayer
        ) {
          onClickEvent(match.current);
        }
      } else {
        onClickEvent(match.current);
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
