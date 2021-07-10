import GamePiece from "./game-piece";
import { calcKnightMovement } from "../../helper/movement-helpers.js";

class Knight extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
  }
  calculateAvailableMoves(grid, currentPoint = this.point) {
    const knightMoves = [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, 2],
      [-2, 1],
      [-2, -1],
      [-1, -2],
    ];
    const availableMoves = [];

    calcKnightMovement(grid, currentPoint, this.color, knightMoves, availableMoves);

    return availableMoves;
  }
}

export default Knight;
