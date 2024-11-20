import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../shared/websocket";
import { WEBSOCKET_HOST } from "../config";

const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const ENV_HOST =
  process.env.NODE_ENV === "production"
    ? WEBSOCKET_HOST.PROD
    : WEBSOCKET_HOST.DEV;

export const websocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  `${protocol}://${ENV_HOST}`,
  {
    transports: ["websocket"],
  }
);

window.addEventListener("beforeunload", () => {
  websocket.disconnect();
});
