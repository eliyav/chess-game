import GamePiece from "./game-piece";
import { calcPawnMovement } from "../../helper/movement-helpers.js";
import { isEnPassantAvailable, doMovesMatch } from "../../helper/game-helpers";

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

type EnPassant = number | undefined

type Move = string | EnPassant[];

class Pawn extends GamePiece {
  direction: number;

  constructor(name: string, color: string, point: number [], movement: number[]) {
    super(name, color, point, movement);
    this.direction = this.color === "White" ? 1 : -1;
  }

  calculateAvailableMoves(grid: Square[][], state: State, turnHistory: TurnHistory, boolean: boolean, currentPoint = this.point) {
    const availableMoves: Move[][] = [];

    calcPawnMovement(grid, currentPoint, this.direction, this.moved, this.color, availableMoves);

    if (boolean) {
      let result;
      if (turnHistory !== undefined) {
        result = isEnPassantAvailable(turnHistory);
        if (result.result) {
          const targetSquare = result.enPassantSquare;
          if (availableMoves.length !== 0) {
            const [x, y] = currentPoint;
            const direction = this.color === "White" ? 1 : -1;
            const x1 = x - 1;
            const x2 = x + 1;
            const newY = y + direction;
            const potential1 = [x1, newY];
            const potential2 = [x2, newY];
            if (doMovesMatch(potential1, targetSquare) || doMovesMatch(potential2, targetSquare)) {
              availableMoves.push([targetSquare, "enPassant"]);
            }
          }
        }
      }
    }
    return availableMoves;
  }
}

export default Pawn;
