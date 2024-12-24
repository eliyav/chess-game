importScripts("./game-logic.js");

const game = new Game();

self.onmessage = (e) => {
  if (e.data.type === "move") {
    game.move(e.data.data);
  } else if (e.data.type === "start") {
    game.resetGame();
  } else if (e.data.type === "undo") {
    game.undoTurn();
  } else if (e.data.type === "request-move") {
    const bestMove = game.getBestMove({
      depth: e.data.depth,
      maximizingPlayer: e.data.maximizingPlayer,
    });
    game.move(bestMove);
    self.postMessage({ type: "move", move: bestMove });
  }
};