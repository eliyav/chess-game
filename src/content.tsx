import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "./component/navbar";
import { Home } from "./component/routes/home";
import { Matches } from "./component/routes/matches";
import { UserData } from "./app";
import { Profile } from "./component/routes/profile";
import { OfflineLobby } from "./component/routes/offline-lobby";
import { OnlineLobby } from "./component/routes/online-lobby";
import { JoinLobby } from "./component/routes/join-match";
import { OfflineGameView } from "./component/routes/offline-game-view";
import { OnlineGameView } from "./component/routes/online-game-view";

interface ContentProps {
  userData: UserData | undefined;
}

export const Content: React.VFC<ContentProps> = ({ userData }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth0();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [socketConnection, setSocketConnection] = useState<any>();

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
              path: "/profile",
            },
            {
              text: "Edit Settings",
              path: "/user-settings",
            },
          ]}
        />
      )}

      <Routes>
        <Route path="/" element={<Home openNavbar={setNavbarOpen} />} />
        <Route
          path="/match"
          element={<Matches location={location} openNavbar={setNavbarOpen} />}
        >
          <Route path="/match/offline-lobby" element={<OfflineLobby />} />
          <Route
            path="/match/online-lobby"
            element={
              <OnlineLobby
                setSocket={setSocketConnection}
                userName={userData?.name}
              />
            }
          />
          <Route
            path="/match/join-lobby"
            element={
              <JoinLobby
                setSocket={setSocketConnection}
                userName={userData?.name}
              />
            }
          />
        </Route>
        <Route
          path="/offline-game"
          element={<OfflineGameView openNavbar={setNavbarOpen} />}
        />
        <Route
          path="/online-game"
          element={
            <OnlineGameView
              location={location}
              socket={socketConnection}
              openNavbar={setNavbarOpen}
            />
          }
        />
        <Route path="profile/:id" element={<Profile data={userData!} />} />
      </Routes>
    </>
  );
};
