import React, { useState } from "react";
import { App } from "./component/chess-app";
import SideNAV from "./component/side-nav";
import EventEmitter from "./events/event-emitter";
import GameOverlay from "./component/game-overlay";
// import CreateMatchModal from "./component/create-match-modal";

interface Props {
  chessApp: App;
  emitter: EventEmitter;
  socket: any;
}

const Main: React.FC<Props> = ({ chessApp, emitter, socket }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  // const [isMatchModal, setIsMatchModal] = useState(false);

  const display = (
    <>
      {!chessApp.game.gameStarted ? (
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
        // setMatchModal={setIsMatchModal}
      />
    </>
  );

  return (
    <div className="app">
      {display}
      {chessApp.game.gameStarted ? (
        <GameOverlay
          emitter={emitter}
          isNavbarOpen={isNavbarOpen}
          setIsNavbarOpen={setIsNavbarOpen}
        />
      ) : null}
      {/* {isMatchModal ? <CreateMatchModal chessRef={chessRef} /> : null} */}
    </div>
  );
};

export default Main;
