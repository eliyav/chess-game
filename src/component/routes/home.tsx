import React, { useEffect, useRef } from "react";
import { displayScreen } from "../../../src/view/display-screen";
import { MenuButton } from "../buttons/menu-button";

interface HomeScreenProps {
  openNavbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Home: React.FC<HomeScreenProps> = ({ openNavbar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadDisplay = async () => {
      let engine = new BABYLON.Engine(canvasRef.current, true);
      //@ts-ignore
      const displayScene = await displayScreen(engine);

      engine.runRenderLoop(function () {
        displayScene.render();
        engine.resize();
      });
    };
    loadDisplay();
  }, []);
  return (
    <div className="home screen">
      <MenuButton open={openNavbar} />
      <h1 className="page-title">3D Chess</h1>
      <div className="divider"></div>
      <p className="page-info">Play with your friends, no account required!</p>
      <canvas ref={canvasRef} id="displayCanvas"></canvas>
      <button>Start Playing!</button>
      <button>Sign Up</button>
    </div>
  );
};
