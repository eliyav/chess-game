import GamePiece from "./game-piece";
import { calcPawnMovement } from "../../helper/movement-helpers.js";

class Pawn extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
    this.direction = this.color === "White" ? 1 : -1;
  }

  calculateAvailableMoves(grid, currentPoint = this.point) {
    const availableMoves = [];

    calcPawnMovement(grid, currentPoint, this.direction, this.moved, this.color, availableMoves);

    return availableMoves;
  }
}

export default Pawn;
