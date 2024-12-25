import { Point } from "../../shared/game";
import { Lobby, LOBBY_TYPE, Player, TEAM } from "../../shared/match";
import { websocket } from "../websocket-client";
import { BaseMatch, MatchLogic } from "./base-match";
import { Controller } from "./controller";
import { createOnlineEvents, OnlineEvents } from "./events";

export class OnlineMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY_TYPE.ONLINE;
  events: OnlineEvents[] | undefined;

  constructor({ lobby, player }: { lobby: Lobby; player: Player }) {
    super({ lobby, player });
    this.mode = LOBBY_TYPE.ONLINE;
  }

  move({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    const move = this.getGame().move({
      origin: originPoint,
      target: targetPoint,
    });
    return {
      turnHistory: move,
      callback: async () => {
        if (move && this.lobby.key) {
          const { origin: originPoint, target: targetPoint } = move;
          websocket.emit("resolvedMove", {
            originPoint,
            targetPoint,
            key: this.lobby.key,
          });
        }
      },
    };
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

  subscribe({ controller }: { controller: Controller }) {
    this.events = createOnlineEvents({ controller });
    for (const event of this.events) {
      websocket.on(event.name, event.event);
    }
  }

  unsubscribe() {
    if (!this.events) return;
    for (const event of this.events) {
      websocket.off(event.name, event.event);
    }
  }
}
