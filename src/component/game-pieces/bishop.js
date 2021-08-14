import GamePiece from "./game-piece";
import { filterToFinalMoves, calcHorizontalMovements } from "../../helper/movement-helpers.js";

class Bishop extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
  }
  calculateAvailableMoves(grid, currentPoint = this.point) {
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

    filterToFinalMoves(grid, this.color, horizantalMovements, availableMoves);

    return availableMoves;
  }
}

export default Bishop;
