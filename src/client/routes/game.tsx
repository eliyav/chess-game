import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LOBBY_TYPE, Lobby } from "../../shared/match";
import { APP_ROUTES } from "../../shared/routes";
import { MenuOverlay } from "../components/game-overlay/menu-overlay";
import * as icons from "../components/game-overlay/overlay-icons";
import { Message } from "../components/modals/message-modal";
import { Controller } from "../match-logic/controller";
import { LocalMatch } from "../match-logic/local-match";
import { OnlineMatch } from "../match-logic/online-match";
import { SceneManager } from "../scenes/scene-manager";
import { websocket } from "../websocket-client";

export const Game: React.FC<{
  sceneManager: SceneManager;
  lobby: Lobby;
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}> = ({ sceneManager, setMessage, lobby }) => {
  const navigate = useNavigate();
  const match = useRef(
    lobby.mode === LOBBY_TYPE.LOCAL
      ? new LocalMatch({ lobby, player: lobby.players[0] })
      : new OnlineMatch({
          lobby,
          player: lobby.players.find((player) => player.id === websocket.id)!,
        })
  );
  const controller = useRef(
    new Controller({
      sceneManager,
      match: match.current,
      events: {
        setMessage: (message: Message | null) => setMessage(message),
        navigate: (route: APP_ROUTES) => navigate(route),
      },
      options: lobby.controllerOptions,
    })
  );

  const onlineSubscribers = useMemo(() => {
    if (match.current.mode !== LOBBY_TYPE.ONLINE) return;
    return match.current.getOnlineSubscribers({
      controller: controller.current,
    });
  }, [controller.current, match.current]);

  useEffect(() => {
    onlineSubscribers?.subscribe();
    return () => {
      onlineSubscribers?.unsubscribe();
    };
  }, [onlineSubscribers]);

  //Game Overlay
  return (
    <>
      <MenuOverlay
        items={[
          {
            text: "home",
            onClick: () => controller.current.leaveMatch({ key: lobby.key }),
          },
          {
            text: "restart",
            onClick: () => controller.current.requestMatchReset(),
          },
          {
            text: "undo",
            onClick: () => controller.current.requestUndoTurn(),
          },
          {
            text: "camera",
            onClick: () => controller.current.resetCamera(),
          },
          // {
          //   text: "pause",
          //   onClick: () => match.timer.toggleTimer(),
          // },
        ]}
        icons={icons}
      />
    </>
  );
};

export type IconsIndex = typeof icons;
