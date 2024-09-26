import { Point } from "../../shared/game";
import { Lobby, LOBBY_TYPE, Player, TEAM } from "../../shared/match";
import { Message } from "../components/modals/message-modal";
import GamePiece from "../../shared/game-piece";
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

  requestResolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    const isValidMove = this.resolveMove({ originPoint, targetPoint });
    if (isValidMove) {
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

  isPlayersTurn() {
    const currentTeam = this.getGame().getTeam();
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

  nextTurn() {
    return this.getGame().nextTurn();
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
