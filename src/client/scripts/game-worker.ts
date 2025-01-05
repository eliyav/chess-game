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
    progressLogger: (progress) => {
      self.postMessage({ type: "progress", progress });
    },
  });
  if (!bestMove) return;
  game.move(bestMove);
  self.postMessage({ type: "move", move: bestMove });
}

self.onmessage = (e: WorkerEvents) => {
  if (e.data.type === "move") {
    const { from, to } = e.data.data;
    if (!from || !to) return;
    game.move({ from, to });
    requestMove({
      maximizingPlayer: e.data.data.maximizingPlayer,
      depth: e.data.data.depth,
    });
  } else if (e.data.type === "request-move") {
    requestMove(e.data.data);
  } else if (e.data.type === "start" || e.data.type === "reset") {
    game.resetGame();
    if (e.data.data.maximizingPlayer) {
      requestMove({
        maximizingPlayer: e.data.data.maximizingPlayer,
        depth: e.data.data.depth,
      });
    }
  } else if (e.data.type === "undo") {
    game.undoTurn();
  } else {
    console.error("Invalid message type");
  }
};

type WorkerEvents = {
  data: {
    type: string;
    data: {
      depth: number;
      maximizingPlayer: boolean;
      from?: Point;
      to?: Point;
    };
  };
};
