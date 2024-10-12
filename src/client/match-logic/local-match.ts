import { Point, TurnHistory } from "../../shared/game";
import { LOBBY_TYPE, Lobby, Player } from "../../shared/match";
import GamePiece from "../game-logic/game-piece";
import { BaseMatch, MatchLogic } from "./base-match";

export class LocalMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY_TYPE.LOCAL;

  constructor({ lobby, player }: { lobby: Lobby; player: Player }) {
    super({ lobby, player });
    this.mode = LOBBY_TYPE.LOCAL;
  }

  requestMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    return this.move({ originPoint, targetPoint });
  }

  requestAiMove() {
    return this.getGame().handleAIMove({ depth: 3 });
  }

  resetRequest() {
    return true;
  }

  undoTurnRequest() {
    return true;
  }

  isPlayersTurn() {
    const currentTeam = this.getGame().getCurrentTeam();
    const playingPlayerId = this.lobby.teams[currentTeam];
    const playerType = this.lobby.players.find(
      (player) => player.id === playingPlayerId
    )?.type;
    return playerType === "Human";
  }

  getPlayerTeam() {
    return this.getGame().getCurrentTeam();
  }

  isCurrentPlayersPiece(piece: GamePiece) {
    return piece.team === this.getPlayerTeam();
  }

  postTurnEvents({
    handleValidTurn,
  }: {
    handleValidTurn: ({ turnHistory }: { turnHistory: TurnHistory }) => void;
  }) {
    if (!this.isPlayersTurn()) {
      const turnHistory = this.requestAiMove();
      if (turnHistory) {
        handleValidTurn({ turnHistory });
      }
    }
  }
}
