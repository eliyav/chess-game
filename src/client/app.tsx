import React, { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/loading-screen";
import { Home } from "./routes/home";
import { Lobby } from "./routes/lobby";
import { SceneManager } from "./components/scene-manager";
import { GameView } from "./routes/game-view";
import type { Socket } from "socket.io-client";

const App: React.FC<{
  websocket: Socket;
}> = ({ websocket }) => {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneManagerRef = useRef<SceneManager>();

  useEffect(() => {
    if (canvasRef.current && !sceneManagerRef.current) {
      sceneManagerRef.current = new SceneManager({
        canvas: canvasRef.current,
      });
      sceneManagerRef.current.init();
      setIsLoading(false);
    }
  }, [canvasRef.current]);

  return (
    <div id="app">
      <canvas ref={canvasRef}></canvas>
      {!isLoading ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby socket={websocket} />} />
          <Route
            path="/game"
            element={
              sceneManagerRef.current && (
                <GameView sceneManager={sceneManagerRef.current} />
              )
            }
          />
        </Routes>
      ) : (
        <div className="loadingContainer">
          <LoadingScreen text="..." />
        </div>
      )}
    </div>
  );
};

export default App;
