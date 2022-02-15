import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "./component/navbar";
import { Home } from "./component/routes/home";
import { Matches } from "./component/routes/match";
import { OfflineGameView } from "./component/routes/offline-game-view";
import { UserData } from "./app";
import { Profile } from "./component/routes/profile";
import { OfflineMatch } from "./component/routes/offline-match";
import { OnlineMatch } from "./component/routes/online-match";

interface ContentProps {
  userData: UserData | undefined;
}

export const Content: React.VFC<ContentProps> = ({ userData }) => {
  const { isAuthenticated } = useAuth0();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [socketConnection, setSocketConnection] = useState<any>();

  // const location = useLocation();
  // const params = new URLSearchParams(location.search);
  // console.log(params.get("mode"));
  // const matchRoute = useMatch("/match/room");
  // console.log(matchRoute);
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
        <Route path="/match" element={<Matches openNavbar={setNavbarOpen} />}>
          <Route path="/match/offline" element={<OfflineMatch />} />
          <Route
            path="/match/online-lobby"
            element={
              <OnlineMatch
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
          element={<OfflineGameView openNavbar={setNavbarOpen} />}
        />
        <Route path="profile/:id" element={<Profile data={userData!} />} />
      </Routes>
    </>
  );
};
