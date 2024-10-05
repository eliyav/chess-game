import "@babylonjs/loaders/glTF";
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Lobby, LOBBY_TYPE } from "../shared/match";
import { APP_ROUTES } from "../shared/routes";
import { Message, MessageModal } from "./components/modals/message-modal";
import { Game } from "./routes/game";
import { Home } from "./routes/home";
import { LobbySelect } from "./routes/lobby-select";
import NotFound from "./routes/not-found";
import { OfflineLobby } from "./routes/offline-lobby";
import { OnlineLobby } from "./routes/online-lobby";
import { type SceneManager } from "./scenes/scene-manager";
import { websocket } from "./websocket-client";

const App: React.FC<{ sceneManager: SceneManager }> = ({ sceneManager }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lobby, setLobby] = useState<Lobby>();
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    sceneManager.switchScene(location.pathname as APP_ROUTES);
  }, [location]);

  useEffect(() => {
    //If the user is in an online lobby and navigates away from the page without match having started, leave the lobby
    if (
      lobby &&
      lobby.mode === LOBBY_TYPE.ONLINE &&
      location.pathname !== APP_ROUTES.OnlineLobby &&
      !lobby.matchStarted
    ) {
      websocket.emit("leaveLobby", { lobbyKey: lobby.key });
      setLobby(undefined);
    }
  }, [location.pathname, lobby, setLobby]);

  useEffect(() => {
    websocket.on("opponentDisconnected", () => {
      navigate(APP_ROUTES.Home);
      setLobby(undefined);
      setMessage({
        text: "Opponent has left the match",
        onConfirm: () => {
          setMessage(null);
        },
      });
    });

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
      websocket.off("opponentDisconnected");
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
            lobby !== undefined ? (
              <Game
                sceneManager={sceneManager}
                lobby={lobby}
                setMessage={setMessage}
              />
            ) : null
          }
        />
        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
