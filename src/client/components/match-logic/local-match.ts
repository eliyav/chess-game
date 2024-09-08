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
    return this.game.resolveMove(originPoint, targetPoint);
  }

  isPlayersTurn() {
    //Take into account AI opponent possibility
    return true;
  }

  getPlayerTeam() {
    return this.game.getCurrentPlayer();
  }

  isCurrentPlayersPiece(piece: GamePiece) {
    return piece.color === this.getPlayerTeam();
  }

  nextTurn() {
    return this.game.nextTurn();
  }

  undoTurn() {
    return this.game.undoTurn();
  }
}
