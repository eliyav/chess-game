import "@babylonjs/loaders/glTF";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Lobby } from "../shared/match";
import { APP_ROUTES } from "../shared/routes";
import { getSettings } from "../shared/settings";
import LoadingScreen from "./components/loading-screen";
import { Message, MessageModal } from "./components/modals/message-modal";
import { handleLocation } from "./handleLocation";
import { BaseMatch } from "./match-logic/base-match";
import { Controller } from "./match-logic/controller";
import { createMatchContext } from "./match-logic/create-match-context";
import { Game } from "./routes/game";
import { Home } from "./routes/home";
import { LobbySelect } from "./routes/lobby-select";
import NotFound from "./routes/not-found";
import { type SceneManager } from "./scenes/scene-manager";
import { websocket } from "./websocket-client";
import { LobbyView } from "./routes/lobby-view";

const App: React.FC<{ sceneManager: SceneManager }> = ({ sceneManager }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lobby, setLobby] = useState<Lobby>();
  const [message, setMessage] = useState<Message | null>(null);
  const [settings, setSettings] = useState(getSettings());
  const [loading, setLoading] = useState(false);
  const [matchInfo, setMatchInfo] = useState<ReturnType<BaseMatch["state"]>>();

  const match = useMemo(() => {
    if (!lobby) return undefined;
    function onTimeUpdate() {
      const state = controller.match?.state();
      if (!state) return;
      setMatchInfo(state);
    }
    function onTimeEnd() {
      controller.match?.endMatch("time");
      const player = controller.match?.getCurrentTeam();
      controller.events.setMessage({
        text: `${player} ran out of time!`,
        onConfirm: () => {
          controller.setMessage(null);
        },
      });
    }
    const player =
      lobby.players.find((player) => player.id === websocket.id)! ||
      lobby.players[0];
    return createMatchContext({
      lobby,
      player,
      onTimeUpdate,
      onTimeEnd,
    });
  }, [lobby]);

  const controller = useMemo(() => {
    return new Controller({
      sceneManager,
      match,
      events: {
        setMessage: (message: Message | null) => setMessage(message),
        navigate: (route: APP_ROUTES) => navigate(route),
        setMatchInfo: (state) => setMatchInfo(state),
      },
      settings,
    });
  }, [match, sceneManager, navigate, setMatchInfo, setMessage, settings]);

  useEffect(() => {
    handleLocation(lobby, setLobby, location, controller, navigate);
  }, [location]);

  const updateSettings = useCallback(
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

  useEffect(() => {
    sceneManager.switchScene(location.pathname as APP_ROUTES);
  }, [location]);

  useEffect(() => {
    websocket.on("opponentDisconnected", () => {
      navigate(APP_ROUTES.HOME);
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
        navigate(`${APP_ROUTES.GAME}?key=${lobby.key}&type=${lobby.mode}`);
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
        <Route path={APP_ROUTES.HOME} element={<Home />} />
        <Route
          path={APP_ROUTES.LOBBY_SELECT}
          element={
            <LobbySelect setMessage={setMessage} setLoading={setLoading} />
          }
        />
        <Route
          path={APP_ROUTES.LOBBY}
          element={
            <LobbyView
              setLobby={setLobby}
              lobby={lobby}
              settings={settings}
              updateSettings={updateSettings}
            />
          }
        />
        <Route
          path={APP_ROUTES.GAME}
          element={<Game matchInfo={matchInfo} controller={controller} />}
        />
        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
