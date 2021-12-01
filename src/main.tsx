import "babylonjs-loaders";
import "./index.css";
import React, { useState, useEffect, useRef } from "react";
import { App } from "./component/app";
import SideNAV from "./component/side-nav";
import Chess from "./component/chess";
import LoadingScreen from "./component/loading-screen";

interface Props {}

const Main: React.FC<Props> = () => {
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const [chessLoaded, setChessLoaded] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const chessRef = useRef<App>();

  const handlerTest = (e: any) => {
    console.log(e);
    console.log(e.target.classList.value);
    console.log(e.currentTarget);
  };
  const intro = (
    <>
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
        handler={handlerTest}
      />
    </>
  );
  console.log(playBtnRef);
  return (
    <div className="app">
      {chessLoaded ? intro : <LoadingScreen />}
      <Chess ref={chessRef} setLoaded={setChessLoaded} />
    </div>
  );
};

export default Main;
