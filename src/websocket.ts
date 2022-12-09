import { io, Socket } from "socket.io-client";

export class WebSocketClient {
  socket: Socket;
  room: LobbyInfo | null;

  constructor() {
    this.socket = io(`ws://${window.location.host}`, {
      transports: ["websocket"],
    });
    this.room = null;
  }

  createLobby(username: string) {
    this.socket.emit("create-lobby", [username])
  }

  roomInfo() {
    return { ...this.room };
  }
  makeRoom() {}
  joinRoom() {}
  updateRoom() {}
  sendRequest() {}
  updateTime(lobbyKey: string, time: string) {
    this.socket.emit("update-lobby-time", [lobbyKey, time])
  }
  assignRoomCode() {}
  attachListeners() {}
}

export interface LobbyInfo {
  lobbyKey: string;
  players: Players;
  firstMove: string;
  time: string;
}

type Player = { name: string; color: "White" | "Black" };
type Players = {
  ["player1"]: Player;
  ["player2"]: Player;
};
