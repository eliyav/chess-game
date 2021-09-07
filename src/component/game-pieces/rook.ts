import GamePiece from "./game-piece";
import { filterToFinalMoves, calcVerticalMovements } from "../../helper/movement-helpers";
import {Square} from "../../helper/board-helpers";
import {TurnHistory} from "../../helper/game-helpers";
import {PieceInstance, Move} from "./bishop"
import {State} from "../../data/chess-data-import";

class Rook extends GamePiece implements PieceInstance {
  constructor(name: string, color: string, point: [number, number], movement: number[]) {
    super(name, color, point, movement);
  }

  calculateAvailableMoves(grid: Square[][], state:State, turnHistory: TurnHistory, boolean: boolean, currentPoint = this.point) {
    const availableMoves: Move[] = [];
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
