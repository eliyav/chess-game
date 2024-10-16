import { Point } from "../../shared/game";
import { Lobby, LOBBY_TYPE, Player, TEAM } from "../../shared/match";
import { Message } from "../components/modals/message-modal";
import GamePiece from "../game-logic/game-piece";
import { websocket } from "../websocket-client";
import { BaseMatch, MatchLogic } from "./base-match";
import { Controller } from "./controller";
import { createMatchEvents, getOnlineSubscribers } from "./online-events";

export class OnlineMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY_TYPE.ONLINE;

  constructor({ lobby, player }: { lobby: Lobby; player: Player }) {
    super({ lobby, player });
    this.mode = LOBBY_TYPE.ONLINE;
  }

  requestMove({
    originPoint,
    targetPoint,
    emit,
  }: {
    originPoint: Point;
    targetPoint: Point;
    emit: boolean;
  }) {
    const isValidMove = this.move({ originPoint, targetPoint });
    if (isValidMove && emit) {
      websocket.emit("resolvedMove", {
        originPoint,
        targetPoint,
        key: this.lobby.key,
      });
    }
    return isValidMove;
  }

  resetRequest() {
    websocket.emit("resetMatchRequest", { lobbyKey: this.lobby.key });
    return false;
  }

  undoTurnRequest() {
    websocket.emit("undoTurnRequest", { lobbyKey: this.lobby.key });
    return false;
  }

  isPlayersTurn() {
    const currentTeam = this.getGame().getCurrentTeam();
    const playingPlayerId = this.lobby.teams[currentTeam];
    return playingPlayerId === this.player.id;
  }

  getPlayerTeam() {
    const teams = Object.entries(this.lobby.teams);
    const team = teams.find(([, player]) => player === this.player.id);
    if (!team) return;
    return team[0] as TEAM;
  }

  isCurrentPlayersPiece(point: Point) {
    const piece = this.getGame().lookupPiece({ point });
    if (!piece) return false;
    return piece.team === this.getPlayerTeam();
  }

  getOnlineSubscribers({ controller }: { controller: Controller }) {
    const events = createMatchEvents({
      controller,
    });
    const subscribers = getOnlineSubscribers(events);
    return subscribers;
  }
}
