import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LOBBY_TYPE, Lobby, PlayerType, createLobby } from "../../shared/match";
import { APP_ROUTES } from "../../shared/routes";
import { FooterOverlay } from "../components/game-overlay/footer-overlay";
import HeaderOverlay from "../components/game-overlay/header-overlay";
import { Message } from "../components/modals/message-modal";
import {
  CameraIcon,
  HomeIcon,
  RestartIcon,
  UndoIcon,
} from "../components/svg/game-overlay-icons";
import { BaseMatch } from "../match-logic/base-match";
import { Controller } from "../match-logic/controller";

export const Game: React.FC<{
  setLobby: React.Dispatch<React.SetStateAction<Lobby | undefined>>;
  controller: Controller | undefined;
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  controllerState: ReturnType<BaseMatch["state"]> | null;
}> = ({ controller, controllerState, setLobby, setMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const type = new URLSearchParams(location.search).get("type");
    const vs = new URLSearchParams(location.search).get(
      "vs"
    ) as PlayerType | null;
    const depth = new URLSearchParams(location.search).get("depth");
    const time = new URLSearchParams(location.search).get("time");
    if (type === LOBBY_TYPE.ONLINE) {
      if (!controller?.match?.lobby) {
        setMessage({
          text: "Rejoining not supported (soon)",
          onConfirm: () => setMessage(null),
        });
        navigate(APP_ROUTES.Home);
        return;
      }
    } else {
      if (!controller?.match?.lobby) {
        const newLobby = createLobby({
          type: LOBBY_TYPE.LOCAL,
          vs,
          depth,
          time,
        });
        setLobby(newLobby);
        const searchParams = new URLSearchParams(location.search);
        if (newLobby.players[1].type === "computer") {
          searchParams.set("vs", vs || newLobby.players[1].type);
          searchParams.set("type", newLobby.mode);
          searchParams.set("depth", String(newLobby.players[1].depth));
          searchParams.set("time", String(newLobby.time));
        }
        navigate(`${location.pathname}?${searchParams.toString()}`);
      }
    }
  }, [location]);

  useEffect(() => {
    controller?.start();
    return () => controller?.cleanup();
  }, [controller]);

  if (controller) {
    return (
      <div>
        <HeaderOverlay
          items={[
            {
              text: "home",
              onClick: () => controller.leaveMatch(),
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
          className={
            "z-10 absolute select-none top-0 w-full bg-transparent text-center"
          }
        />
        <FooterOverlay
          players={controller.match.lobby.players}
          controllerState={controllerState}
          className={
            "z-10 absolute select-none bottom-0 w-full bg-transparent text-center"
          }
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-transparent rounded-full"></div>
    </div>
  );
};
