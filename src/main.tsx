import React, { useEffect, useRef, useState } from "react";
import { App } from "./component/chess-app";
import SideNav from "./component/side-nav";
import EventEmitter from "./events/event-emitter";
import GameOverlay from "./component/game-overlay";
import MatchSettingsModal from "./component/match-settings-modal/match-settings-modal";
import InviteCode from "./component/match-settings-modal/invite-code";
import * as icons from "./component/icons";

interface MainProps {
  chessApp: App;
  emitter: EventEmitter;
  socket: any;
}

const Main: React.VFC<MainProps> = ({ chessApp, emitter, socket }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMatchSettings, setIsMatchSettings] = useState(false);
  const [updateReact, setUpdateReact] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const timerRef = useRef(chessApp.game.timer);

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
        <SideNav
          onClose={() => {
            setIsNavbarOpen(false);
          }}
          items={[
            {
              text: "Home",
              onClick: () => {
                const confirm = window.confirm(
                  "Are you sure you would like to abandon the game?"
                );
                if (confirm) {
                  emitter!.emit("home-screen");
                  setIsNavbarOpen(false);
                }
              },
            },
            {
              text: "Create Match",
              onClick: () => {
                setIsMatchSettings(true);
                setIsNavbarOpen(false);
              },
            },
            {
              text: "Join Online",
              onClick: () => {
                emitter!.emit("join-online-match");
                setIsNavbarOpen(false);
              },
            },
          ]}
        />
      ) : null}
    </>
  );

  useEffect(() => {
    socket.on("prepare-game-scene", () => {
      emitter.emit("prepare-game-scene");
      emitter.emit("reset-camera");
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
          timerRef={timerRef}
          items={[
            {
              text: "menu",
              onClick: () => {
                isNavbarOpen ? setIsNavbarOpen(false) : setIsNavbarOpen(true);
              },
            },
            {
              text: "restart",
              onClick: () => {
                emitter!.emit("reset-board");
              },
            },
            {
              text: "undo",
              onClick: () => {
                emitter!.emit("undo-move");
              },
            },
            {
              text: "camera",
              onClick: () => {
                emitter!.emit("reset-camera");
              },
            },
            {
              text: "pause",
              onClick: () => {
                emitter?.emit("pause-game");
              },
            },
          ]}
          icons={icons}
        />
      ) : null}

      {isMatchSettings ? (
        <MatchSettingsModal
          onClose={() => setIsMatchSettings(false)}
          onSubmit={(formElement) => {
            let form = new FormData(formElement);
            const mode = form.get("mode")?.toString();
            const player = form.get("team")?.toString();
            const clockTime = form.get("time")?.toString();
            let time;
            if (clockTime) {
              time = 60 * parseInt(clockTime);
            }
            const options = {
              mode,
              time,
              player,
            };
            emitter.emit("create-match", options);
          }}
        />
      ) : null}
    </div>
  );
};

export default Main;

export type IconsIndex = typeof icons;
