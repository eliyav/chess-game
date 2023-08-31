import GamePiece from "./game-piece";

class Board {
  boardSize: number;
  columnNames: string[][];
  board: Square[][];

  constructor() {
    this.boardSize = 8;
    this.columnNames = [["a"], ["b"], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"]];
    this.board = [];
    this.setBoard();
  }

  public setBoard() {
    this.board = this.createBoard();
    this.setPieces();
  }

  private createBoard() {
    return Array.from({ length: this.boardSize }, (_, idx) =>
      Array.from({ length: this.boardSize }, (_, idx2) => ({
        square: this.columnNames[idx][0] + (idx2 + 1),
        on: undefined,
      }))
    );
  }

  private setPieces() {
    const startingPoints = this.getStartingPositions();
    for (let i = 0; i < startingPoints.length; i++) {
      for (let j = 0; j < startingPoints[i].length; j++) {
        const { name, color, points } = startingPoints[i][j];
        points?.forEach((point) => {
          const square = this.board[point[1]][point[0]];
          square.on = new GamePiece(name, color, point);
        });
      }
    }
  }

  private getStartingPositions(): {
    name: string;
    color: string;
    points: Point[];
  }[][] {
    const pieceNames = ["Pawn", "Rook", "Bishop", "Knight", "King", "Queen"];
    const colors = ["White", "Black"];
    return colors.map((color) => {
      return pieceNames.map((name) => {
        let points: Point[] = [];
        switch (name) {
          case "Pawn":
            points = Array.from({ length: 8 }, (_, i) => [
              i,
              color === "White" ? 1 : 6,
            ]);
            break;
          case "Rook":
            points = [
              [0, color === "White" ? 0 : 7],
              [7, color === "White" ? 0 : 7],
            ];
            break;
          case "Bishop":
            points = [
              [2, color === "White" ? 0 : 7],
              [5, color === "White" ? 0 : 7],
            ];
            break;
          case "Knight":
            points = [
              [1, color === "White" ? 0 : 7],
              [6, color === "White" ? 0 : 7],
            ];
            break;
          case "King":
            points = [[4, color === "White" ? 0 : 7]];
            break;
          case "Queen":
            points = [[3, color === "White" ? 0 : 7]];
            break;
        }
        return { name, color, points };
      });
    });
  }
}

export default Board;

export interface Square {
  square: string;
  on?: GamePiece;
}
