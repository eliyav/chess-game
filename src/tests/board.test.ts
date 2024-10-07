import { strict as assert } from "node:assert";
import { describe, beforeEach, it } from "node:test";
import Board from "../client/game-logic/board.js";
import GamePiece from "../client/game-logic/game-piece.js";
import { PIECE, Point } from "../shared/game.js";
import { TEAM } from "../shared/match.js";
import chessData from "../client/game-logic/chess-data-import.js";

describe("Board", () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it("should initialize with correct initial positions", () => {
    assert.deepEqual(board.initialPositions, chessData.initialPositions);
    assert.equal(board.boardSize, chessData.boardSize);
    assert.deepEqual(board.columnNames, chessData.columnNames);
  });

  it("should create a grid of the correct size", () => {
    assert.equal(board.grid.length, board.boardSize);
    board.grid.forEach((row) => {
      assert.equal(row.length, board.boardSize);
    });
  });

  it("should set pieces correctly on the board", () => {
    const pieces = board.getPieces();
    assert.ok(pieces.length > 0);
    pieces.forEach(({ piece, point }) => {
      assert.ok(piece instanceof GamePiece);
      assert.ok(point);
    });
  });

  it("should clone the board correctly", () => {
    const clonedBoard = board.cloneBoard();
    assert.notEqual(clonedBoard, board);
    assert.notEqual(clonedBoard.grid, board.grid);
    assert.deepEqual(clonedBoard.grid, board.grid);
  });

  it("should get the correct square", () => {
    const point: Point = [0, 0];
    const square = board.getSquare(point);
    assert.ok(square);
    assert.equal(square.name, board.columnNames[0] + "1");
  });

  it("should get the correct piece", () => {
    const point: Point = [0, 0];
    const piece = board.getPiece(point);
    if (piece) {
      assert.ok(piece instanceof GamePiece);
    } else {
      assert.equal(piece, undefined);
    }
  });

  it("should add and remove pieces correctly", () => {
    const point: Point = [0, 0];
    const piece = new GamePiece({ type: PIECE.P, team: TEAM.WHITE });
    board.addPiece({ point, piece });
    assert.equal(board.getPiece(point), piece);

    board.removePiece({ point });
    assert.equal(board.getPiece(point), undefined);
  });

  it("should return the correct direction for each team", () => {
    assert.equal(board.getDirection(TEAM.WHITE), 1);
    assert.equal(board.getDirection(TEAM.BLACK), -1);
  });

  it("should reset the board correctly", () => {
    board.resetBoard();
    const pieces = board.getPieces();
    assert.ok(pieces.length > 0);
    pieces.forEach(({ piece, point }) => {
      assert.ok(piece instanceof GamePiece);
      assert.ok(point);
    });
  });
});
