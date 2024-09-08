import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { LOBBY, LobbySettings, Player, Teams } from "../../../shared/match";
import { TurnHistory } from "../../helper/game-helpers";
import { Point } from "../../helper/movement-helpers";
import { findByPoint } from "../../view/scene-helpers";
import Game from "../game-logic/game";
import GamePiece from "../game-logic/game-piece";

export interface MatchLogic {
  resolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }): boolean | TurnHistory;
  isPlayersTurn(): boolean;
  getPlayerTeam(): Teams;
  nextTurn(): void;
  undoTurn(): void;
  isCurrentPlayersPiece(piece: GamePiece): boolean;
}

export class BaseMatch {
  private game: Game;
  lobby: LobbySettings;
  player: Player;

  constructor({ lobby, player }: { lobby: LobbySettings; player: Player }) {
    this.game = new Game();
    this.lobby = lobby;
    this.player = player;
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

  shouldCameraRotate() {
    return this.lobby.mode === LOBBY.ONLINE ? false : true;
  }

  getGameHistory() {
    return this.game.getHistory();
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

  setPromotion(selection: string) {
    this.game.setPromotionPiece(selection);
  }
}
