import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { APP_URL } from "../config";
import App from "./app";
import "./index.css";
import { createSceneManager } from "./scenes/scene-manager";

export const ENV_BASE_URL =
  process.env.NODE_ENV === "production" ? APP_URL.PROD : APP_URL.DEV;

//For hot reloading, will get tree-shaken in production
if (process.env.NODE_ENV === "development") {
  new EventSource("/esbuild").addEventListener("change", (e) => {
    window.location.reload();
  });
}

const container = document.getElementById("root") as HTMLDivElement;
const root = ReactDOMClient.createRoot(container);

//Both the canvas and app initializing loading screen are on the index.html
const canvas = document.getElementById("app-canvas") as HTMLCanvasElement;

const sceneManager = await createSceneManager(canvas);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App sceneManager={sceneManager} />
    </BrowserRouter>
  </React.StrictMode>
);
