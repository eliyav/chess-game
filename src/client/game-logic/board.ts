import { Point } from "../../shared/game";
import chessData from "./chess-data-import";
import GamePiece from "../../shared/game-piece";

export type Grid = {
  name: string;
  on?: GamePiece;
}[][];

class Board {
  initialPositions: typeof chessData.initialPositions;
  boardSize: number;
  columnNames: string[];
  grid: Grid;

  constructor() {
    this.initialPositions = chessData.initialPositions;
    this.boardSize = chessData.boardSize;
    this.columnNames = chessData.columnNames;
    this.grid = this.createGrid();
    this.setPieces();
  }

  // populateGrid() {
  //   const grid = this.createGrid();
  //   this.pieces.forEach((piece) => {
  //     const {
  //       point: [x, y],
  //     } = piece;
  //     grid[x][y].on = piece;
  //   });
  //   return grid;
  // }

  setPieces() {
    this.initialPositions.forEach((positions) => {
      const { type } = positions;
      positions.teams.forEach((team) => {
        team.startingPoints.forEach((point) => {
          this.addPiece({
            point: point,
            piece: new GamePiece({ type, team: team.name }),
          });
        });
      });
    });
  }

  createGrid(): Grid {
    return Array.from({ length: this.boardSize }, (_, idx) =>
      Array.from({ length: this.boardSize }, (_, idx2) => ({
        name: this.columnNames[idx] + (idx2 + 1),
      }))
    );
  }

  getSquare([x, y]: Point) {
    return this.grid[x][y];
  }

  getPiece(point: Point) {
    return this.getSquare(point).on;
  }

  getPieces() {
    return this.grid
      .flatMap((row, x) =>
        row.map((square, y) => ({
          piece: square.on,
          point: [x, y] as Point,
        }))
      )
      .filter(({ piece }) => piece !== undefined);
  }

  removePiece(point: Point) {
    const square = this.getSquare(point);
    square.on = undefined;
  }

  addPiece({ point, piece }: { point: Point; piece: GamePiece }) {
    const square = this.getSquare(point);
    square.on = piece;
  }

  getPieceOnSquares({ origin, target }: { origin: Point; target: Point }) {
    return {
      originPiece: this.getSquare(origin).on,
      targetPiece: this.getSquare(target).on,
    };
  }

  movePiece({
    origin,
    target,
    shouldSwitch,
  }: {
    origin: Point;
    target: Point;
    shouldSwitch?: boolean;
  }) {
    const originSquare = this.getSquare(origin);
    const targetSquare = this.getSquare(target);
    targetSquare.on = originSquare.on;
    if (shouldSwitch) {
      originSquare.on = targetSquare.on;
    } else {
      originSquare.on = undefined;
    }
  }

  unmovePiece({
    origin,
    target,
    originPiece,
    targetPiece,
  }: {
    origin: Point;
    target: Point;
    originPiece: GamePiece;
    targetPiece?: GamePiece;
  }) {
    this.addPiece({ point: origin, piece: originPiece });
    if (targetPiece) {
      if (targetPiece) {
        this.addPiece({ point: target, piece: targetPiece });
      }
    }
  }

  resetBoard() {
    this.grid = this.createGrid();
    this.setPieces();
  }
}

export default Board;
