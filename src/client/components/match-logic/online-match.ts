import { Socket } from "socket.io-client";
import { LOBBY, LobbySettings, Player } from "../../../shared/match";
import { BaseMatch, MatchLogic } from "./base-match";
import { Point } from "../../helper/movement-helpers";
import GamePiece from "../game-logic/game-piece";

export class OnlineMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY.ONLINE;
  socket: Socket;

  constructor({
    lobby,
    player,
    socket,
  }: {
    lobby: LobbySettings;
    player: Player;
    socket: Socket;
  }) {
    super({ lobby, player });
    this.mode = LOBBY.ONLINE;
    this.socket = socket;
  }

  resolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    return this.game.resolveMove(originPoint, targetPoint);
  }

  isPlayersTurn() {
    const currentPlayer = this.game.getCurrentPlayer();
    return currentPlayer === this.player.team;
  }

  getPlayerTeam() {
    return this.player.team;
  }

  isCurrentPlayersPiece(piece: GamePiece) {
    return piece.color === this.getPlayerTeam();
  }

  nextTurn() {
    return this.game.nextTurn();
  }

  undoTurn() {
    return this.game.undoTurn();
  }

  setPromotion(selection: string) {
    this.game.setPromotionPiece(selection);
  }
}
