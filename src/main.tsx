import React, { useEffect, useState } from "react";
import { App } from "./component/chess-app";
import SideNAV from "./component/side-nav";
import EventEmitter from "./events/event-emitter";
import GameOverlay from "./component/game-overlay";
import MatchSettingsModal from "./component/match-settings-modal/match-settings-modal";
import InviteCode from "./component/match-settings-modal/invite-code";

interface Props {
  chessApp: App;
  emitter: EventEmitter;
  socket: any;
}

const Main: React.FC<Props> = ({ chessApp, emitter, socket }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [matchSettingsOpen, setMatchSettingsOpen] = useState(false);
  const [updateReact, setUpdateReact] = useState(true);
  const [inviteCode, setInviteCode] = useState("");

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

  useEffect(() => {
    socket.on("updateReact", () => {
      updateReact ? setUpdateReact(false) : setUpdateReact(true);
      setInviteCode("");
    });

    socket.on("reply-invite-code", (roomCode: string) => {
      setInviteCode(roomCode);
    });
  }, []);

  return (
    <div className="app">
      {display}
      {inviteCode !== "" ? <InviteCode code={inviteCode} /> : null}
      {chessApp.game.gameStarted ? (
        <GameOverlay
          emitter={emitter}
          isNavbarOpen={isNavbarOpen}
          setIsNavbarOpen={setIsNavbarOpen}
        />
      ) : null}
      {matchSettingsOpen ? (
        <MatchSettingsModal
          emitter={emitter}
          setMatchSettings={setMatchSettingsOpen}
        />
      ) : null}
    </div>
  );
};

export default Main;
