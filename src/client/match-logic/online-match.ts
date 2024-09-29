import { Point } from "../../shared/game";
import { Lobby, LOBBY_TYPE, Player, TEAM } from "../../shared/match";
import { Message } from "../components/modals/message-modal";
import GamePiece from "../game-logic/game-piece";
import { websocket } from "../websocket-client";
import { BaseMatch, MatchLogic } from "./base-match";
import { Controller } from "./controller";
import { requestMatchReset } from "./online-events/request-match-reset";
import { requestResolveMove } from "./online-events/request-resolve-move";
import { requestUndoTurn } from "./online-events/request-undo-turn";

export class OnlineMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY_TYPE.ONLINE;
  listenerEvents: string[] = [];

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

  isCurrentPlayersPiece(piece: GamePiece) {
    return piece.team === this.getPlayerTeam();
  }

  subscribeMatchEvents({
    controller,
    setMessage,
  }: {
    controller: Controller;
    setMessage: (value: React.SetStateAction<Message | null>) => void;
  }) {
    const matchResetEvents = requestMatchReset({
      setMessage,
      controller,
    });
    const matchUndoEvents = requestUndoTurn({
      setMessage,
      controller,
    });
    const resolveMoveEvent = requestResolveMove({
      controller,
    });
    this.listenerEvents.push(
      ...matchResetEvents,
      ...matchUndoEvents,
      ...resolveMoveEvent
    );
  }

  unsubscribeMatchEvents() {
    this.listenerEvents.forEach((event) => {
      websocket.off(event as any);
    });
  }
}
