import React, { useEffect, useState } from "react";
import SideNav from "./component/side-nav";
import EventEmitter from "./events/event-emitter";
import GameOverlay from "./component/game-overlay/game-overlay";
import MatchSettingsModal from "./component/match-settings/match-settings";
import InviteCode from "./component/match-settings/invite-code";
import * as icons from "./component/game-overlay/overlay-icons";
import Timer from "./component/game-logic/timer";
import MessageModal from "./component/modals/message-modal";

interface MainProps {
  emitter: EventEmitter | undefined;
  socket: any;
  timerRef: React.MutableRefObject<Timer | undefined>;
}

const MainContent: React.VFC<MainProps> = ({ emitter, socket, timerRef }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMatchSettings, setIsMatchSettings] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [inviteCode, setInviteCode] = useState<InviteCode>({});
  const [showMessageModal, setShowMessageModal] = useState<Message>({});

  useEffect(() => {
    socket.on("start-online-match", () => {
      emitter!.emit("join-match");
      setInviteCode({});
      setGameStarted(true);
    });

    socket.on("reply-invite-code", (roomCode: string) => {
      setInviteCode({ is: true, code: roomCode });
    });

    socket.on("reset-board-request", (room: string) => {
      setShowMessageModal({
        is: true,
        question: "Opponent has requested to reset the board, do you agree?",
        onConfirm: () => {
          socket.emit("confirm-board-reset", room);
          setShowMessageModal({});
        },
        onReject: () => {
          socket.emit("reject-board-reset", room);
          setShowMessageModal({});
        },
      });
    }),
      socket.on("reset-board-resolve", (response: string) => {
        if (response === "Yes") {
          emitter?.emit("reset-board");
          //Notification modal
        } else {
          console.log("Request Denied");
          //Notification modal
        }
      });

    socket.on("undo-move-request", (room: string) => {
      setShowMessageModal({
        is: true,
        question:
          "Opponent has requested to undo their last move, do you agree?",
        onConfirm: () => {
          socket.emit("confirm-undo-move", room);
          setShowMessageModal({});
        },
        onReject: () => {
          socket.emit("reject-undo-move", room);
          setShowMessageModal({});
        },
      });
    }),
      socket.on("undo-move-resolve", (response: string) => {
        if (response === "Yes") {
          emitter?.emit("undo-move-action");
          //Notification Modal
        } else {
          console.log("Request Denied");
          //Notification Modal
        }
      });
  }, []);

  return (
    <div className="app">
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
                setShowMessageModal({
                  is: true,
                  question:
                    "Are you sure you would like to leave the current game?",
                  onConfirm: () => {
                    setGameStarted(false);
                    setIsNavbarOpen(false);
                    emitter!.emit("home-screen");
                    setShowMessageModal({});
                  },
                  onReject: () => {
                    setShowMessageModal({});
                  },
                });
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
      {inviteCode.is ? (
        <InviteCode
          code={inviteCode.code}
          onClose={() => {
            setInviteCode({});
          }}
        />
      ) : null}
      {showMessageModal.is ? (
        <MessageModal
          question={showMessageModal.question}
          onConfirm={showMessageModal.onConfirm}
          onReject={showMessageModal.onReject}
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
                setShowMessageModal({
                  is: true,
                  question: "Are you sure you would like to reset the board?",
                  onConfirm: () => {
                    emitter?.emit("restart-match");
                    setShowMessageModal({});
                  },
                  onReject: () => {
                    setShowMessageModal({});
                  },
                });
              },
            },
            {
              text: "undo",
              onClick: () => {
                setShowMessageModal({
                  is: true,
                  question:
                    "Are you sure you would like to undo the last move?",
                  onConfirm: () => {
                    emitter?.emit("undo-move");
                    setShowMessageModal({});
                  },
                  onReject: () => {
                    setShowMessageModal({});
                  },
                });
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

type InviteCode = {
  is?: boolean;
  code?: string;
};

type Message = {
  is?: boolean;
  question?: string;
  onConfirm?: () => void;
  onReject?: () => void;
};
