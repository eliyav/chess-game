import "babylonjs-loaders";
import React, { useState, useRef, useEffect } from "react";
import { App } from "./component/app";
import SideNAV from "./component/side-nav";
import Chess from "./component/chess";
import LoadingScreen from "./component/loading-screen";
import GameOverlay from "./component/game-overlay";
import CreateMatchModal from "./component/create-match-modal";
import activateEmitter from "./events/emitter";
import EventEmitter from "./events/event-emitter";

const Main: React.FC = () => {
  const chessRef = useRef<App | undefined>();
  const [isChessLoaded, setIsChessLoaded] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMatchModal, setIsMatchModal] = useState(false);
  const [emitter, setEmitter] = useState<EventEmitter>();

  const display = (
    <>
      {!chessRef.current?.game.gameStarted ? (
        <button
          id="playButton"
          onClick={() => {
            isNavbarOpen === false
              ? setIsNavbarOpen(true)
              : setIsNavbarOpen(false);
          }}
        >
          Play
        </button>
      ) : null}
      <SideNAV
        emitter={emitter}
        isOpen={isNavbarOpen}
        setIsOpen={setIsNavbarOpen}
        setMatchModal={setIsMatchModal}
      />
    </>
  );

  useEffect(() => {
    if (chessRef.current !== undefined) {
      const emitter = activateEmitter(chessRef.current);
      setEmitter(emitter);
    }
  }, [chessRef.current]);

  return (
    <div className="app">
      {isChessLoaded ? display : <LoadingScreen />}
      {chessRef.current?.game.gameStarted ? (
        <GameOverlay
          emitter={emitter}
          isNavbarOpen={isNavbarOpen}
          setIsNavbarOpen={setIsNavbarOpen}
        />
      ) : null}
      <Chess
        chessRef={chessRef}
        emitter={emitter}
        setLoaded={setIsChessLoaded}
      />
      {isMatchModal ? <CreateMatchModal chessRef={chessRef} /> : null}
    </div>
  );
};

export default Main;
