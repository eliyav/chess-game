import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Home } from "./routes/home";
import { Matches } from "./routes/matches";
import { UserData } from "./app";
import { Profile } from "./routes/profile";
import { OfflineLobby } from "./routes/offline-lobby";
import { OnlineLobby } from "./routes/online-lobby";
import { JoinLobby } from "./routes/join-match";
import { OfflineGameView } from "./routes/offline-game-view";
import { OnlineGameView } from "./routes/online-game-view";

interface ContentProps {
  userData: UserData | undefined;
}

export const Content: React.FC<ContentProps> = ({ userData }) => {
  const location = useLocation();
  const [socketConnection, setSocketConnection] = useState<any>();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/match" element={<Matches />}>
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
        <Route path="/offline-game" element={<OfflineGameView />} />
        <Route
          path="/online-game"
          element={
            <OnlineGameView location={location} socket={socketConnection} />
          }
        />
        <Route path="profile/:id" element={<Profile data={userData!} />} />
      </Routes>
    </>
  );
};
