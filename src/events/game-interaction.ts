import MatchContext from "../component/match-context";
import Game from "../component/game-logic/game";
import EventEmitter from "../events/event-emitter";
import { ChessPieceMesh } from "../view/asset-loader";
import { RenderContext } from "../view/render-context";
import inputController from "./input-controller";

const activateGameInteraction = (
  chessGame: Game,
  matchContext: MatchContext,
  renderContext: RenderContext,
  emitter: EventEmitter
) => {
  const {
    scenes: { gameScene },
  } = renderContext;

  gameScene.onPointerDown = async (e: any, pickResult: any) => {
    if (matchContext.mode === "Online") {
      if (matchContext.player === chessGame.state.currentPlayer) {
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
          chessGame,
          gameScene,
          matchContext
        );
        isCompleteMove
          ? (() => {
              const [originPoint, targetPoint] = chessGame.moves;
              emitter!.emit("playerMove", originPoint, targetPoint);
            })()
          : null;
      }
    }
  };
};

export default activateGameInteraction;
