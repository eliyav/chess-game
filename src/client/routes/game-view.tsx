import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuOverlay } from "../components/game-overlay/menu-overlay";
import * as icons from "../components/game-overlay/overlay-icons";
import { Match } from "../components/match";
import { Controller } from "../components/match-logic/controller";
import { Message, MessageModal } from "../components/modals/message-modal";
import PromotionModal from "../components/modals/promotion-modal";
import { SceneManager, Scenes } from "../components/scene-manager";

export const GameView: React.FC<{
  sceneManager: SceneManager;
}> = ({ sceneManager }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<Message | null>(null);
  const [promotion, setPromotion] = useState(false);
  const match = useRef(new Match()).current;
  const controller = useRef(
    new Controller({
      sceneManager,
      match,
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
            controller.current.setPromotionPiece(e.target.innerText);
            setPromotion(false);
          }}
        />
      )}
      {/* {matchReady && <TimerOverlay timer={match.timer} />} */}
    </>
  );
};

export type IconsIndex = typeof icons;
