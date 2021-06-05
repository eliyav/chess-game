import GamePiece from "./GamePiece";
import { calcKingMoves } from "../helper/movementFunctions";

class King extends GamePiece {
  constructor(name, color, point, movement) {
    super(name, color, point, movement);
    this.moved = false;
  }

  castlingAvailable = (grid) => {
    //Refactor later here instead of button
    //Check Target Square is your own rook, and if so, that he hasn't moved
    //Check squares are unoccupied between king and rook
    //The king is not in check
    //None of the castling involved squares are one of the opponents available moves
  };

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
