import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Point, TurnHistory } from "../../shared/game";
import GamePiece from "../../shared/game-piece";
import { Lobby, Player, TEAM } from "../../shared/match";
import Game from "../game-logic/game";
import { findByPoint } from "../scenes/scene-helpers";

export interface MatchLogic {
  requestMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }): TurnHistory | undefined;
  isPlayersTurn(): boolean;
  getPlayerTeam(): TEAM | undefined;
  isCurrentPlayersPiece(piece: GamePiece): boolean;
  resetRequest(): boolean;
  undoTurnRequest(): boolean;
}

export class BaseMatch {
  private game: Game;
  lobby: Lobby;
  player: Player;

  constructor({ lobby, player }: { lobby: Lobby; player: Player }) {
    this.game = new Game();
    this.lobby = lobby;
    this.player = player;
  }

  move({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    return this.getGame().move(originPoint, targetPoint);
  }

  isMove({
    pickedPiece,
    selectedPiece,
  }: {
    pickedPiece: GamePiece;
    selectedPiece: GamePiece;
  }) {
    return this.game.isMove(selectedPiece, pickedPiece.point);
  }

  getMoves(piece: GamePiece) {
    return this.game.getResolvableMoves({ piece });
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
    return this.game.getOpponentTeam();
  }

  getGameHistory() {
    return this.game.getHistory();
  }

  getAllGamePieces() {
    return this.game.getAllPieces();
  }

  undoTurn() {
    return this.game.undoTurn();
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
