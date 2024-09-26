import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import "./index.css";

export const isPhone = window.matchMedia("(max-width: 600px)").matches;

const container = document.getElementById("root") as HTMLDivElement;
const root = ReactDOMClient.createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
