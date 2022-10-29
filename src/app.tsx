import React, { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/loading-screen";
import { Home } from "./routes/home";
import { Lobby } from "./routes/lobby";
import { SceneManager } from "./components/scene-manager";
import { GameScreen } from "./routes/game-screen";
import { Match } from "./components/match";
import { Controller } from "./components/match-logic/controller";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManagerRef = useRef<SceneManager>();
  const controllerRef = useRef(new Controller());
  const matchRef = useRef(new Match());

  useEffect(() => {
    if (canvasRef.current && !sceneManagerRef.current) {
      (async () => {
        sceneManagerRef.current = new SceneManager(canvasRef.current!);
        await sceneManagerRef.current.init();
        setIsLoading(false);

        return () => sceneManagerRef.current?.stopRender();
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
          element={
            sceneManagerRef.current ? (
              <GameScreen
                sceneManager={sceneManagerRef.current}
                match={matchRef.current}
                controller={controllerRef.current}
              />
            ) : (
              <div className="loadingContainer">
                <LoadingScreen text="..." />
              </div>
            )
          }
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

// function endMatch() {

//   const winningTeam =
//     match.matchDetails.player.id === match.matchDetails.teams[0]
//       ? match.matchDetails.teams[1]
//       : match.matchDetails.teams[0];
//   matchControl.emit("end-match", winningTeam);
// }

// const [currentUser, setCurrentUser] = useState<UserData>();
// const [socketConnection, setSocketConnection] = useState<any>();
// const [user, isAuthenticated] = useAuthentication(setCurrentUser);
// const location = useLocation();
