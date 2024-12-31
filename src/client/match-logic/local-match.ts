import { Point, Turn } from "../../shared/game";
import { Lobby, LOBBY_TYPE, Player, TEAM } from "../../shared/match";
import { GAME_WORKER_URL } from "../constants";
import { BaseMatch, MatchLogic } from "./base-match";
import { Controller } from "./controller";
import { createLocalEvents, LocalEvents } from "./events";

export class LocalMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY_TYPE.LOCAL;
  vsComputer: { maximizingPlayer: boolean; depth: number } | undefined;
  worker: Worker | undefined;
  events: LocalEvents[] | undefined;

  constructor({
    lobby,
    player,
    onTimeEnd,
    onTimeUpdate,
  }: {
    lobby: Lobby;
    player: Player;
    onTimeUpdate: () => void;
    onTimeEnd: () => void;
  }) {
    super({ lobby, player, onTimeUpdate, onTimeEnd });
    this.mode = LOBBY_TYPE.LOCAL;
    const isComputer = lobby.players.find(
      (player) => player.type === "computer"
    );
    this.vsComputer = !!isComputer
      ? {
          maximizingPlayer: isComputer.team === TEAM.WHITE ? true : false,
          depth: lobby.depth || 3,
        }
      : undefined;
  }

  move({ from, to }: { from: Point; to: Point }): {
    turn: Turn | undefined;
    callback: () => void;
  } {
    const turn = this.getGame().move({
      from: from,
      to: to,
    });
    this.timer?.switchPlayer();
    return {
      turn,
      callback: () => {
        if (this.vsComputer && this.worker) {
          this.worker.postMessage({
            type: "move",
            data: {
              from: from,
              to: to,
              maximizingPlayer: this.vsComputer.maximizingPlayer,
              depth: this.vsComputer.depth,
            },
          });
        }
      },
    };
  }

  resetRequest() {
    if (this.vsComputer && this.worker) {
      this.worker.postMessage({ type: "reset", data: this.vsComputer });
    }
    return true;
  }

  undoTurnRequest() {
    if (!this.isPlayersTurn()) return false;
    return true;
  }

  undoTurn() {
    if (!this.isPlayersTurn()) return false;
    if (this.vsComputer) {
      if (!this.worker) return false;
      for (let i = 0; i < 2; i++) {
        this.getGame().undoTurn();
        this.worker.postMessage({ type: "undo", data: this.vsComputer });
      }
      if (this.vsComputer.maximizingPlayer && !this.isPlayersTurn()) {
        this.worker.postMessage({
          type: "request-move",
          data: this.vsComputer,
        });
      }
    } else {
      this.getGame().undoTurn();
    }
    return true;
  }

  subscribe({ controller }: { controller: Controller }) {
    const events = createLocalEvents({ controller });
    this.events = events;
    if (this.vsComputer) {
      const worker = new Worker(new URL(GAME_WORKER_URL, import.meta.url));
      for (const event of this.events) {
        worker.onmessage = event.event;
      }
      worker.postMessage({
        type: "start",
        data: this.vsComputer,
      });
      this.worker = worker;
    }
  }

  unsubscribe() {
    if (!this.worker) return;
    this.worker.terminate();
  }
}
