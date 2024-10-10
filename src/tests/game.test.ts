import { strict as assert } from "node:assert";
import { describe, beforeEach, it } from "node:test";
import Game from "../client/game-logic/game";
import { GAMESTATUS } from "../shared/game";
import { TEAM } from "../shared/match";

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
});
