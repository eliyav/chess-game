import React, { useEffect, useRef, useState } from "react";
import SideNav from "./component/side-nav";
import EventEmitter from "./events/event-emitter";
import GameOverlay from "./component/game-overlay/game-overlay";
import MatchSettingsModal from "./component/match-settings/match-settings";
import InviteCode from "./component/match-settings/invite-code";
import * as icons from "./component/game-overlay/overlay-icons";
import Timer from "./component/game-logic/timer";
import MessageModal from "./component/modals/message-modal";
import Match, { MatchSettings } from "./component/match";
import InputModal from "./component/modals/input-modal";
import { TurnHistory } from "./helper/game-helpers";
import PromotionModal from "./component/modals/promotion-modal";

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
  const [messageModal, setMessageModal] = useState<Message>({});
  const [inputModal, setInputModal] = useState<Input>({});
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    //#region Socket Listeners
    socket.on("load-game", (match: Match) => {
      emitter?.emit("load-game", match);
    });

    socket.on("start-online-match", () => {
      emitter!.emit("join-match");
      setInviteCode({});
      setGameStarted(true);
    });

    socket.on("reply-invite-code", (roomCode: string) => {
      setInviteCode({ is: true, code: roomCode });
    });

    socket.on("assign-room-info", (matchInfo: MatchSettings) => {
      emitter?.emit("assign-room-info", matchInfo);
    });

    socket.on("reset-board-request", (room: string) => {
      setMessageModal({
        is: true,
        question: "Opponent has requested to reset the board, do you agree?",
        onConfirm: () => {
          socket.emit("confirm-board-reset", room);
          setMessageModal({});
        },
        onReject: () => {
          socket.emit("reject-board-reset", room);
          setMessageModal({});
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
      setMessageModal({
        is: true,
        question:
          "Opponent has requested to undo their last move, do you agree?",
        onConfirm: () => {
          socket.emit("confirm-undo-move", room);
          setMessageModal({});
        },
        onReject: () => {
          socket.emit("reject-undo-move", room);
          setMessageModal({});
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
    //#endregion

    //#region Emitter Listeners
    emitter?.on("piece-promotion", () => {
      emitter.emit("detach-game-control");
      setShowPromotionModal(true);
    });

    emitter?.on("update-game-started", () => {
      setGameStarted(true);
    });

    emitter?.on("end-match", (winningTeam: string) => {
      setMessageModal({
        is: true,
        question: `Game is over, ${winningTeam} player wins!, Would you like to start another game?`,
        onConfirm: () => {
          emitter.emit("restart-match");
          setMessageModal({});
        },
        onReject: () => {
          setMessageModal({});
        },
      });
    });
    //#endregion
  }, []);

  return (
    <div className="app">
      {showPromotionModal && (
        <PromotionModal
          submitSelection={(e) => {
            const selection = e.target.innerHTML;
            emitter?.emit("promotion-selection", selection);
            setShowPromotionModal(false);
          }}
        />
      )}
      {isNavbarOpen && (
        <SideNav
          onClose={() => {
            setIsNavbarOpen(false);
          }}
          items={[
            {
              text: "Home",
              onClick: () => {
                setMessageModal({
                  is: true,
                  question:
                    "Are you sure you would like to leave the current game?",
                  onConfirm: () => {
                    setGameStarted(false);
                    setIsNavbarOpen(false);
                    emitter!.emit("home-screen");
                    setMessageModal({});
                  },
                  onReject: () => {
                    setMessageModal({});
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
                setIsNavbarOpen(false);
                setInputModal({
                  is: true,
                  text: "Please enter the room key below:",
                  onConfirm: () => {
                    if (!gameStarted) {
                      emitter!.emit(
                        "join-online-match",
                        inputRef.current!.value
                      );
                      setInputModal({});
                    }
                  },
                  onReject: () => {
                    setInputModal({});
                  },
                });
              },
            },
            {
              text: "Save Game",
              onClick: () => {
                setIsNavbarOpen(false);
                emitter!.emit("save-game");
              },
            },
            {
              text: "Load Game",
              onClick: () => {
                setIsNavbarOpen(false);
                emitter!.emit("lookup-game");
              },
            },
          ]}
        />
      )}
      {inputModal.is && (
        <InputModal
          text={inputModal.text}
          ref={inputRef}
          onConfirm={inputModal.onConfirm}
          onReject={inputModal.onReject}
        />
      )}
      {inviteCode.is && (
        <InviteCode
          code={inviteCode.code}
          onClose={() => {
            setInviteCode({});
          }}
        />
      )}
      {messageModal.is && (
        <MessageModal
          question={messageModal.question}
          onConfirm={messageModal.onConfirm}
          onReject={messageModal.onReject}
        />
      )}
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
                setMessageModal({
                  is: true,
                  question: "Are you sure you would like to reset the board?",
                  onConfirm: () => {
                    emitter?.emit("restart-match");
                    setMessageModal({});
                  },
                  onReject: () => {
                    setMessageModal({});
                  },
                });
              },
            },
            {
              text: "undo",
              onClick: () => {
                setMessageModal({
                  is: true,
                  question:
                    "Are you sure you would like to undo the last move?",
                  onConfirm: () => {
                    emitter?.emit("undo-move");
                    setMessageModal({});
                  },
                  onReject: () => {
                    setMessageModal({});
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
      ) : (
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
      )}
      {isMatchSettings && (
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
      )}
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

type Input = {
  is?: boolean;
  text?: string;
  onConfirm?: () => void;
  onReject?: () => void;
};
