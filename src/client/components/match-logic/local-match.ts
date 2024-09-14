import { LOBBY_TYPE, Lobby, Player } from "../../../shared/match";
import { Point } from "../../helper/movement-helpers";
import GamePiece from "../game-logic/game-piece";
import { BaseMatch, MatchLogic } from "./base-match";

export class LocalMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY_TYPE.LOCAL;

  constructor({ lobby, player }: { lobby: Lobby; player: Player }) {
    super({ lobby, player });
    this.mode = LOBBY_TYPE.LOCAL;
  }

  requestResolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    return this.resolveMove({ originPoint, targetPoint });
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

  undoTurnRequest() {
    return this.getGame().undoTurn();
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
}
