import GamePiece from "./GamePiece";
import { calcKingMoves } from "../helper/movementFunctions";

class King extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
  }

  castlingAvailable(moved) {
    //Calculate castling available with rooks
  }

  calculateAvailableMoves(grid, currentPoint = this.point) {
    const kingMoves = [
      [0, 1],
      [1, 1],
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
