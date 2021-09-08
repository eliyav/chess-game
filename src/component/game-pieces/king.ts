import GamePiece from "./game-piece";
import { calcKingMoves } from "../../helper/movement-helpers";
import { calcCastling, TurnHistory } from "../../helper/game-helpers";
import {Square} from "../../helper/board-helpers";
import {PieceInstance, Move} from "./bishop"
import {State} from "../../data/chess-data-import"

class King extends GamePiece implements PieceInstance {
  castling: boolean;

  constructor(name: string, color: string, point: Point, movement: number[]) {
    super(name, color, point, movement);
    this.castling = false;
  }

  calculateAvailableMoves(grid: Square[][], state: State, turnHistory: TurnHistory, boolean: boolean, currentPoint = this.point) {
    const kingMoves: Point[] = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
      [0, -1],
      [-1, -1],
      [-1, 0],
      [-1, 1],
    ];

    const availableMoves: Move[] = [];

    calcKingMoves(grid, currentPoint, this.color, kingMoves, availableMoves);

    if (!this.moved) {
      if (boolean) {
        calcCastling(grid, state, turnHistory, currentPoint, availableMoves);
      }
    }

    return availableMoves;
  }
}

export default King;
