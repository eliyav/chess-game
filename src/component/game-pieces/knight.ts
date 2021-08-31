import GamePiece from "./game-piece";
import { calcKnightMovement } from "../../helper/movement-helpers";
import {Square} from "../../helper/board-helpers";
import {TurnHistory} from "../../helper/game-helpers";

interface State {
  currentPlayer: string,
}

class Knight extends GamePiece {
  constructor(name: string, color: string, point: [number, number], movement: number[]) {
    super(name, color, point, movement);
  }
  calculateAvailableMoves(grid: Square[][], state: State, turnHistory: TurnHistory, boolean: boolean, currentPoint = this.point) {
    const knightMoves = [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, 2],
      [-2, 1],
      [-2, -1],
      [-1, -2],
    ];
    const availableMoves: number[][] = [];

    calcKnightMovement(grid, currentPoint, this.color, knightMoves, availableMoves);

    return availableMoves;
  }
}

export default Knight;
