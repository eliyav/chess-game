import { Socket } from "socket.io-client";
import { LOBBY_TYPE, Lobby, Player, TEAM } from "../../../shared/match";
import { Point } from "../../helper/movement-helpers";
import GamePiece from "../game-logic/game-piece";
import { Message } from "../modals/message-modal";
import { BaseMatch, MatchLogic } from "./base-match";
import { Controller } from "./controller";
import { requestMatchReset } from "./online-events/request-match-reset";
import { requestUndoMove } from "./online-events/request-undo-move";
import { requestResolveMove } from "./online-events/request-resolve-move";

export class OnlineMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY_TYPE.ONLINE;
  socket: Socket;
  listenerEvents: string[] = [];

  constructor({
    lobby,
    player,
    socket,
  }: {
    lobby: Lobby;
    player: Player;
    socket: Socket;
  }) {
    super({ lobby, player });
    this.mode = LOBBY_TYPE.ONLINE;
    this.socket = socket;
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
      this.socket.emit("resolved-move", {
        originPoint,
        targetPoint,
        key: this.lobby.key,
      });
      return isValidMove;
    } else {
      return false;
    }
  }

  resetRequest() {
    this.socket.emit("reset-match-request", { key: this.lobby.key });
    return false;
  }

  undoTurnRequest() {
    this.socket.emit("reset-match-request", { key: this.lobby.key });
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
    const currentPlayer = this.getGame().getCurrentPlayer();
    const teamsPlayer = this.lobby.teams[currentPlayer];
    console.log(teamsPlayer, this.player.id);
    return teamsPlayer === this.player.id;
  }

  getPlayerTeam() {
    const teams = Object.entries(this.lobby.teams);
    const team = teams.find(([, player]) => player === this.player.id);
    if (team) {
      return team[0];
    }
    return;
  }

  isCurrentPlayersPiece(piece: GamePiece) {
    return piece.color === this.getPlayerTeam();
  }

  nextTurn() {
    return this.getGame().nextTurn();
  }

  setPromotion(selection: string) {
    this.getGame().setPromotionPiece(selection);
  }

  subscribeMatchEvents({
    controller,
    setMessage,
  }: {
    controller: Controller;
    setMessage: (value: React.SetStateAction<Message | null>) => void;
  }) {
    const matchResetEvents = requestMatchReset({
      socket: this.socket,
      setMessage,
      controller,
    });
    const matchUndoEvents = requestUndoMove({
      socket: this.socket,
      setMessage,
      controller,
    });
    const resolveMoveEvent = requestResolveMove({
      socket: this.socket,
      setMessage,
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
      this.socket.off(event);
    });
  }
}
