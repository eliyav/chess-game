import React from "react";
import * as ReactDOMClient from "react-dom/client";
import App from "./app";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

const container = document.getElementById("root") as HTMLDivElement;
const root = ReactDOMClient.createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="chess-game.eu.auth0.com"
        clientId="T3hIqwKbQqtTxqUJUcqJILVJ5fTEOAJK"
        redirectUri={window.location.origin}
        audience="chess-game API"
        scope="openid profile email"
      >
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);
