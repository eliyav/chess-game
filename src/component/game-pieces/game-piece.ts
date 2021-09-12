class GamePiece {
  name: string;
  color: string;
  point: Point;
  movement: number[];
  moved: boolean;
  moveCounter: number;

  constructor(name: string, color: string, point: Point, movement: number[]) {
    this.name = name;
    this.color = color;
    this.point = point;
    this.movement = movement;
    this.moved = false;
    this.moveCounter = 0;
  }
}

export default GamePiece;
