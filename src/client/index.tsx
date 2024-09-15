import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { io } from "socket.io-client";
import App from "./app";
import "./index.css";

const websocket = io(
  `${process.env.NODE_ENV === "dev" ? "ws" : "wss"}://${window.location.host}`,
  {
    transports: ["websocket"],
  }
);

window.addEventListener("beforeunload", () => {
  websocket.disconnect();
});

const container = document.getElementById("root") as HTMLDivElement;
const root = ReactDOMClient.createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App websocket={websocket} />
    </BrowserRouter>
  </React.StrictMode>
);
