import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { displayScreen } from "../view/display-screen";
import { MenuButton } from "../component/buttons/menu-button";
import LoadingScreen from "../component/loading-screen";

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
      <h1 className="page-title">
        <span className="highlight-site-title">3D</span> Chess
      </h1>
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
