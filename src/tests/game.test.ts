import { strict as assert } from "node:assert";
import { describe, beforeEach, it } from "node:test";
import Game from "../client/game-logic/game";
import { GAMESTATUS, PIECE } from "../shared/game";
import { TEAM } from "../shared/match";
import { doPointsMatch } from "../client/game-logic/moves";

describe("Game Class", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  it("should initialize the game correctly", () => {
    const gameState = game.getState();
    assert.equal(gameState.status, GAMESTATUS.INPROGRESS);
    assert.equal(gameState.turns.length, 0);
    assert.equal(gameState.annotations.length, 0);
  });

  it("should return the correct current team", () => {
    assert.equal(game.getCurrentTeam(), TEAM.WHITE);
  });

  it("should move a piece correctly", () => {
    const move = game.move({ from: [0, 1], to: [0, 3] });
    assert.ok(move);
    assert.equal(game.getCurrentTeam(), TEAM.BLACK);
  });

  it("should detect checkmate", () => {
    game.move({ from: [6, 1], to: [6, 3] }); // g4
    game.move({ from: [4, 6], to: [4, 4] }); // e5
    game.move({ from: [5, 1], to: [5, 2] }); // f3
    game.move({ from: [3, 7], to: [7, 3] }); // Qh4#
    const gameState = game.getState();
    assert.equal(gameState.status, GAMESTATUS.CHECKMATE);
  });

  it("should get best move", () => {
    const gameState = game.getState();
    assert.equal(gameState.status, GAMESTATUS.INPROGRESS);
    assert.equal(gameState.turns.length, 0);
    assert.equal(gameState.annotations.length, 0);

    const move = game.getBestMove({ maximizingPlayer: true, depth: 3 });
    assert.ok(move);
  });

  it("should have king side castling available", () => {
    game.move({ from: [6, 0], to: [5, 2] });
    game.move({ from: [4, 6], to: [4, 5] });
    game.move({ from: [4, 1], to: [4, 2] });
    game.move({ from: [5, 6], to: [5, 5] });
    game.move({ from: [5, 0], to: [4, 1] });
    game.move({ from: [6, 6], to: [6, 5] });
    const pieces = game.getAllPieces();
    const king = pieces.find(
      ({ piece }) => piece?.type === PIECE.K && piece.team === TEAM.WHITE
    );
    const kingMoves = game.getMoves({ point: king!.point });
    assert.ok(kingMoves.some((move) => move.type === "castle"));
    assert.ok(kingMoves.some((move) => doPointsMatch(move.to, [7, 0])));
  });

  it("should not have king side castling", () => {
    game.move({ from: [6, 0], to: [5, 2] });
    game.move({ from: [4, 6], to: [4, 5] });
    game.move({ from: [4, 1], to: [4, 2] });
    game.move({ from: [5, 6], to: [5, 5] });
    game.move({ from: [5, 0], to: [4, 1] });
    game.move({ from: [6, 6], to: [6, 5] });
    game.move({ from: [7, 1], to: [7, 2] });
    game.move({ from: [7, 6], to: [7, 5] });
    game.move({ from: [7, 0], to: [7, 1] });
    game.move({ from: [1, 6], to: [1, 5] });
    game.move({ from: [7, 1], to: [7, 0] });
    game.move({ from: [2, 6], to: [2, 5] });
    const pieces = game.getAllPieces();
    const king = pieces.find(
      ({ piece }) => piece?.type === PIECE.K && piece.team === TEAM.WHITE
    );
    const kingMoves = game.getMoves({ point: king!.point });
    assert.ok(!kingMoves.some((move) => move.type === "castle"));
  });

  it("should have queen side castling available", () => {
    game.move({ from: [1, 0], to: [0, 2] });
    game.move({ from: [4, 6], to: [4, 5] });
    game.move({ from: [1, 1], to: [1, 2] });
    game.move({ from: [5, 6], to: [5, 5] });
    game.move({ from: [2, 0], to: [1, 1] });
    game.move({ from: [6, 6], to: [6, 5] });
    game.move({ from: [2, 1], to: [2, 2] });
    game.move({ from: [7, 6], to: [7, 5] });
    game.move({ from: [3, 0], to: [2, 1] });
    const pieces = game.getAllPieces();
    const king = pieces.find(
      ({ piece }) => piece?.type === PIECE.K && piece.team === TEAM.WHITE
    );
    const kingMoves = game.getMoves({ point: king!.point });
    assert.ok(kingMoves.some((move) => move.type === "castle"));
    assert.ok(kingMoves.some((move) => doPointsMatch(move.to, [0, 0])));
  });
});
