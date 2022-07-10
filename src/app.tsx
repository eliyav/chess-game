import * as BABYLON from "babylonjs";
import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoadingScreen from "./component/loading-screen";
import { useAuthentication } from "./hooks/use-authentication";
import { Home } from "./routes/home";
import { JoinLobby } from "./routes/join-match";
import { Matches } from "./routes/matches";
import { OfflineGameView } from "./routes/offline-game-view";
import { OfflineLobby } from "./routes/offline-lobby";
import { OnlineGameView } from "./routes/online-game-view";
import { OnlineLobby } from "./routes/online-lobby";
import { displayScreen } from "./view/display-screen";

const App: React.FC = () => {
  const [isInitDone, setIsInitDone] = useState(false);
  const [loadingScreen, setloadingScreen] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserData>();
  const [socketConnection, setSocketConnection] = useState<any>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();
  const [user, isAuthenticated] = useAuthentication(setCurrentUser);

  useEffect(() => {
    if (isInitDone) {
      let engine = new BABYLON.Engine(canvasRef.current, true);
      (async () => {
        const displayScene = await displayScreen(engine);
        engine.runRenderLoop(() => {
          displayScene.render();
          engine.resize();
        });
        setTimeout(() => setloadingScreen(false), 1000);
      })();
      return () => engine.stopRenderLoop();
    }
    setIsInitDone(true);
  }, [isInitDone]);

  return (
    <div id="app">
      <canvas ref={canvasRef} className="displayCanvas screen"></canvas>
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
                userName={currentUser!.name}
              />
            }
          />
          <Route
            path="/match/join-lobby"
            element={
              <JoinLobby
                setSocket={setSocketConnection}
                userName={currentUser!.name}
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
