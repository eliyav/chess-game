import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { GAMESTATUS, Point, TurnHistory } from "../../shared/game";
import GamePiece from "../game-logic/game-piece";
import { Lobby, Player, TEAM } from "../../shared/match";
import Game from "../game-logic/game";
import { getPointFromPosition } from "../scenes/scene-helpers";

export interface MatchLogic {
  requestMove({
    originPoint,
    targetPoint,
    emit,
  }: {
    originPoint: Point;
    targetPoint: Point;
    emit: boolean;
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
    return this.getGame().move({ origin: originPoint, target: targetPoint });
  }

  getMoves(piece: GamePiece, point: Point) {
    return this.game.getMoves({ piece, point });
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
    return this.game.getGameState().status === GAMESTATUS.CHECKMATE;
  }

  getWinner() {
    return this.game.getCurrentTeamsOpponent();
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

  getMeshGamePoint(pickedMesh: AbstractMesh, externalMesh: boolean) {
    return getPointFromPosition({
      position: [pickedMesh.position.z, pickedMesh.position.x],
      externalMesh,
    });
  }

  lookupGamePiece(pickedMesh: AbstractMesh, externalMesh: boolean) {
    return this.game.lookupPiece({
      point: getPointFromPosition({
        position: [pickedMesh.position.z, pickedMesh.position.x],
        externalMesh,
      }),
    });
  }
}
