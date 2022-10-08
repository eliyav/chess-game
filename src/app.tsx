import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "babylonjs";
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
import { CustomGameScene } from "./view/game-assets";

// const [currentUser, setCurrentUser] = useState<UserData>();
// const [socketConnection, setSocketConnection] = useState<any>();
// const [user, isAuthenticated] = useAuthentication(setCurrentUser);
// const location = useLocation();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRendered = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<BABYLON.Engine>();
  const scene = useRef<CustomGameScene>();

  useEffect(() => {
    if (canvasRef.current) {
      if (!canvasRendered.current) {
        (async () => {
          canvasRendered.current = true;
          engine.current = new BABYLON.Engine(canvasRef.current, true);
          scene.current = await displayScreen(engine.current);

          engine.current.runRenderLoop(() => {
            scene.current!.render();
          });

          window.addEventListener("resize", () => engine.current!.resize());
          setIsLoading(false);

          return () => {
            engine.current!.stopRenderLoop();
            window.removeEventListener("resize", () =>
              engine.current!.resize()
            );
          };

          //   const { gameScreen } = await import("./view/game-screen");
          //   sceneRef.current = await gameScreen(
          //     canvasRef.current!,
          //     engineRef.current!
        })();
      }
    }
  }, [canvasRef.current]);

  return (
    <div id="app">
      <canvas ref={canvasRef} className="canvasDisplay screen"></canvas>
      <Routes>
        <Route
          path="/"
          element={isLoading ? <LoadingScreen text="..." /> : <Home />}
        />
        {/* <Route path="/match" element={<Matches />}>
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
        /> */}
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
