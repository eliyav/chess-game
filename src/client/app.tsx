import "@babylonjs/loaders/glTF";
import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import type { Socket } from "socket.io-client";
import LoadingScreen from "./components/loading-screen";
import { SceneManager } from "./components/scene-manager";
import { GameView } from "./routes/game-view";
import { Home } from "./routes/home";
import { LobbySelect } from "./routes/lobby";
import { OfflineLobby } from "./routes/offline-lobby";
import { OnlineLobby } from "./routes/online-lobby";

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
