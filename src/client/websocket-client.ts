import { io } from "socket.io-client";

const protocol = window.location.protocol === "https:" ? "wss" : "ws";

export const websocket = io(`${protocol}://${window.location.host}`, {
  transports: ["websocket"],
});

window.addEventListener("beforeunload", () => {
  websocket.disconnect();
});
