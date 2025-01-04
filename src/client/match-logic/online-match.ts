import { PIECE, Point, Turn } from "../../shared/game";
import { Lobby } from "../../shared/lobby";
import { MATCH_TYPE, Player } from "../../shared/match";
import { websocket } from "../websocket-client";
import { BaseMatch, MatchLogic } from "./base-match";
import { Controller } from "./controller";
import { createOnlineEvents, OnlineEvents } from "./events";

export class OnlineMatch extends BaseMatch implements MatchLogic {
  mode: MATCH_TYPE.ONLINE;
  events: OnlineEvents[] | undefined;
  onPromotion: (resolve: (piece: PIECE) => void) => void;

  constructor({
    lobby,
    player,
    onTimeEnd,
    onTimeUpdate,
    onPromotion,
  }: {
    lobby: Lobby;
    player: Player;
    onTimeUpdate: () => void;
    onTimeEnd: () => void;
    onPromotion: (resolve: (piece: PIECE) => void) => void;
  }) {
    super({ lobby, player, onTimeEnd, onTimeUpdate });
    this.mode = MATCH_TYPE.ONLINE;
    this.onPromotion = onPromotion;
  }

  async move({ from, to }: { from: Point; to: Point }): Promise<{
    turn: Turn | undefined;
    callback: () => void;
  }> {
    const turn = await this.getGame().move({
      from: from,
      to: to,
      onPromotion: this.onPromotion,
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

  subscribe({ controller }: { controller: Controller }) {
    const events = createOnlineEvents({ controller });
    this.events = events;
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
