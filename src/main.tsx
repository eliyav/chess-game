import "babylonjs-loaders";
import "./index.css";
import React, { useState, useRef } from "react";
import { App } from "./component/app";
import SideNAV from "./component/side-nav";
import Chess from "./component/chess";
import LoadingScreen from "./component/loading-screen";
import GameOverlay from "./component/game-overlay";

interface Props {}

const Main: React.FC<Props> = () => {
  const chessRef = useRef<App | undefined>();
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const [isChessLoaded, setIsChessLoaded] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isGameScreen, setIsGameScreen] = useState(false);

  const display = (
    <>
      {isGameScreen ? (
        <GameOverlay
          chessRef={chessRef}
          playBtn={playBtnRef}
          setIsGameScreen={setIsGameScreen}
          setIsNavbarOpen={setIsNavbarOpen}
          isNavbarOpen={isNavbarOpen}
        />
      ) : null}
      <button
        id="playButton"
        ref={playBtnRef}
        onClick={() => {
          isNavbarOpen === false
            ? setIsNavbarOpen(true)
            : setIsNavbarOpen(false);
        }}
      >
        Play
      </button>
      <SideNAV
        chessRef={chessRef}
        isOpen={isNavbarOpen}
        setIsOpen={setIsNavbarOpen}
        playBtn={playBtnRef}
        setIsGameScreen={setIsGameScreen}
      />
    </>
  );

  return (
    <div className="app">
      {isChessLoaded ? display : <LoadingScreen />}
      <Chess chessRef={chessRef} setLoaded={setIsChessLoaded} />
    </div>
  );
};

export default Main;
