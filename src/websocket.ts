import { io, Socket } from "socket.io-client";

export class WebSocketClient {
  socket: Socket;
  room: Room | null;

  constructor() {
    this.socket = io(`ws://${window.location.host}`, {
      transports: ["websocket"],
    });
    this.room = null;
  }

  makeRoom(time: string) {
    const room: Room = {
      roomKey: null,
      players: {
        player1: { name: "Eliya", color: "White" },
        player2: { name: "Waiting...", color: "Black" },
      },
      firstMove: "player1",
      time,
    };
    this.room = room;
    return room;
  }
  joinRoom() {}
  updateRoom() {}
  sendRequest() {}
}

export interface Room {
  roomKey: string | null;
  players: Players;
  firstMove: string;
  time: string;
}

type Player = { name: string; color: "White" | "Black" };
type Players = {
  ["player1"]: Player;
  ["player2"]: Player;
};
