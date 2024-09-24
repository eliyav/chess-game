import "@babylonjs/loaders/glTF";
import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Lobby } from "../shared/match";
import LoadingScreen from "./components/loading-screen";
import { Message, MessageModal } from "./components/modals/message-modal";
import { SceneManager } from "./scenes/scene-manager";
import { Game } from "./routes/game";
import { Home } from "./routes/home";
import { LobbySelect } from "./routes/lobby-select";
import { OfflineLobby } from "./routes/offline-lobby";
import { OnlineLobby } from "./routes/online-lobby";
import { websocket } from "./websocket-client";
import { AppRoutes } from "../shared/routes";

const App: React.FC<{}> = () => {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const [lobby, setLobby] = useState<Lobby>();
  const [message, setMessage] = useState<Message | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sceneManager = useRef<SceneManager>();
  const canGameViewRender =
    sceneManager.current !== undefined && lobby !== undefined;

  useEffect(() => {
    if (!sceneManager.current) {
      sceneManager.current = new SceneManager({
        canvas: canvas.current!,
        setInitialized: () => setIsInitialized(true),
      });
    }
  }, [canvas.current, setIsInitialized]);

  useEffect(() => {
    websocket.on("lobbyInfo", (lobby: Lobby) => {
      setLobby(lobby);
    });

    return () => {
      websocket.off("lobbyInfo");
    };
  }, [websocket, setLobby]);

  useEffect(() => {
    websocket.on("redirect", ({ path, message }) => {
      navigate(path);
      if (message) {
        setMessage({
          text: message,
          onConfirm: () => {
            setMessage(null);
          },
        });
      }
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
        <Route path={AppRoutes.Home} element={<Home />} />
        <Route
          path={AppRoutes.Lobby}
          element={<LobbySelect setMessage={setMessage} />}
        />
        <Route
          path={AppRoutes.OfflineLobby}
          element={<OfflineLobby setLobby={setLobby} lobby={lobby} />}
        />
        <Route
          path={AppRoutes.OnlineLobby}
          element={<OnlineLobby lobby={lobby} />}
        />
        <Route
          path={AppRoutes.Game}
          element={
            canGameViewRender ? (
              <Game
                sceneManager={sceneManager.current!}
                lobby={lobby}
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
