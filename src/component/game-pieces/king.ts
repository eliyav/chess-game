import GamePiece from "./game-piece";
import { calcKingMoves } from "../../helper/movement-helpers.js";
import { calcCastling } from "../../helper/game-helpers";

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

class King extends GamePiece {
  castling: boolean;

  constructor(name: string, color: string, point: number[], movement: number[]) {
    super(name, color, point, movement);
    this.castling = false;
  }

  calculateAvailableMoves(grid: Square[][], state: State, turnHistory: TurnHistory, castle = this.castling, currentPoint = this.point) {
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

    const availableMoves: number[][] = [];

    calcKingMoves(grid, currentPoint, this.color, kingMoves, availableMoves);

    if (!this.moved) {
      if (castle) {
        calcCastling(grid, state, turnHistory, currentPoint, availableMoves);
      }
    }

    return availableMoves;
  }
}

export default King;
