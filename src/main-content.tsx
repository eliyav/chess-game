import React, { useEffect, useState } from "react";
import SideNav from "./component/side-nav";
import EventEmitter from "./events/event-emitter";
import GameOverlay from "./component/game-overlay/game-overlay";
import MatchSettingsModal from "./component/match-settings-modal/match-settings-modal";
import InviteCode from "./component/match-settings-modal/invite-code";
import * as icons from "./component/game-overlay/overlay-icons";
import Match from "./component/match";
import { CanvasView } from "./view/view-init";

interface MainProps {
  emitter: EventEmitter | undefined;
  socket: any;
  matchRef: React.MutableRefObject<Match | undefined>;
  viewRef: React.MutableRefObject<CanvasView | undefined>;
}

const MainContent: React.VFC<MainProps> = ({
  matchRef,
  viewRef,
  emitter,
  socket,
}) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMatchSettings, setIsMatchSettings] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

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
      matchRef.current?.startMatchTimer();
      setInviteCode("");
      setGameStarted(true);
    });

    socket.on("reply-invite-code", (roomCode: string) => {
      setInviteCode(roomCode);
    });
  }, []);

  return (
    <div className="app">
      {display}
      {inviteCode !== "" ? (
        <InviteCode
          code={inviteCode}
          onClose={() => {
            setInviteCode("");
          }}
        />
      ) : null}
      {gameStarted ? (
        <GameOverlay
          timerRef={matchRef.current!.timer}
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
                viewRef.current?.resetCamera(matchRef.current!);
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
            setGameStarted(true);
          }}
        />
      ) : null}
    </div>
  );
};

export default MainContent;

export type IconsIndex = typeof icons;
