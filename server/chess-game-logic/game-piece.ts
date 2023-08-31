class GamePiece {
  name: string;
  color: string;
  point: Point;
  moved: boolean;
  moveCounter: number;
  direction: number;
  movement: number[];

  constructor(name: string, color: string, point: Point) {
    this.name = name;
    this.color = color;
    this.point = point;
    this.moved = false;
    this.movement = [1, 2, 3, 4, 5, 6, 7];
    this.moveCounter = 0;
    this.direction = this.color === "White" ? 1 : -1;
  }

  resetPieceMovement() {
    if (this.moveCounter === 1) this.moved = false;
    this.moveCounter--;
  }

  update() {
    this.moved ? null : (this.moved = true);
    this.moveCounter++;
  }

  checkPromotion() {
    if (this.name === "Pawn" && (this.point[1] === 0 || this.point[1] === 7)) {
      return true;
    }
    return false;
  }

  getSymbol() {
    switch (this.name) {
      case "King":
        return "K";
      case "Queen":
        return "Q";
      case "Knight":
        return "N";
      case "Bishop":
        return "B";
      case "Rook":
        return "R";
      default:
        return "";
    }
  }
}

export default GamePiece;
