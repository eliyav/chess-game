import "@babylonjs/loaders/glTF";
import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Lobby } from "../shared/match";
import { APP_ROUTES } from "../shared/routes";
import LoadingScreen from "./components/loading-screen";
import { Message, MessageModal } from "./components/modals/message-modal";
import { Game } from "./routes/game";
import { Home } from "./routes/home";
import { LobbySelect } from "./routes/lobby-select";
import { OfflineLobby } from "./routes/offline-lobby";
import { OnlineLobby } from "./routes/online-lobby";
import { createSceneManager, type SceneManager } from "./scenes/scene-manager";
import { websocket } from "./websocket-client";

const App: React.FC<{ canvas: HTMLCanvasElement }> = ({ canvas }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const [lobby, setLobby] = useState<Lobby>();
  const [message, setMessage] = useState<Message | null>(null);
  const sceneManager = useRef<SceneManager>();
  const canGameViewRender =
    sceneManager.current !== undefined && lobby !== undefined;

  useEffect(() => {
    if (!sceneManager.current) {
      createSceneManager(canvas).then((manager) => {
        sceneManager.current = manager;
        setIsInitialized(true);
      });
    }
  }, [canvas, setIsInitialized]);

  useEffect(() => {
    sceneManager.current?.switchScene(location.pathname as APP_ROUTES);
  }, [location]);

  useEffect(() => {
    websocket.on("lobbyInfo", (lobby: Lobby) => {
      setLobby(lobby);
    });

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
      websocket.off("lobbyInfo");
    };
  }, [websocket, navigate, setMessage, setLobby]);

  return (
    <div id="app">
      {message && (
        <MessageModal
          text={message.text}
          onConfirm={message.onConfirm}
          onReject={message.onReject}
        />
      )}
      {!isInitialized && <LoadingScreen text="Loading..." />}
      <Routes>
        <Route path={APP_ROUTES.Home} element={<Home />} />
        <Route
          path={APP_ROUTES.Lobby}
          element={<LobbySelect setMessage={setMessage} />}
        />
        <Route
          path={APP_ROUTES.OfflineLobby}
          element={<OfflineLobby setLobby={setLobby} lobby={lobby} />}
        />
        <Route
          path={APP_ROUTES.OnlineLobby}
          element={<OnlineLobby lobby={lobby} />}
        />
        <Route
          path={APP_ROUTES.Game}
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
