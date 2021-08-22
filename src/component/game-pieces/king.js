import GamePiece from "./game-piece";
import { calcKingMoves } from "../../helper/movement-helpers.js";
import { calcCastling } from "../../helper/game-helpers";

class King extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
    this.castling = false;
  }

  calculateAvailableMoves(grid, gameState, turnHistory, castle = this.castling, currentPoint = this.point) {
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

    if (!this.moved) {
      if (castle) {
        calcCastling(grid, gameState, turnHistory, currentPoint, availableMoves);
      }
    }

    return availableMoves;
  }
}

export default King;
