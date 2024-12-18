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
    const gameState = game.getGameState();
    assert.equal(gameState.status, GAMESTATUS.INPROGRESS);
    assert.equal(gameState.turnHistory.length, 0);
    assert.equal(gameState.annotations.length, 0);
  });

  it("should return the correct current team", () => {
    assert.equal(game.getCurrentTeam(), TEAM.WHITE);
  });

  it("should move a piece correctly", () => {
    const move = game.move({ origin: [0, 1], target: [0, 3] });
    assert.ok(move);
    assert.equal(game.getCurrentTeam(), TEAM.BLACK);
  });

  it("should detect checkmate", () => {
    game.move({ origin: [6, 1], target: [6, 3] }); // g4
    game.move({ origin: [4, 6], target: [4, 4] }); // e5
    game.move({ origin: [5, 1], target: [5, 2] }); // f3
    game.move({ origin: [3, 7], target: [7, 3] }); // Qh4#
    const gameState = game.getGameState();
    assert.equal(gameState.status, GAMESTATUS.CHECKMATE);
  });

  it("should have king side castling available", () => {
    game.move({ origin: [6, 0], target: [5, 2] });
    game.move({ origin: [4, 6], target: [4, 5] });
    game.move({ origin: [4, 1], target: [4, 2] });
    game.move({ origin: [5, 6], target: [5, 5] });
    game.move({ origin: [5, 0], target: [4, 1] });
    game.move({ origin: [6, 6], target: [6, 5] });
    const pieces = game.getAllPieces();
    const king = pieces.find(
      ({ piece }) => piece?.type === PIECE.K && piece.team === TEAM.WHITE
    );
    const kingMoves = game.getMoves({ point: king!.point });
    assert.ok(kingMoves.some((move) => move[1] === "castle"));
    assert.ok(kingMoves.some((move) => doPointsMatch(move[0], [7, 0])));
  });

  it("should not have king side castling", () => {
    game.move({ origin: [6, 0], target: [5, 2] });
    game.move({ origin: [4, 6], target: [4, 5] });
    game.move({ origin: [4, 1], target: [4, 2] });
    game.move({ origin: [5, 6], target: [5, 5] });
    game.move({ origin: [5, 0], target: [4, 1] });
    game.move({ origin: [6, 6], target: [6, 5] });
    game.move({ origin: [7, 1], target: [7, 2] });
    game.move({ origin: [7, 6], target: [7, 5] });
    game.move({ origin: [7, 0], target: [7, 1] });
    game.move({ origin: [1, 6], target: [1, 5] });
    game.move({ origin: [7, 1], target: [7, 0] });
    game.move({ origin: [2, 6], target: [2, 5] });
    const pieces = game.getAllPieces();
    const king = pieces.find(
      ({ piece }) => piece?.type === PIECE.K && piece.team === TEAM.WHITE
    );
    const kingMoves = game.getMoves({ point: king!.point });
    assert.ok(!kingMoves.some((move) => move[1] === "castle"));
  });

  it("should have queen side castling available", () => {
    game.move({ origin: [1, 0], target: [0, 2] });
    game.move({ origin: [4, 6], target: [4, 5] });
    game.move({ origin: [1, 1], target: [1, 2] });
    game.move({ origin: [5, 6], target: [5, 5] });
    game.move({ origin: [2, 0], target: [1, 1] });
    game.move({ origin: [6, 6], target: [6, 5] });
    game.move({ origin: [2, 1], target: [2, 2] });
    game.move({ origin: [7, 6], target: [7, 5] });
    game.move({ origin: [3, 0], target: [2, 1] });
    const pieces = game.getAllPieces();
    const king = pieces.find(
      ({ piece }) => piece?.type === PIECE.K && piece.team === TEAM.WHITE
    );
    const kingMoves = game.getMoves({ point: king!.point });
    assert.ok(kingMoves.some((move) => move[1] === "castle"));
    assert.ok(kingMoves.some((move) => doPointsMatch(move[0], [0, 0])));
  });
});
