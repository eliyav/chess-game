import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "babylonjs";
import { Route, Routes, useLocation } from "react-router-dom";
import LoadingScreen from "./components/loading-screen";
import { useAuthentication } from "./hooks/use-authentication";
import { Home } from "./routes/home";
import { homeScene } from "./view/home-scene";
import { CustomGameScene } from "./view/game-assets";
import { Lobby } from "./routes/lobby";
import { Match } from "./components/match";
import { SceneManager } from "./components/scene-manager";

// const [currentUser, setCurrentUser] = useState<UserData>();
// const [socketConnection, setSocketConnection] = useState<any>();
// const [user, isAuthenticated] = useAuthentication(setCurrentUser);
// const location = useLocation();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManager = useRef<SceneManager>();
  //Create Scene Manager
  //Create Controller

  useEffect(() => {
    if (canvasRef.current && !sceneManager.current) {
      (async () => {
        sceneManager.current = new SceneManager(canvasRef.current!);
        await sceneManager.current.init();
        window.addEventListener("resize", () => sceneManager.current?.resize());
        setIsLoading(false);

        return () => {
          sceneManager.current?.stopRender();
          window.removeEventListener("resize", () =>
            sceneManager.current?.resize()
          );
        };

        //   const { gameScreen } = await import("./view/game-screen");
        //   sceneRef.current = await gameScreen(
        //     canvasRef.current!,
        //     engineRef.current!
      })();
    }
  }, [canvasRef.current]);

  return (
    <div id="app">
      <Routes>
        <Route
          path="/"
          element={isLoading ? <LoadingScreen text="..." /> : <Home />}
        />
        <Route path="/lobby" element={<Lobby />} />
        {/* <Route path="/match/offline-lobby" element={<OfflineLobby />} /> */}
        {/* <Rou
            path="/match/online-lobby"
            element={
              <OnlineLobby
                setSocket={setSocketConnection}
                userName={currentUser?.name}
              />
            }
          <Route
            path="/match/join-lobby"
            element={
              <JoinLobby
                setSocket={setSocketConnection}
                userName={currentUser?.name}
              />
            }
          /> */}
        {/* 

        </Route>
        <Route path="/offline-game" element={<OfflineGameView />} />
        <Route
          path="/online-game"
          element={
            <OnlineGameView location={location} socket={socketConnection} />
          }
        /> */}
      </Routes>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default App;

export interface UserData {
  [key: string]: string;
  picture: string;
  name: string;
}
