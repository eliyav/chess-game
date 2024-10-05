import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import "./index.css";
import { createSceneManager } from "./scenes/scene-manager";

export const isPhone = window.matchMedia("(max-width: 600px)").matches;

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
