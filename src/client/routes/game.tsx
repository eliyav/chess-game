import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOBBY_TYPE, Lobby } from "../../shared/match";
import { MenuOverlay } from "../components/game-overlay/menu-overlay";
import * as icons from "../components/game-overlay/overlay-icons";
import { Controller } from "../match-logic/controller";
import { LocalMatch } from "../match-logic/local-match";
import { OnlineMatch } from "../match-logic/online-match";
import { Message } from "../components/modals/message-modal";
import PromotionModal from "../components/modals/promotion-modal";
import { SceneManager, Scenes } from "../scenes/scene-manager";
import { websocket } from "../websocket-client";

export const Game: React.FC<{
  sceneManager: SceneManager;
  lobby: Lobby;
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}> = ({ sceneManager, setMessage, lobby }) => {
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(false);
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
        promote: () => setPromotion(true),
      },
      options: lobby.controllerOptions,
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
              navigate("/");
              sceneManager.switchScene(Scenes.HOME);
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
