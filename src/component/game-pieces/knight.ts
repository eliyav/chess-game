import GamePiece from "./game-piece";
import { calcKnightMovement } from "../../helper/movement-helpers";
import {Square} from "../../helper/board-helpers";
import {TurnHistory} from "../../helper/game-helpers";
import {PieceInstance, Move} from "./bishop"
import {State} from "../../data/chess-data-import"

class Knight extends GamePiece implements PieceInstance {
  constructor(name: string, color: string, point: [number, number], movement: number[]) {
    super(name, color, point, movement);
  }
  calculateAvailableMoves(grid: Square[][], state: State, turnHistory: TurnHistory, boolean: boolean, currentPoint = this.point) {
    const knightMoves: [number, number][] = [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, 2],
      [-2, 1],
      [-2, -1],
      [-1, -2],
    ];

    const availableMoves: Move[] = [];

    calcKnightMovement(grid, currentPoint, this.color, knightMoves, availableMoves);

    return availableMoves;
  }
}

export default Knight;
