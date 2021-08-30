import GamePiece from "./game-piece";
import { filterToFinalMoves, calcVerticalMovements } from "../../helper/movement-helpers.js";

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

class Rook extends GamePiece {
  constructor(name: string, color: string, point: number [], movement: number[]) {
    super(name, color, point, movement);
  }


  calculateAvailableMoves(grid: Square[][], state:State, turnHistory: TurnHistory, boolean: boolean, currentPoint = this.point) {
    const availableMoves: number[][] = [];
    const verticalMovements = {
      up: [],
      down: [],
      right: [],
      left: [],
    };

    this.movement.forEach((move) => {
      calcVerticalMovements(grid, currentPoint, move, verticalMovements);
    });

    filterToFinalMoves(grid, this.color, verticalMovements, availableMoves);

    return availableMoves;
  }
}

export default Rook;
