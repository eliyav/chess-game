import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import LoadingScreen from "./components/loading-screen";
import { Home } from "./routes/home";
import { LobbySelect } from "./routes/lobby";
import { SceneManager } from "./components/scene-manager";
import { GameView } from "./routes/game-view";
import type { Socket } from "socket.io-client";
import { OfflineLobby } from "./components/lobbys/offline-lobby";
import { OnlineLobby } from "./components/lobbys/online-lobby";
import "@babylonjs/loaders/glTF";

const App: React.FC<{
  websocket: Socket;
}> = ({ websocket }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sceneManager = useRef<SceneManager>();

  useEffect(() => {
    if (canvas.current && !sceneManager.current) {
      sceneManager.current = new SceneManager({
        canvas: canvas.current,
        setInitialized: () => setIsInitialized(true),
      });
    }
  }, [canvas.current, setIsInitialized]);

  return (
    <div id="app">
      <canvas ref={canvas} style={{ backgroundColor: "black" }}></canvas>
      {!isInitialized && <LoadingScreen text="..." />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<LobbySelect />} />
          <Route path="/lobby-offline" element={<OfflineLobby />} />
          <Route
            path="/lobby-online"
            element={<OnlineLobby socket={websocket} />}
          />
          <Route
            path="/game"
            element={
              sceneManager.current ? (
                <GameView sceneManager={sceneManager.current} />
              ) : null
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
