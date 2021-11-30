import "babylonjs-loaders";
import * as BABYLON from "babylonjs";
import initializeApp from "./app";
import { Engine } from "babylonjs/Engines/engine";
import React, { useEffect } from "react";
import "./index.css";

interface Props {}

const Main: React.FC<Props> = () => {
  useEffect(() => {
    async function Load() {
      const canvas = document.getElementById(
        "renderCanvas"
      ) as HTMLCanvasElement;
      // const loadingDiv = document.getElementById("loading") as HTMLDivElement;

      let engine: Engine = new BABYLON.Engine(canvas, true);
      const app = await initializeApp(canvas, engine);

      const {
        showScene,
        scenes: { startScene, gameScene },
      } = app;

      (() => {
        engine.runRenderLoop(function () {
          switch (showScene.index) {
            case 0:
              gameScene.detachControl();
              startScene.attachControl();
              startScene.render();
              break;
            case 1:
              gameScene.attachControl();
              gameScene.render();
              break;
            default:
              break;
          }
        });
      })();
    }

    Load();
  });

  return (
    <div className="app">
      <canvas id="renderCanvas" touch-action="none"></canvas>
    </div>
  );
};

export default Main;

// const refreshCanvas = () => {
//   let startSceneCamera: any = startScene.cameras[0];
//   let gameSceneCamera: any = gameScene.cameras[0];
//   if (canvas.width < 768) {
//     startSceneCamera.radius = 32;
//     gameSceneCamera.radius = 65;
//   } else {
//     startSceneCamera.radius = 30;
//     gameSceneCamera.radius = 45;
//   }
//   engine.resize();
// };

// const loadingEnd = () => {
//   refreshCanvas();
//   setTimeout(() => {
//     loadingDiv.style.display = "none";
//   }, 1000);
// };

// loadingEnd();

// window.onresize = refreshCanvas;
