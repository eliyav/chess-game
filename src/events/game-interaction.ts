import Match from "../component/match";
import EventEmitter from "../events/event-emitter";
import { ChessPieceMesh } from "../view/asset-loader";
import { CanvasView } from "../view/view-init";
import inputController from "./input-controller";

const initGameController = (
  matchRef: React.MutableRefObject<Match | undefined>,
  view: CanvasView | undefined,
  emitter: EventEmitter | undefined
) => {
  view!.scenes.gameScene.onPointerDown = async (e: any, pickResult: any) => {
    if (matchRef.current !== undefined) {
      if (matchRef.current.matchSettings.mode === "Online") {
        if (
          matchRef.current.matchSettings.player ===
          matchRef.current.game.state.currentPlayer
        ) {
          onClickEvent(matchRef.current);
        }
      } else {
        onClickEvent(matchRef.current);
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
                if (typeof resolved !== "boolean" && resolved.result) {
                  emitter!.emit(
                    "resolveMove",
                    originPoint,
                    targetPoint,
                    resolved
                  );
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
