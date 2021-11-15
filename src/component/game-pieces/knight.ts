import GamePiece from "./game-piece";

class Knight extends GamePiece {
  constructor(name: string, color: string, point: Point, movement: number[]) {
    super(name, color, point, movement);
  }
}

export default Knight;
