import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Teams } from "../../../shared/match";
import { findByPoint } from "../../view/scene-helpers";
import Game from "../game-logic/game";
import GamePiece, { Move } from "../game-logic/game-piece";
import { TurnHistory } from "../../helper/game-helpers";
import { Square } from "../game-logic/board";
import { Point } from "../../helper/movement-helpers";

interface MatchLogic {
  isPlayersTurn(): boolean;
  getPlayerTeam(): Teams;
  shouldCameraRotate(): boolean;
  resolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }): boolean | TurnHistory;
  nextTurn(): void;
  undoTurn(): void;
  reset(): void;
  saveGame(): void;
  loadGame(): void;
  getGame(): Game;
  isGameOver(): boolean;
  getWinner(): Teams;
  getGameHistory(): TurnHistory[];
  isCurrentPlayersPiece(piece: GamePiece): boolean;
  setPromotion(selection: string): void;
  getAllGamePieces(): Square[];
  getValidMoves(gamePiece: GamePiece): Move[];
  lookupGamePiece(
    pickedMesh: AbstractMesh,
    externalMesh: boolean
  ): GamePiece | undefined;
}

export class BaseMatch implements MatchLogic {
  game: Game;

  constructor() {
    this.game = new Game();
  }

  resolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    return this.game.resolveMove(originPoint, targetPoint);
  }

  nextTurn() {
    return this.game.nextTurn();
  }

  undoTurn() {
    return this.game.undoTurn();
  }

  reset() {
    this.game.resetGame();
  }

  saveGame() {
    //Save game state to database
  }

  loadGame() {
    //Load game state from database
  }

  getGame() {
    return this.game;
  }

  isGameOver() {
    return this.game.isCheckmate();
  }

  getWinner() {
    return this.game.getWinner();
  }

  getGameHistory() {
    return this.game.getHistory();
  }

  isPlayersTurn() {
    return true;
  }

  getPlayerTeam() {
    return this.game.getCurrentPlayer();
  }

  shouldCameraRotate() {
    return true;
  }

  isCurrentPlayersPiece(piece: GamePiece) {
    return piece.color === this.getPlayerTeam();
  }

  setPromotion(selection: string) {
    this.game.setPromotionPiece(selection);
  }

  getAllGamePieces() {
    return this.game.allPieces();
  }

  getValidMoves(gamePiece: GamePiece) {
    return this.game.getValidMoves(gamePiece);
  }

  lookupGamePiece(pickedMesh: AbstractMesh, externalMesh: boolean) {
    return this.game.lookupPiece(
      findByPoint({
        get: "index",
        point: [pickedMesh.position.z, pickedMesh.position.x],
        externalMesh,
      })
    );
  }
}
