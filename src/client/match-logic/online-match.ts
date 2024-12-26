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

  move({ from, to }: { from: Point; to: Point }) {
    const turn = this.getGame().move({
      from: from,
      to: to,
    });
    return {
      turn,
      callback: async () => {
        if (this.lobby.key) {
          websocket.emit("resolvedMove", {
            from,
            to,
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
    const playingPlayerId = this.lobby.players.find(
      (player) => player.team === currentTeam
    )?.id;
    return playingPlayerId === this.player.id;
  }

  getPlayerTeam() {
    const player = this.lobby.players.find(
      (player) => player.id === this.player.id
    );
    if (!player) return;
    return player.team;
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
