import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../shared/websocket";

const ENV_HOST =
  process.env.NODE_ENV === "production" ? "www.eliyav.com" : "localhost:3000";

const protocol = window.location.protocol === "https:" ? "wss" : "ws";

export const websocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `${protocol}://${ENV_HOST}`,
  {
    transports: ["websocket"],
  }
);

window.addEventListener("beforeunload", () => {
  websocket.disconnect();
});
