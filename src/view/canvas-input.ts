import Game from "../component/game-logic/game";
import gameInput from "./game-input";
import { ChessPieceMesh } from "./game-assets";
import { CanvasView } from "./create-view";
import { TurnHistory } from "../helper/game-helpers";
import { Timer } from "../timer/timer";

const initCanvasInput = (
  game: Game,
  timer: Timer,
  view: CanvasView,
  resolve: (
    type: string,
    origin: Point,
    target: Point,
    resolved: TurnHistory
  ) => void,
  online: boolean,
  team?: string
) => {
  view!.gameScene.onPointerDown = async (e: any, pickResult: any) => {
    if (!timer.paused) {
      if (online) {
        team === game.state.currentPlayer ? resolveInput() : null;
      } else {
        resolveInput();
      }
    }

    function resolveInput() {
      if (pickResult.pickedMesh !== null) {
        const mesh: ChessPieceMesh = pickResult.pickedMesh;
        const isCompleteMove = gameInput(mesh, view!, game);
        if (isCompleteMove) {
          const [originPoint, targetPoint] = game.moves;
          view.updateMeshesRender(game);
          const resolved = game.playerMove(originPoint, targetPoint);
          if (typeof resolved !== "boolean" && resolved.result) {
            resolve("resolveMove", originPoint, targetPoint, resolved);
          }
          game.resetMoves();
        }
      }
    }
  };
};

export default initCanvasInput;
