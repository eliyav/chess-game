import GamePiece from "./game-piece";

class Rook extends GamePiece {
  direction: number;

  constructor(name: string, color: string, point: Point, movement: number[]) {
    super(name, color, point, movement);
    this.direction = 0;
  }
}

export default Rook;
