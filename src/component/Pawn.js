import GamePiece from "./GamePiece";
import { calcPawnMovement } from "../helper/movementFunctions";

class Pawn extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
    this.direction = this.color === "white" ? 1 : -1;
  }
  //Add EnPasse rule
  calculateAvailableMoves(grid, currentPoint = this.point) {
    const availableMoves = [];

    calcPawnMovement(grid, currentPoint, this.direction, this.moved, this.color, availableMoves);

    return availableMoves;
  }
}

export default Pawn;
