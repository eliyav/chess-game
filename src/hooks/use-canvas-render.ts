import * as BABYLON from "babylonjs";
import React, { useEffect, useRef, useState } from "react";
import { displayScreen } from "../view/display-screen";
import { CustomGameScene } from "../view/game-assets";

export const useCanvasRender = (
  canvasRef: HTMLCanvasElement | null,
  canvasGameMode: boolean
) => {
  const [isInit, setIsInit] = useState(false);
  const [loadingScreen, setloadingScreen] = useState(true);
  const engineRef = useRef<BABYLON.Engine>();

  useEffect(() => {
    isInit
      ? (engineRef.current = new BABYLON.Engine(canvasRef, true))
      : setIsInit(true);
  }, [isInit]);

  useEffect(() => {
    if (canvasRef) {
      if (canvasRef!.getAttribute("data-engine") !== null) {
        let scene: CustomGameScene;
        (async () => {
          if (canvasGameMode) {
            const { gameScreen } = await import("../view/game-screen");
            scene = await gameScreen(canvasRef!, engineRef.current!);
          } else {
            scene = await displayScreen(engineRef.current!);
          }
          engineRef.current!.runRenderLoop(() => {
            scene.render();
            engineRef.current!.resize();
          });
          setTimeout(() => setloadingScreen(false), 1000);
        })();

        return () => engineRef.current!.stopRenderLoop();
      }
    }
  }, [canvasRef, canvasGameMode]);

  return [loadingScreen];
};
