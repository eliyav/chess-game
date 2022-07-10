import * as BABYLON from "babylonjs";
import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useRef, useState } from "react";
import { displayScreen } from "../view/display-screen";
import LoadingScreen from "../component/loading-screen";

export const Home: React.FC = () => {
  const [isInitDone, setIsInitDone] = useState(false);
  const [loadingScreen, setloadingScreen] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { loginWithPopup, isAuthenticated, user } = useAuth0();

  useEffect(() => {
    if (isInitDone) {
      let engine = new BABYLON.Engine(canvasRef.current, true);
      (async () => {
        const displayScene = await displayScreen(engine);
        engine.runRenderLoop(() => {
          displayScene.render();
          engine.resize();
        });
        setTimeout(() => setloadingScreen(false), 1000);
      })();
      return () => engine.stopRenderLoop();
    }
    setIsInitDone(true);
  }, [isInitDone]);

  return (
    <>
      <canvas ref={canvasRef} className="displayCanvas screen"></canvas>
      {loadingScreen ? (
        <LoadingScreen text="..." />
      ) : (
        <div className="home screen"></div>
      )}
    </>
  );
};
