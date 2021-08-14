import GamePiece from "./game-piece";
import { calcKingMoves } from "../../helper/movement-helpers.js";

class King extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
  }

  calculateAvailableMoves(grid, currentPoint = this.point) {
    const kingMoves = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
      [0, -1],
      [-1, -1],
      [-1, 0],
      [-1, 1],
    ];

    const availableMoves = [];

    calcKingMoves(grid, currentPoint, this.color, kingMoves, availableMoves);
    return availableMoves;
  }
}

export default King;
