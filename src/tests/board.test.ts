import { strict as assert } from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { Board, Grid } from "../client/game-logic/board.js";
import GamePiece from "../client/game-logic/game-piece.js";
import { PIECE, Point } from "../shared/game.js";
import { TEAM } from "../shared/match.js";

describe("Board", () => {
  const size = 8;
  let grid: Grid;

  beforeEach(() => {
    grid = Board.createGrid(size);
  });

  it("should create a grid of the correct size", () => {
    assert.equal(grid.length, size);
    grid.forEach((row) => {
      assert.equal(row.length, size);
    });
  });

  it("should get the correct square name", () => {
    const A4 = Board.getSquareName({ point: [0, 3] });
    assert.equal(A4, "a4");
  });

  it("should set pieces correctly on the board", () => {
    const pieces = Board.getPieces({ grid });
    assert.ok(pieces.length > 0);
    pieces.forEach(({ piece, point }) => {
      assert.ok(piece instanceof GamePiece);
      assert.ok(point);
    });
  });

  it("should clone the grid correctly", () => {
    const clonedGrid = Board.cloneGrid({ grid });
    assert.notEqual(clonedGrid, grid);
    assert.notEqual(clonedGrid, grid);
    assert.deepEqual(clonedGrid, grid);
  });

  it("should get the correct piece", () => {
    const point: Point = [0, 0];
    const piece = Board.getPiece({ point, grid });
    if (piece) {
      assert.ok(piece instanceof GamePiece);
    } else {
      assert.equal(piece, undefined);
    }
  });

  it("should add and remove pieces correctly", () => {
    const point: Point = [0, 0];
    const piece = new GamePiece({ type: PIECE.P, team: TEAM.WHITE });
    Board.addPiece({ grid, point, piece });
    assert.equal(Board.getPiece({ grid, point }), piece);

    Board.removePiece({ grid, point });
    assert.equal(Board.getPiece({ grid, point }), undefined);
  });

  it("should return the correct direction for each team", () => {
    assert.equal(Board.getDirection(TEAM.WHITE), 1);
    assert.equal(Board.getDirection(TEAM.BLACK), -1);
  });
});
