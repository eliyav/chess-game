import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuOverlay } from "../components/game-overlay/menu-overlay";
import * as icons from "../components/game-overlay/overlay-icons";
import { Controller } from "../components/match-logic/controller";
import { Message, MessageModal } from "../components/modals/message-modal";
import PromotionModal from "../components/modals/promotion-modal";
import { SceneManager, Scenes } from "../components/scene-manager";
import { LobbySettings, Player } from "../../shared/match";
import { Socket } from "socket.io-client";
import { LocalMatch } from "../components/match-logic/local-match";

export const GameView: React.FC<{
  sceneManager: SceneManager;
  socket: Socket;
}> = ({ sceneManager, socket }) => {
  const navigate = useNavigate();
  const { lobby, player } = useLocation().state as {
    lobby: LobbySettings;
    player: Player;
  };
  const [message, setMessage] = useState<Message | null>(null);
  const [promotion, setPromotion] = useState(false);
  const match = useRef(new LocalMatch({ lobby, player }));
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
            onClick: () => controller.current.resetMatch(),
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
      {message && (
        <MessageModal
          question={message.question}
          onConfirm={message.onConfirm}
          onReject={message.onReject}
        />
      )}
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
