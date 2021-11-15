class GamePiece {
  name: string;
  color: string;
  point: Point;
  movement: number[];
  moved: boolean;
  moveCounter: number;
  direction: number;

  constructor(name: string, color: string, point: Point, movement: number[]) {
    this.name = name;
    this.color = color;
    this.point = point;
    this.movement = movement;
    this.moved = false;
    this.moveCounter = 0;
    this.direction = this.color === "White" ? 1 : -1;
  }
}

export type Move = [Point, string];

export default GamePiece;
