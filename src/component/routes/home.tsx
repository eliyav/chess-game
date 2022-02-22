import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { displayScreen } from "../../../src/view/display-screen";
import { MenuButton } from "../buttons/menu-button";
import LoadingScreen from "../loading-screen";

interface HomeScreenProps {
  openNavbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Home: React.FC<HomeScreenProps> = ({ openNavbar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { loginWithPopup, isAuthenticated, user } = useAuth0();
  const [displayLoaded, setDisplayLoaded] = useState(false);

  useEffect(() => {
    const loadDisplay = async () => {
      let engine = new BABYLON.Engine(canvasRef.current, true);
      //@ts-ignore
      const displayScene = await displayScreen(engine);

      engine.runRenderLoop(function () {
        displayScene.render();
        engine.resize();
      });

      canvasRef.current?.classList.add("displayCanvas");
      canvasRef.current?.classList.remove("notDisplayed");
      setDisplayLoaded(true);
    };
    loadDisplay();
  }, []);
  return (
    <div className="home screen">
      <MenuButton open={openNavbar} />
      <h1 className="page-title">3D Chess</h1>
      <div className="divider"></div>
      <p className="page-info">Play with your friends, no account required!</p>
      {!displayLoaded && (
        <div className="loadingDisplay">
          <LoadingScreen text="..." />
        </div>
      )}
      <canvas ref={canvasRef} className="notDisplayed"></canvas>
      <Link to={"./match"}>
        <button>Start Playing!</button>
      </Link>
      <button onClick={() => loginWithPopup()}>
        {isAuthenticated ? user?.nickname : "Sign Up / Login"}
      </button>
    </div>
  );
};
