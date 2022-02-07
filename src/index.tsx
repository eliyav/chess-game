import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      redirectUri={window.location.origin}
      audience="chess-game API"
      scope="openid profile email"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
