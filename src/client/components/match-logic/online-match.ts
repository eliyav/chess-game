import { Socket } from "socket.io-client";
import { LobbySettings, Player } from "../../../shared/match";
import { BaseMatch } from "./base-match";

export class OnlineMatch extends BaseMatch {
  lobby: LobbySettings;
  player: Player;

  constructor({
    lobby,
    player,
    socket,
  }: {
    lobby: LobbySettings;
    player: Player;
    socket: Socket;
  }) {
    super();
    this.lobby = lobby;
    this.player = player;
  }

  isPlayersTurn() {
    const currentPlayer = this.game.getCurrentPlayer();
    return currentPlayer === this.player.team;
  }

  getPlayerTeam() {
    return this.player.team;
  }

  shouldCameraRotate() {
    return false;
  }
}
