import { Point } from "../../shared/game";
import chessData from "./chess-data-import";
import GamePiece from "../../shared/game-piece";

export type Grid = {
  name: string;
}[][];

class Board {
  initialPositions: typeof chessData.initialPositions;
  boardSize: number;
  columnNames: string[];
  grid: Grid;
  private pieces: GamePiece[];

  constructor() {
    this.initialPositions = chessData.initialPositions;
    this.boardSize = chessData.boardSize;
    this.columnNames = chessData.columnNames;
    this.grid = this.createGrid();
    this.pieces = [];
    this.setPieces();
  }

  setPieces() {
    this.initialPositions.forEach((positions) => {
      const { type } = positions;
      positions.teams.forEach((team) => {
        team.startingPoints.forEach((point) => {
          this.addPiece(new GamePiece({ type, team: team.name, point }));
        });
      });
    });
  }

  createGrid() {
    return Array.from({ length: this.boardSize }, (_, idx) =>
      Array.from({ length: this.boardSize }, (_, idx2) => ({
        name: this.columnNames[idx] + (idx2 + 1),
      }))
    );
  }

  getSquare(point: Point) {
    return this.grid[point[0]][point[1]];
  }

  addPiece(piece: GamePiece) {
    this.pieces.push(piece);
  }

  getPieces() {
    return this.pieces;
  }

  getPieceByPoint(point: Point) {
    return this.pieces.find(
      (piece) => piece.point[0] === point[0] && piece.point[1] === point[1]
    );
  }

  removePieceByPoint(point: Point) {
    this.pieces = this.pieces.filter(
      (piece) => piece.point[0] !== point[0] || piece.point[1] !== point[1]
    );
  }

  resetBoard() {
    this.pieces = [];
    this.setPieces();
  }
}

export default Board;
