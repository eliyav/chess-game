import { Point } from "../../shared/game";
import { Lobby, LOBBY_TYPE, Player } from "../../shared/match";
import { GAME_WORKER_URL } from "../scripts/constants";
import { BaseMatch, MatchLogic } from "./base-match";
import { Controller } from "./controller";
import { createLocalEvents, LocalEvents } from "./events";

export class LocalMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY_TYPE.LOCAL;
  vsComputer: { maximizingPlayer: boolean; depth: number } | undefined;
  worker: Worker | undefined;
  events: LocalEvents[] | undefined;

  constructor({ lobby, player }: { lobby: Lobby; player: Player }) {
    super({ lobby, player });
    this.mode = LOBBY_TYPE.LOCAL;
    const isComputer = lobby.players.find(
      (player) => player.type === "Computer"
    );
    this.vsComputer = !!isComputer
      ? { maximizingPlayer: lobby.teams.White === isComputer.id, depth: 3 }
      : undefined;
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
    const move = this.move({ originPoint, targetPoint });
    if (emit && this.vsComputer && this.worker && move) {
      this.worker.postMessage({
        type: "move",
        data: {
          origin: move.origin,
          target: move.target,
          maximizingPlayer: this.vsComputer.maximizingPlayer,
          depth: this.vsComputer.depth,
        },
      });
    }
    return move;
  }

  resetRequest() {
    if (this.vsComputer) {
      this.worker?.postMessage({ type: "reset" });
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
        this.worker.postMessage({ type: "undo" });
        this.getGame().undoTurn();
      }
    } else {
      this.getGame().undoTurn();
    }
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

  isCurrentPlayersPiece(point: Point) {
    const piece = this.getGame().lookupPiece({ point });
    if (!piece) return false;
    return piece.team === this.getPlayerTeam();
  }

  subscribe({ controller }: { controller: Controller }) {
    this.events = createLocalEvents({ controller });
    if (this.vsComputer) {
      const worker = new Worker(new URL(GAME_WORKER_URL, import.meta.url));
      for (const event of this.events) {
        worker.onmessage = event.event;
      }
      worker.postMessage({
        type: "start",
      });
      if (this.vsComputer.maximizingPlayer) {
        worker.postMessage({
          type: "request-move",
          data: this.vsComputer,
        });
      }
      this.worker = worker;
    }
  }

  unsubscribe() {
    if (!this.worker) return;
    this.worker.terminate();
  }
}
