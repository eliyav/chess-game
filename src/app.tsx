import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoadingScreen from "./component/loading-screen";
import { useAuthentication } from "./hooks/use-authentication";
import { useCanvasRender } from "./hooks/use-canvas-render";
import { Home } from "./routes/home";
import { JoinLobby } from "./routes/join-match";
import { Matches } from "./routes/matches";
import { OfflineGameView } from "./routes/offline-game-view";
import { OfflineLobby } from "./routes/offline-lobby";
import { OnlineGameView } from "./routes/online-game-view";
import { OnlineLobby } from "./routes/online-lobby";

const App: React.FC = () => {
  const [canvasGameMode, setCanvasGameMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData>();
  const [socketConnection, setSocketConnection] = useState<any>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingScreen] = useCanvasRender(canvasRef.current, canvasGameMode);
  const [user, isAuthenticated] = useAuthentication(setCurrentUser);
  const location = useLocation();

  return (
    <div id="app">
      <canvas ref={canvasRef} className="canvasDisplay screen"></canvas>
      <Routes>
        <Route
          path="/"
          element={loadingScreen ? <LoadingScreen text="..." /> : <Home />}
        />
        <Route path="/match" element={<Matches />}>
          <Route path="/match/offline-lobby" element={<OfflineLobby />} />
          <Route
            path="/match/online-lobby"
            element={
              <OnlineLobby
                setSocket={setSocketConnection}
                userName={currentUser?.name}
              />
            }
          />
          <Route
            path="/match/join-lobby"
            element={
              <JoinLobby
                setSocket={setSocketConnection}
                userName={currentUser?.name}
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
      </Routes>
    </div>
  );
};

export default App;

export interface UserData {
  [key: string]: string;
  picture: string;
  name: string;
}
