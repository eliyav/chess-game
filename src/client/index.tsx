import React from "react";
import * as ReactDOMClient from "react-dom/client";
import App from "./app";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { io } from "socket.io-client";

const websocket = io(`ws://${window.location.host}`, {
  transports: ["websocket"],
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
