class GamePiece {
  name: string;
  color: string;
  point: Point;
  movement: number[];
  moved: boolean;

  constructor(name: string, color: string, point: Point, movement: number[]) {
    this.name = name;
    this.color = color;
    this.point = point;
    this.movement = movement;
    this.moved = false;
  }
}

export default GamePiece;
