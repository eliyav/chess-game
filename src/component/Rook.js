import GamePiece from "./GamePiece";
import { filterToFinalMoves, calcVerticalMovements } from "../helper/movementFunctions";

class Rook extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
  }

  calculateAvailableMoves(grid, currentPoint = this.point) {
    const availableMoves = [];
    const verticalMovements = {
      up: [],
      down: [],
      right: [],
      left: [],
    };

    this.movement.forEach((move) => {
      calcVerticalMovements(grid, currentPoint, move, verticalMovements);
    });

    filterToFinalMoves(grid, this.color, availableMoves, verticalMovements);

    return availableMoves;
  }
}

export default Rook;
