import GamePiece from "./GamePiece";
import { filterToFinalMoves, calcHorizontalMovements } from "../helper/movementFunctions";

class Bishop extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
  }
  calculateAvailableMoves(currentPoint, grid) {
    const availableMoves = [];
    const horizantalMovements = {
      upRight: [],
      upLeft: [],
      downRight: [],
      downLeft: [],
    };

    this.movement.forEach((move) => {
      calcHorizontalMovements(grid, currentPoint, move, horizantalMovements);
    });

    filterToFinalMoves(grid, this.color, availableMoves, horizantalMovements);

    return availableMoves;
  }
}

export default Bishop;
