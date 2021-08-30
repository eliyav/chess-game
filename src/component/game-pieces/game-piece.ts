class GamePiece {
  name: string;
  color: string;
  point: number[];
  movement: number[];
  moved: boolean;

  constructor(name: string, color: string, point: number[], movement: number[]) {
    this.name = name;
    this.color = color;
    this.point = point;
    this.movement = movement;
    this.moved = false;
  }
}

export default GamePiece;
