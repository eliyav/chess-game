import React, { useState } from "react";
import { App } from "./component/chess-app";
import SideNAV from "./component/side-nav";
import EventEmitter from "./events/event-emitter";
import GameOverlay from "./component/game-overlay";
import MatchSettingsModal from "./component/match-settings-modal";

interface Props {
  chessApp: App;
  emitter: EventEmitter;
  socket: any;
}

const Main: React.FC<Props> = ({ chessApp, emitter, socket }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [matchSettingsOpen, setMatchSettingsOpen] = useState(false);

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
      {isNavbarOpen ? (
        <SideNAV
          emitter={emitter}
          setIsNavbarOpen={setIsNavbarOpen}
          setMatchSettings={setMatchSettingsOpen}
        />
      ) : null}
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
      {matchSettingsOpen ? (
        <MatchSettingsModal
          chessApp={chessApp}
          emitter={emitter}
          setMatchSettings={setMatchSettingsOpen}
        />
      ) : null}
    </div>
  );
};

export default Main;
