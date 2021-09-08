import GamePiece from "./game-piece";
import { filterToFinalMoves, calcVerticalMovements, calcHorizontalMovements } from "../../helper/movement-helpers";
import {Square} from "../../helper/board-helpers";
import {TurnHistory} from "../../helper/game-helpers";
import {PieceInstance, Move} from "./bishop";
import {State} from "../../data/chess-data-import";

class Queen extends GamePiece implements PieceInstance {
  constructor(name: string, color: string, point: Point, movement: number[]) {
    super(name, color, point, movement);
  }
  calculateAvailableMoves(grid: Square[][], state: State, turnHistory: TurnHistory, boolean: boolean, currentPoint = this.point) {
    const availableMoves: Move[] = [];
    const verticalMovements = {
      up: [],
      down: [],
      right: [],
      left: [],
    };
    const horizantalMovements = {
      upRight: [],
      upLeft: [],
      downRight: [],
      downLeft: [],
    };

    this.movement.forEach((move) => {
      calcVerticalMovements(grid, currentPoint, move, verticalMovements);
      calcHorizontalMovements(grid, currentPoint, move, horizantalMovements);
    });

    filterToFinalMoves(grid, this.color, verticalMovements, availableMoves);
    filterToFinalMoves(grid, this.color, horizantalMovements, availableMoves);

    return availableMoves;
  }
}

export default Queen;
