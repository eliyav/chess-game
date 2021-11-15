import GamePiece from "./game-piece";

class Queen extends GamePiece {
  constructor(name: string, color: string, point: Point, movement: number[]) {
    super(name, color, point, movement);
  }
}

export default Queen;
