import { calculatePoint } from "../../helper/canvas-helpers";

const activateInput = (scene, game, emitter) => {
  let moves = [];
  if (scene !== undefined) {
    if (scene.onPointerDown === undefined) {
      scene.onPointerDown = async (e, pickResult) => {
        let isCurrentPlayer;
        //Calculate X/Y point for grid from the canvas X/Z
        if (game.gameMode === "Online") {
          isCurrentPlayer = game.player === game.gameState.currentPlayer;
        } else {
          isCurrentPlayer = true;
        }
        if (isCurrentPlayer) {
          console.log("clicked");
          if (pickResult.hit === false) {
            return console.log("Please click on the board!");
          } else {
            const y = pickResult.pickedPoint.x;
            const x = pickResult.pickedPoint.z;
            if (x > 12 || y > 12 || x < -12 || y < -12) {
              return console.log("Please click on a square!");
            }
            const point = calculatePoint(x, y);
            //If point is valid, push it to moves
            if (moves.length === 0) {
              if (game.board.grid[point[0]][point[1]].on === undefined) {
                return console.log("Not a game piece!");
              }
              typeof point == "object" && game.board.grid[point[0]][point[1]].on.color === game.gameState.currentPlayer
                ? moves.push(point)
                : null;
            } else {
              typeof point == "object" ? moves.push(point) : null;
            }
            //If moves contains 2 points, move the piece
            moves.length === 2 ? emitter.emit("move", moves[0], moves[1]) : null;
            moves.length >= 2 ? (moves = []) : null;
          }
        } else {
          console.log("Opponents Turn!");
        }
      };
    }
  }
};

export default activateInput;
