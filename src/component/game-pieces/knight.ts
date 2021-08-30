import GamePiece from "./game-piece";
import { calcKnightMovement } from "../../helper/movement-helpers.js";

interface Square {
  square : string,
  on?: undefined
  }

interface State {
  currentPlayer: string,
}

interface TurnHistory {
  result: boolean;
  type: string;
  direction: number;
  origin: number[];
  target: number[];
  originPiece: any;
  targetPiece: any;
  originSquare: Square;
  targetSquare: Square;
  promotion?: undefined;
}

class Knight extends GamePiece {
  constructor(name: string, color: string, point: number [], movement: number[]) {
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
