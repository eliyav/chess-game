import { LOBBY, LobbySettings, Player } from "../../../shared/match";
import { Point } from "../../helper/movement-helpers";
import GamePiece from "../game-logic/game-piece";
import { BaseMatch, MatchLogic } from "./base-match";

export class LocalMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY.OFFLINE;

  constructor({ lobby, player }: { lobby: LobbySettings; player: Player }) {
    super({ lobby, player });
    this.mode = LOBBY.OFFLINE;
  }

  resolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    return this.getGame().resolveMove(originPoint, targetPoint);
  }

  isValidMove({
    pickedPiece,
    selectedPiece,
  }: {
    pickedPiece: GamePiece;
    selectedPiece: GamePiece;
  }) {
    const isCurrentPlayersPiece = this.isCurrentPlayersPiece(pickedPiece);
    return this.getGame().isValidMove(
      selectedPiece,
      pickedPiece.point,
      isCurrentPlayersPiece
    );
  }

  resetRequest() {
    return true;
  }

  isPlayersTurn() {
    //Take into account AI opponent possibility
    return true;
  }

  getPlayerTeam() {
    return this.getGame().getCurrentPlayer();
  }

  isCurrentPlayersPiece(piece: GamePiece) {
    return piece.color === this.getPlayerTeam();
  }

  nextTurn() {
    return this.getGame().nextTurn();
  }

  undoTurn() {
    return this.getGame().undoTurn();
  }
}
