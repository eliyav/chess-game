import "babylonjs-loaders";
import "./index.css";
import React, { useState, useEffect, useRef } from "react";
import { App } from "./component/app";
import SideNAV from "./component/side-nav";
import Chess from "./component/chess";
import LoadingScreen from "./component/loading-screen";
import GameOverlay from "./component/game-overlay";

interface Props {}

const Main: React.FC<Props> = () => {
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const [isChessLoaded, setIsChessLoaded] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isGameScreen, setIsGameScreen] = useState(false);

  const chessRef = useRef<App>();

  const navbarSelection = (e: any) => {
    const choice = e.target.innerText;
    setIsNavbarOpen(false);
    if (choice === "Start Offline") {
      playBtnRef.current?.classList.add("hide");
      chessRef.current?.emitter!.emit("start-match", "offline");
      setIsGameScreen(true);
    }
  };

  const overlaySelection = (e: any) => {
    const choice = e.target.innerText;
    if (choice === "Restart") {
      chessRef.current?.emitter!.emit("reset-board");
    } else if (choice === "Undo") {
      chessRef.current?.emitter!.emit("undo-move");
    } else if (choice === "Camera") {
      chessRef.current?.emitter!.emit("reset-camera");
    } else if (choice === "Home") {
      const confirm = window.confirm(
        "Are you sure you would like to abandon the game?"
      );
      if (confirm) {
        setIsGameScreen(false);
        chessRef.current?.emitter!.emit("home-screen");
        playBtnRef.current?.classList.remove("hide");
      }
    }
  };

  const display = (
    <>
      {isGameScreen ? (
        <GameOverlay selectionHandler={overlaySelection} />
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
        isOpen={isNavbarOpen}
        setIsOpen={setIsNavbarOpen}
        selectionHandler={navbarSelection}
      />
    </>
  );

  return (
    <div className="app">
      {isChessLoaded ? display : <LoadingScreen />}
      <Chess ref={chessRef} setLoaded={setIsChessLoaded} />
    </div>
  );
};

export default Main;
