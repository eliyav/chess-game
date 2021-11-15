import GamePiece from "./game-piece";

class Pawn extends GamePiece {
  constructor(name: string, color: string, point: Point, movement: number[]) {
    super(name, color, point, movement);
  }
}

export default Pawn;
