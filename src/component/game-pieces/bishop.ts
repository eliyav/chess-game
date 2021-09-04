import GamePiece from "./game-piece";
import { filterToFinalMoves, calcHorizontalMovements } from "../../helper/movement-helpers";
import {Square} from "../../helper/board-helpers";
import {TurnHistory} from "../../helper/game-helpers";

interface State {
  currentPlayer: string,
}

export interface PieceInstance {
  calculateAvailableMoves(grid: Square[][], state: State, turnHistory: TurnHistory, boolean : boolean, currentPoint: [number, number]):  Move[];
}

export type Move = [[number,number], string]

class Bishop extends GamePiece implements PieceInstance {
  constructor(name: string, color: string, point: [number, number], movement: number[]) {
    super(name, color, point, movement);
  }

  calculateAvailableMoves(grid: Square[][], state: State, turnHistory: TurnHistory, boolean : boolean, currentPoint = this.point) {
    const availableMoves: Move[] = [];
    const horizantalMovements = {
      upRight: [],
      upLeft: [],
      downRight: [],
      downLeft: [],
    };

    this.movement.forEach((move) => {
      calcHorizontalMovements(grid, currentPoint, move, horizantalMovements);
    });

    filterToFinalMoves(grid, this.color, horizantalMovements, availableMoves);

    return availableMoves; 
  }
}

export default Bishop;
