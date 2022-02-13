import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "./component/navbar";
import { Home } from "./component/routes/home";
import { Matches } from "./component/routes/match";
import { GameView } from "./game-view";
import { UserData } from "./app";
import { Profile } from "./component/routes/profile";
import * as icons from "./component/game-overlay/overlay-icons";

interface ContentProps {
  userData: UserData | undefined;
}

export const Content: React.VFC<ContentProps> = ({ userData }) => {
  const { isAuthenticated } = useAuth0();
  const [navbarOpen, setNavbarOpen] = useState(false);

  // useEffect(() => {
  //   //#region Socket Listeners
  //   socket.on("load-game", (match: Match) => {
  //     emitter.emit("load-game", match);
  //   });

  //   socket.on("start-online-match", () => {
  //     emitter.emit("join-match");
  //     setInviteCode({});
  //     setInputModal(undefined);
  //     setGameStarted(true);
  //   });

  //   socket.on("reply-invite-code", (roomCode: string) => {
  //     setInviteCode({ is: true, code: roomCode });
  //   });

  //   socket.on("assign-room-info", (matchInfo: MatchSettings) => {
  //     emitter.emit("assign-room-info", matchInfo);
  //   });

  //   socket.on("reset-board-request", (room: string) => {
  //     setMessageModal({
  //       is: true,
  //       question: "Opponent has requested to reset the board, do you agree?",
  //       onConfirm: () => {
  //         socket.emit("confirm-board-reset", room);
  //         setMessageModal({});
  //       },
  //       onReject: () => {
  //         socket.emit("reject-board-reset", room);
  //         setMessageModal({});
  //       },
  //     });
  //   }),
  //     socket.on("reset-board-resolve", (response: string) => {
  //       if (response === "Yes") {
  //         emitter.emit("reset-board");
  //         //Notification modal
  //       } else {
  //         console.log("Request Denied");
  //         //Notification modal
  //       }
  //     });

  //   socket.on("undo-move-request", (room: string) => {
  //     setMessageModal({
  //       is: true,
  //       question:
  //         "Opponent has requested to undo their last move, do you agree?",
  //       onConfirm: () => {
  //         socket.emit("confirm-undo-move", room);
  //         setMessageModal({});
  //       },
  //       onReject: () => {
  //         socket.emit("reject-undo-move", room);
  //         setMessageModal({});
  //       },
  //     });
  //   }),
  //     socket.on("undo-move-resolve", (response: string) => {
  //       if (response === "Yes") {
  //         emitter.emit("undo-move-action");
  //         //Notification Modal
  //       } else {
  //         console.log("Request Denied");
  //         //Notification Modal
  //       }
  //     });
  //   //#endregion

  //   //#region Emitter Listeners
  //   emitter.on("piece-promotion", () => {
  //     emitter.emit("detach-game-control");
  //     setShowPromotionModal(true);
  //   });

  //   emitter.on("update-game-started", () => {
  //     setGameStarted(true);
  //   });

  //   emitter.on("end-match", (winningTeam: string) => {
  //     setMessageModal({
  //       is: true,
  //       question: `Game is over, ${winningTeam} player wins!, Would you like to start another game?`,
  //       onConfirm: () => {
  //         emitter.emit("restart-match");
  //         setMessageModal({});
  //       },
  //       onReject: () => {
  //         setMessageModal({});
  //       },
  //     });
  //   });
  //   //#endregion
  // }, []);

  return (
    <>
      {navbarOpen && (
        <Navbar
          onClose={() => setNavbarOpen(false)}
          items={[
            {
              text: "Home",
              path: "/",
            },
            {
              text: "Match",
              path: "/match",
            },
          ]}
          isLoggedIn={isAuthenticated}
          userItems={[
            {
              text: "Profile",
            },
            {
              text: "Edit Settings",
            },
          ]}
        />
      )}

      <Routes>
        <Route path="/" element={<Home openNavbar={setNavbarOpen} />} />
        <Route path="/match" element={<Matches openNavbar={setNavbarOpen} />} />
        <Route path="/game" element={<GameView />} />
        <Route path="profile/:id" element={<Profile data={userData!} />} />
      </Routes>
    </>
  );
};

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
