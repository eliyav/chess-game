import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import "./index.css";
import { createSceneManager } from "./scenes/scene-manager";
import { APP_URL } from "../config";

export const ENV_BASE_URL =
  process.env.NODE_ENV === "production" ? APP_URL.PROD : APP_URL.DEV;

//For hot reloading, will get tree-shaken in production
if (process.env.NODE_ENV === "development") {
  new EventSource("/esbuild").addEventListener("change", (e) => {
    const { added, removed, updated } = JSON.parse(e.data);

    if (!added.length && !removed.length && updated.length === 2) {
      for (const link of document.getElementsByTagName("link")) {
        const url = new URL(link.href);
        if (url.host === location.host && url.pathname === updated[0]) {
          const next = link.cloneNode() as HTMLLinkElement;
          next.href = updated[0] + "?" + Math.random().toString(36).slice(2);
          next.onload = () => link.remove();
          link.parentNode?.insertBefore(next, link.nextSibling);
          return;
        }
      }
    }
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
