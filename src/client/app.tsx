import "@babylonjs/loaders/glTF";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  buildDefaultOptions,
  ControllerOptions,
  Lobby,
  LOBBY_TYPE,
} from "../shared/match";
import { APP_ROUTES } from "../shared/routes";
import { Message, MessageModal } from "./components/modals/message-modal";
import { Controller } from "./match-logic/controller";
import { LocalMatch } from "./match-logic/local-match";
import { OnlineMatch } from "./match-logic/online-match";
import { Game } from "./routes/game";
import { Home } from "./routes/home";
import { LobbySelect } from "./routes/lobby-select";
import NotFound from "./routes/not-found";
import { OfflineLobby } from "./routes/offline-lobby";
import { OnlineLobby } from "./routes/online-lobby";
import { type SceneManager } from "./scenes/scene-manager";
import { websocket } from "./websocket-client";
import LoadingScreen from "./components/loading-screen";

const App: React.FC<{ sceneManager: SceneManager }> = ({ sceneManager }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lobby, setLobby] = useState<Lobby>();
  const [message, setMessage] = useState<Message | null>(null);
  const [options, setOptions] = useState(buildDefaultOptions());
  const [loading, setLoading] = useState(false);

  const updateOptions = useCallback(
    <KEY extends keyof ControllerOptions>(
      key: KEY,
      value: ControllerOptions[KEY]
    ) => {
      setOptions((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setOptions]
  );

  const match = useMemo(() => {
    if (!lobby) return undefined;
    return lobby.mode === LOBBY_TYPE.LOCAL
      ? new LocalMatch({ lobby, player: lobby.players[0] })
      : new OnlineMatch({
          lobby,
          player: lobby.players.find((player) => player.id === websocket.id)!,
        });
  }, [lobby]);

  const controller = useMemo(() => {
    if (!match || !lobby) return undefined;
    return new Controller({
      sceneManager,
      match,
      events: {
        setMessage: (message: Message | null) => setMessage(message),
        navigate: (route: APP_ROUTES) => navigate(route),
      },
      options,
    });
  }, [match, sceneManager, navigate]);

  useEffect(() => {
    sceneManager.switchScene(location.pathname as APP_ROUTES);
  }, [location]);

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
      if (lobby.matchStarted) {
        navigate(`${APP_ROUTES.Game}?key=${lobby.key}&type=${lobby.mode}`);
        setMessage({
          text: "Match has started!",
          onConfirm: () => {
            setMessage(null);
          },
        });
      }
    });

    websocket.on("redirect", ({ path, message, search }) => {
      if (search) {
        const searchParams = new URLSearchParams();
        Object.entries(search).forEach(([key, value]) => {
          searchParams.append(key, value);
        });
        navigate(`${path}?${searchParams.toString()}`);
      } else {
        navigate(path);
      }
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
    <>
      {loading && <LoadingScreen />}
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
          element={
            <LobbySelect setMessage={setMessage} setLoading={setLoading} />
          }
        />
        <Route
          path={APP_ROUTES.OfflineLobby}
          element={
            <OfflineLobby
              setLobby={setLobby}
              lobby={lobby}
              options={options}
              updateOptions={updateOptions}
            />
          }
        />
        <Route
          path={APP_ROUTES.OnlineLobby}
          element={
            <OnlineLobby
              lobby={lobby}
              options={options}
              updateOptions={updateOptions}
            />
          }
        />
        <Route
          path={APP_ROUTES.Game}
          element={
            <Game lobby={lobby} setLobby={setLobby} controller={controller} />
          }
        />
        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
