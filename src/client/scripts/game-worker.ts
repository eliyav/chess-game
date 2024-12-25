import { Point } from "../../shared/game";
import Game from "../game-logic/game";
const game = new Game();

function requestMove({
  maximizingPlayer,
  depth,
}: {
  maximizingPlayer: boolean;
  depth: number;
}) {
  const bestMove = game.getBestMove({
    depth,
    maximizingPlayer,
  });
  if (!bestMove) return;
  game.move(bestMove);
  self.postMessage({ type: "move", move: bestMove });
}

self.onmessage = (e: WorkerEvents) => {
  if (e.data.type === "move") {
    game.move(e.data.data);
    requestMove({
      maximizingPlayer: e.data.data.maximizingPlayer,
      depth: e.data.data.depth,
    });
  } else if (e.data.type === "request-move") {
    requestMove(e.data.data);
  } else if (e.data.type === "start" || e.data.type === "reset") {
    game.resetGame();
  } else if (e.data.type === "undo") {
    game.undoTurn();
  } else {
    console.error("Invalid message type");
  }
};

type WorkerEvents = {
  data:
    | {
        type: "request-move";
        data: {
          depth: number;
          maximizingPlayer: boolean;
        };
      }
    | {
        type: "move";
        data: {
          origin: Point;
          target: Point;
          depth: number;
          maximizingPlayer: boolean;
        };
      }
    | {
        type: "start" | "reset" | "undo";
      };
};
