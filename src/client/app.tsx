import "@babylonjs/loaders/glTF";
import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import LoadingScreen from "./components/loading-screen";
import { Message, MessageModal } from "./components/modals/message-modal";
import { SceneManager } from "./components/scene-manager";
import { GameView } from "./routes/game-view";
import { Home } from "./routes/home";
import { LobbySelect } from "./routes/lobby";
import { OfflineLobby } from "./routes/offline-lobby";
import { OnlineLobby } from "./routes/online-lobby";

const App: React.FC<{
  websocket: Socket;
}> = ({ websocket }) => {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
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

  useEffect(() => {
    websocket.on("redirect", ({ message }) => {
      navigate("/");
      setMessage({
        text: message,
        onConfirm: () => {
          setMessage(null);
        },
      });
    });

    return () => {
      websocket.off("redirect");
    };
  }, [websocket, navigate, setMessage]);

  return (
    <div id="app">
      <canvas ref={canvas} style={{ backgroundColor: "black" }}></canvas>
      {message && (
        <MessageModal
          text={message.text}
          onConfirm={message.onConfirm}
          onReject={message.onReject}
        />
      )}
      {!isInitialized && <LoadingScreen text="..." />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/lobby"
          element={<LobbySelect setMessage={setMessage} />}
        />
        <Route path="/lobby-offline" element={<OfflineLobby />} />
        <Route
          path="/lobby-online"
          element={<OnlineLobby socket={websocket} />}
        />
        <Route
          path="/game"
          element={
            sceneManager.current ? (
              <GameView
                sceneManager={sceneManager.current}
                socket={websocket}
                setMessage={setMessage}
              />
            ) : null
          }
        />
      </Routes>
    </div>
  );
};

export default App;
