import GamePiece from "./game-piece";
import { filterToFinalMoves, calcHorizontalMovements } from "../../helper/movement-helpers";
import {Square} from "../../helper/board-helpers";
import {TurnHistory} from "../../helper/game-helpers";
import {State} from "../../data/chess-data-import"

export interface PieceInstance {
  calculateAvailableMoves(grid: Square[][], state: State, turnHistory: TurnHistory, boolean : boolean, currentPoint: Point):  Move[];
}

export type Move = [Point, string]

class Bishop extends GamePiece implements PieceInstance {
  constructor(name: string, color: string, point: Point, movement: number[]) {
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
