const resetBoardButton = document.getElementById("reset-board");
const gameDrawButton = document.getElementById("request-draw");
const gameResignButton = document.getElementById("resign-game");
const gameUndoButton = document.getElementById("undo-turn");

const addEventListeners = (emitter) => {
  if (emitter) {
    resetBoardButton.addEventListener("click", () => emitter.emit("reset-board"));

    gameDrawButton.addEventListener("click", () => emitter.emit("draw"));

    gameResignButton.addEventListener("click", () => emitter.emit("resign"));
  }
};

export default addEventListeners;
