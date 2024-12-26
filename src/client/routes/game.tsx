import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LOBBY_TYPE, Lobby, PlayerType, createLobby } from "../../shared/match";
import { GameOverlay } from "../components/game-overlay/game-overlay";
import * as icons from "../components/game-overlay/overlay-icons";
import { Controller } from "../match-logic/controller";
import { createLocalEvents, createOnlineEvents } from "../match-logic/events";
import { websocket } from "../websocket-client";
import { APP_ROUTES } from "../../shared/routes";

export const Game: React.FC<{
  lobby: Lobby | undefined;
  setLobby: React.Dispatch<React.SetStateAction<Lobby | undefined>>;
  controller: Controller | undefined;
}> = ({ controller, lobby, setLobby }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const key = new URLSearchParams(location.search).get("key");
    const type = new URLSearchParams(location.search).get("type");
    const vs = new URLSearchParams(location.search).get(
      "vs"
    ) as PlayerType | null;
    const depth = new URLSearchParams(location.search).get("depth");
    console.log(lobby);
    if (!lobby) {
      if (type === LOBBY_TYPE.ONLINE) {
        if (key) {
          websocket.emit("rejoinMatch", { lobbyKey: key });
        } else {
          navigate(APP_ROUTES.Home);
        }
      } else {
        const newLobby = createLobby({ type: LOBBY_TYPE.LOCAL, vs, depth });
        setLobby(newLobby);
      }
    } else {
      console.log("lobby already exists");
    }
  }, [location]);

  useEffect(() => {
    if (controller) {
      if (controller.match.mode === LOBBY_TYPE.LOCAL) {
        const events = createLocalEvents({ controller });
        controller.match.subscribe(events);
      } else {
        const onlineEvents = createOnlineEvents({ controller });
        controller.match.subscribe(onlineEvents);
      }
      return () => {
        controller.match.unsubscribe();
      };
    }
  }, [controller]);

  return (
    <>
      {controller && lobby ? (
        <GameOverlay
          items={[
            {
              text: "home",
              onClick: () => controller.leaveMatch({ key: lobby.key }),
            },
            {
              text: "restart",
              onClick: () => controller.requestMatchReset(),
            },
            {
              text: "undo",
              onClick: () => controller.requestUndoTurn(),
            },
            {
              text: "camera",
              onClick: () => controller.resetCamera(),
            },
            // {
            //   text: "pause",
            //   onClick: () => match.timer.toggleTimer(),
            // },
          ]}
          icons={icons}
          lobby={lobby}
        />
      ) : (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-transparent rounded-full"></div>
        </div>
      )}
    </>
  );
};

export type IconsIndex = typeof icons;
