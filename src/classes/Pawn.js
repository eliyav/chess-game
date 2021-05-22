import GamePiece from "./GamePiece";
import { calcPawnMovement } from "../helper/movementFunctions";

class Pawn extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
    this.direction = this.color === "white" ? 1 : -1;
  }
  //Add EnPasse rule
  calculateAvailableMoves(currentPoint, grid) {
    let availableMoves = [];
    let pawnMovements = {
      movements: [],
      captures: [],
      finalMoves: [],
    };

    calcPawnMovement(grid, currentPoint, this.direction, this.moved, this.color, pawnMovements);

    return pawnMovements.finalMoves;
  }
}

export default Pawn;
