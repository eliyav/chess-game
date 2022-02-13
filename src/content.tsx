import React, { useState } from "react";
import { Route, Routes, useLocation, useMatch } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Navbar } from "./component/navbar";
import { Home } from "./component/routes/home";
import { Matches } from "./component/routes/match";
import { GameView } from "./component/game-view";
import { UserData } from "./app";
import { Profile } from "./component/routes/profile";
import { Room } from "./component/routes/room";

interface ContentProps {
  userData: UserData | undefined;
}

export const Content: React.VFC<ContentProps> = ({ userData }) => {
  const { isAuthenticated } = useAuth0();
  const [navbarOpen, setNavbarOpen] = useState(false);

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
          <Route path="/match/room" element={<Room />} />
        </Route>
        <Route path="/game" element={<GameView />} />
        <Route path="profile/:id" element={<Profile data={userData!} />} />
      </Routes>
    </>
  );
};
