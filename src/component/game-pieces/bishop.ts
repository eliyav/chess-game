import GamePiece from "./game-piece";

class Bishop extends GamePiece {
  constructor(name: string, color: string, point: Point, movement: number[]) {
    super(name, color, point, movement);
  }
}

export default Bishop;
