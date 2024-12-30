import "@babylonjs/loaders/glTF";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Lobby, LOBBY_TYPE } from "../shared/match";
import { APP_ROUTES } from "../shared/routes";
import { getSettings } from "../shared/settings";
import LoadingScreen from "./components/loading-screen";
import { Message, MessageModal } from "./components/modals/message-modal";
import { BaseMatch } from "./match-logic/base-match";
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

const App: React.FC<{ sceneManager: SceneManager }> = ({ sceneManager }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lobby, setLobby] = useState<Lobby>();
  const [message, setMessage] = useState<Message | null>(null);
  const [settings, setSettings] = useState(getSettings());
  const [loading, setLoading] = useState(false);
  const [controllerState, setControllerState] = useState<ReturnType<
    BaseMatch["state"]
  > | null>(null);

  const updateOptions = useCallback(
    <KEY extends keyof typeof settings>(
      key: KEY,
      value: (typeof settings)[KEY]
    ) => {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setSettings]
  );

  const match = useMemo(() => {
    if (!lobby) return undefined;
    return lobby.mode === LOBBY_TYPE.LOCAL
      ? new LocalMatch({
          lobby,
          player: lobby.players[0],
          onTimeUpdate,
          onTimeEnd,
        })
      : new OnlineMatch({
          lobby,
          player: lobby.players.find((player) => player.id === websocket.id)!,
          onTimeUpdate,
          onTimeEnd,
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
        updateState: (state) => setControllerState(state),
      },
      settings,
    });
  }, [match, sceneManager, navigate]);

  function onTimeUpdate() {
    const state = match?.state();
    if (!state) return;
    setControllerState(state);
  }

  function onTimeEnd() {
    match?.endMatch("time");
    const player = match?.getCurrentTeam();
    setMessage({
      text: `${player} ran out of time!`,
      onConfirm: () => {
        setMessage(null);
      },
    });
  }

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
              options={settings}
              updateOptions={updateOptions}
            />
          }
        />
        <Route
          path={APP_ROUTES.OnlineLobby}
          element={
            <OnlineLobby
              lobby={lobby}
              options={settings}
              updateOptions={updateOptions}
              setMessage={setMessage}
            />
          }
        />
        <Route
          path={APP_ROUTES.Game}
          element={
            <Game
              setLobby={setLobby}
              controller={controller}
              setMessage={setMessage}
              controllerState={controllerState}
            />
          }
        />
        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
