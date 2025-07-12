import { Point } from "../../shared/game";
import { TEAM } from "../../shared/match";
import chessData from "./chess-data-import";
import GamePiece from "./game-piece";

export type Grid = (GamePiece | undefined)[][];

export class Board {
  static cloneGrid({ grid }: { grid: Grid }) {
    const clone = grid.map((row) => row.map((square) => square));
    return clone;
  }

  static setPieces({
    grid,
    initialPositions = chessData.initialPositions,
  }: {
    grid: Grid;
    initialPositions?: typeof chessData.initialPositions;
  }) {
    initialPositions.forEach((positions) => {
      const { type } = positions;
      positions.teams.forEach((team) => {
        team.startingPoints.forEach((point) => {
          this.addPiece({
            grid,
            point,
            piece: new GamePiece({
              type,
              team: team.name,
            }),
          });
        });
      });
    });
  }

  static createGrid(
    boardSize = chessData.boardSize,
    initialPositions?: typeof chessData.initialPositions
  ): Grid {
    const grid = Array.from({ length: boardSize }, () =>
      Array.from({ length: boardSize }, () => undefined)
    );
    this.setPieces({ grid, initialPositions });
    return grid;
  }

  static getPiece({ grid, point }: { grid: Grid; point: Point }) {
    const [x, y] = point;
    return grid[x][y];
  }

  static getPieces({ grid, team }: { grid: Grid; team?: TEAM }) {
    const pieces = grid
      .flatMap((row, x) =>
        row.map((piece, y) => ({
          piece,
          point: [x, y] as Point,
        }))
      )
      .filter(({ piece }) => piece !== undefined);

    if (!team) return pieces;
    return pieces.filter(({ piece }) => piece?.team === team);
  }

  static removePiece({ grid, point }: { grid: Grid; point: Point }) {
    const [x, y] = point;
    grid[x][y] = undefined;
  }

  static addPiece({
    grid,
    point,
    piece,
  }: {
    grid: Grid;
    point: Point;
    piece: GamePiece;
  }) {
    const [x, y] = point;
    grid[x][y] = piece;
  }

  static getDirection(team: TEAM) {
    return team === TEAM.WHITE ? 1 : -1;
  }

  static getSquareName({ point }: { point: Point }) {
    const [x, y] = point;
    return `${String.fromCharCode(65 + x)}${7 - y}`.toLowerCase();
  }
}
