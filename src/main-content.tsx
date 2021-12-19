import React, { useEffect, useState } from "react";
import SideNav from "./component/side-nav";
import EventEmitter from "./events/event-emitter";
import GameOverlay from "./component/game-overlay/game-overlay";
import MatchSettingsModal from "./component/match-settings-modal/match-settings-modal";
import InviteCode from "./component/match-settings-modal/invite-code";
import * as icons from "./component/game-overlay/overlay-icons";
import Timer from "./component/game-logic/timer";

interface MainProps {
  emitter: EventEmitter | undefined;
  socket: any;
  timerRef: React.MutableRefObject<Timer | undefined>;
}

type InviteCode = {
  is: boolean;
  code: string;
};

const MainContent: React.VFC<MainProps> = ({ emitter, socket, timerRef }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMatchSettings, setIsMatchSettings] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [inviteCode, setInviteCode] = useState<InviteCode>({
    is: false,
    code: "",
  });

  const display = (
    <>
      {!gameStarted ? (
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
                  setGameStarted(false);
                  setIsNavbarOpen(false);
                  emitter!.emit("home-screen");
                }
              },
              className: "category",
            },
            {
              text: "Create Match",
              onClick: () => {
                if (!gameStarted) {
                  setIsMatchSettings(true);
                  setIsNavbarOpen(false);
                }
              },
            },
            {
              text: "Join Online",
              onClick: () => {
                if (!gameStarted) {
                  emitter!.emit("join-online-match");
                  setIsNavbarOpen(false);
                }
              },
            },
          ]}
        />
      ) : null}
    </>
  );

  useEffect(() => {
    socket.on("start-online-match", () => {
      emitter!.emit("join-match");
      setInviteCode((prevState) => ({
        ...prevState,
        is: false,
        code: "",
      }));
      setGameStarted(true);
    });

    socket.on("reply-invite-code", (roomCode: string) => {
      setInviteCode({ is: true, code: roomCode });
    });
  }, []);

  return (
    <div className="app">
      {display}
      {inviteCode.is ? (
        <InviteCode
          code={inviteCode.code}
          onClose={() => {
            setInviteCode((prevState) => ({
              ...prevState,
              is: false,
              code: "",
            }));
          }}
        />
      ) : null}
      {gameStarted ? (
        <GameOverlay
          timerRef={timerRef.current}
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
                emitter!.emit("restart-match");
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
                emitter!.emit("pause-game");
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
            emitter!.emit("create-match", options);
            setIsMatchSettings(false);
            mode === "Offline" ? setGameStarted(true) : null;
          }}
        />
      ) : null}
    </div>
  );
};

export default MainContent;

export type IconsIndex = typeof icons;
