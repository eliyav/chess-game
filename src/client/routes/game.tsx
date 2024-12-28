import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LOBBY_TYPE, Lobby, PlayerType, createLobby } from "../../shared/match";
import { APP_ROUTES } from "../../shared/routes";
import { GameOverlay } from "../components/game-overlay/game-overlay";
import { Message } from "../components/modals/message-modal";
import { Controller } from "../match-logic/controller";
import { createLocalEvents, createOnlineEvents } from "../match-logic/events";
import {
  CameraIcon,
  HomeIcon,
  RestartIcon,
  UndoIcon,
} from "../components/svg/game-overlay-icons";

export const Game: React.FC<{
  lobby: Lobby | undefined;
  setLobby: React.Dispatch<React.SetStateAction<Lobby | undefined>>;
  controller: Controller | undefined;
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}> = ({ controller, lobby, setLobby, setMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [info, setInfo] = React.useState<ReturnType<Controller["info"]> | null>(
    null
  );

  useEffect(() => {
    const type = new URLSearchParams(location.search).get("type");
    const vs = new URLSearchParams(location.search).get(
      "vs"
    ) as PlayerType | null;
    const depth = new URLSearchParams(location.search).get("depth");
    if (type === LOBBY_TYPE.ONLINE) {
      if (!lobby) {
        setMessage({
          text: "Rejoining not supported (soon)",
          onConfirm: () => setMessage(null),
        });
        navigate(APP_ROUTES.Home);
        return;
      }
    } else {
      if (!lobby) {
        const newLobby = createLobby({ type: LOBBY_TYPE.LOCAL, vs, depth });
        setLobby(newLobby);
        const searchParams = new URLSearchParams(location.search);
        if (newLobby.players[1].type === "Computer") {
          searchParams.set("vs", vs || newLobby.players[1].type);
          searchParams.set("type", newLobby.mode);
          searchParams.set("depth", String(newLobby.players[1].depth));
        }
        navigate(`${location.pathname}?${searchParams.toString()}`);
      }
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
      const interval = setInterval(() => {
        setInfo(controller.info());
      }, 1000);

      return () => {
        controller.match.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [controller]);

  return (
    <>
      {controller && lobby ? (
        <GameOverlay
          headerItems={[
            {
              text: "home",
              onClick: () => controller.leaveMatch({ key: lobby.key }),
              children: <HomeIcon className="w-6 h-6 bg-transparent m-auto" />,
            },
            {
              text: "restart",
              onClick: () => controller.requestMatchReset(),
              children: (
                <RestartIcon className="w-6 h-6 bg-transparent m-auto" />
              ),
            },
            {
              text: "undo",
              onClick: () => controller.requestUndoTurn(),
              children: <UndoIcon className="w-6 h-6 bg-transparent m-auto" />,
            },
            {
              text: "camera",
              onClick: () => controller.resetCamera(),
              children: (
                <CameraIcon className="w-6 h-6 bg-transparent m-auto" />
              ),
            },
          ]}
          lobby={lobby}
          info={info}
        />
      ) : (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-transparent rounded-full"></div>
        </div>
      )}
    </>
  );
};
