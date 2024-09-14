import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuOverlay } from "../components/game-overlay/menu-overlay";
import * as icons from "../components/game-overlay/overlay-icons";
import { Controller } from "../components/match-logic/controller";
import { Message, MessageModal } from "../components/modals/message-modal";
import PromotionModal from "../components/modals/promotion-modal";
import { SceneManager, Scenes } from "../components/scene-manager";
import { LOBBY_TYPE, Lobby, Player } from "../../shared/match";
import { Socket } from "socket.io-client";
import { LocalMatch } from "../components/match-logic/local-match";
import { OnlineMatch } from "../components/match-logic/online-match";

export const GameView: React.FC<{
  sceneManager: SceneManager;
  socket: Socket;
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}> = ({ sceneManager, socket, setMessage }) => {
  const navigate = useNavigate();
  const { lobby, player } = useLocation().state as {
    lobby: Lobby;
    player: Player;
  };
  const [promotion, setPromotion] = useState(false);
  const match = useRef(
    lobby.mode === LOBBY_TYPE.LOCAL
      ? new LocalMatch({ lobby, player })
      : new OnlineMatch({ lobby, player, socket })
  );
  const controller = useRef(
    new Controller({
      sceneManager,
      match: match.current,
      events: {
        setMessage: (message: Message | null) => setMessage(message),
        promote: () => setPromotion(true),
      },
    })
  );

  useEffect(() => {
    if (match.current.mode === LOBBY_TYPE.ONLINE) {
      match.current.subscribeMatchEvents({
        controller: controller.current,
        setMessage,
      });
    }

    return () => {
      if (match.current.mode === LOBBY_TYPE.ONLINE)
        match.current.unsubscribeMatchEvents();
    };
  }, [match, controller]);

  //Game Overlay
  return (
    <>
      <MenuOverlay
        items={[
          {
            text: "home",
            onClick: () => {
              sceneManager.switchScene(Scenes.HOME);
              navigate("/");
            },
          },
          {
            text: "restart",
            onClick: () => controller.current.requestMatchReset(),
          },
          {
            text: "undo",
            onClick: () => controller.current.undoMove(),
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
      {promotion && (
        <PromotionModal
          submitSelection={(e) => {
            controller.current.handlePromotionEvent(e.target.innerText);
            setPromotion(false);
          }}
        />
      )}
    </>
  );
};

export type IconsIndex = typeof icons;
