importScripts("./game-logic.js");

const game = new Game();

console.log(game);
self.onmessage = (e) => {
  console.log("Worker received message", e.data);
  if (e.data.type === "new-game") {
    game.reset();
    return;
  } else if (e.data.type === "move") {
    game.move(e.data.data);
    const bestMove = game.getBestMove({ depth: 3 });
    game.move(bestMove);
    self.postMessage({ type: "move", move: bestMove });
    return;
  }
};
