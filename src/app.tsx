import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoadingScreen from "./components/loading-screen";
import { useAuthentication } from "./hooks/use-authentication";
import { Home } from "./routes/home";
import { Lobby } from "./routes/lobby";
import { SceneManager } from "./components/scene-manager";
import { GameScreen } from "./routes/game-screen";

// const [currentUser, setCurrentUser] = useState<UserData>();
// const [socketConnection, setSocketConnection] = useState<any>();
// const [user, isAuthenticated] = useAuthentication(setCurrentUser);
// const location = useLocation();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManager = useRef<SceneManager>();

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
        <Route
          path="/game"
          element={<GameScreen sceneManager={sceneManager} />}
        />
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
