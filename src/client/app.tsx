import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import LoadingScreen from "./components/loading-screen";
import { Home } from "./routes/home";
import { Lobby } from "./routes/lobby";
import { SceneManager } from "./components/scene-manager";
import { GameView } from "./routes/game-view";
import type { Socket } from "socket.io-client";

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
      }).init();
      setIsInitialized(true);
    }
  }, [canvas.current, sceneManager.current]);

  return (
    <div id="app">
      <canvas ref={canvas} style={{ backgroundColor: "black" }}></canvas>
      {!isInitialized && <LoadingScreen text="..." />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby socket={websocket} />} />
          <Route
            path="/game"
            element={<GameView sceneManager={sceneManager.current} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
