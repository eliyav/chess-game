import GamePiece from "./GamePiece";
import { filterToFinalMoves, calcVerticalMovements, calcHorizontalMovements } from "../helper/movementFunctions";

class Queen extends GamePiece {
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
    const horizantalMovements = {
      upRight: [],
      upLeft: [],
      downRight: [],
      downLeft: [],
    };

    this.movement.forEach((move) => {
      calcVerticalMovements(grid, currentPoint, move, verticalMovements);
      calcHorizontalMovements(grid, currentPoint, move, horizantalMovements);
    });

    filterToFinalMoves(grid, this.color, availableMoves, verticalMovements);
    filterToFinalMoves(grid, this.color, availableMoves, horizantalMovements);

    return availableMoves;
  }
}

export default Queen;
