import React, { useEffect, useRef, useState } from "react";
import * as icons from "../components/game-overlay/overlay-icons";
import LoadingScreen from "../components/loading-screen";
import { MenuOverlay } from "../components/game-overlay/menu-overlay";
import { Match } from "../components/match";
import { SceneManager } from "../components/scene-manager";
import { Controller } from "../components/match-logic/controller";
import { Message, MessageModal } from "../components/modals/message-modal";
import PromotionModal from "../components/modals/promotion-modal";

export const GameView: React.FC<{
  sceneManager: SceneManager;
}> = ({ sceneManager }) => {
  // matchControl.on("promotion-selections", () => {
  // });
  const [viewReady, setViewReady] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [promotion, setPromotion] = useState(false);
  const loadInitiated = useRef(false);
  const match = useRef(new Match()).current;

  const gameEventHandlers = {
    endMatch,
    promote,
  };

  const controller = useRef(
    new Controller(sceneManager, match, gameEventHandlers)
  ).current;

  function endMatch() {
    const winningTeam = match.getWinningTeam();
    sceneManager.gameScreen!.detachControl();
    setMessage({
      question: `${winningTeam} team has won!, Would you like to play another game?`,
      onConfirm: () => {
        controller.resetMatch();
        setMessage(null);
      },
      onReject: () => {
        setMessage(null);
      },
    });
  }

  function promote() {
    setPromotion(true);
  }

  useEffect(() => {
    if (!loadInitiated.current) {
      loadInitiated.current = true;
      initView();

      async function initView() {
        //Prep state controlling functions helpers here and pass through prepGame into resolve input function
        await controller.prepView();
        setViewReady(true);
      }
    }
  }, [sceneManager]);

  if (!viewReady)
    return (
      <div className="loadingContainer">
        <LoadingScreen text="..." />
      </div>
    );

  //Game Overlay
  return (
    <>
      {viewReady && (
        <MenuOverlay
          items={[
            {
              text: "home",
              onClick: () => {},
            },
            {
              text: "restart",
              onClick: () => {
                console.log("board reset");
              },
            },
            {
              text: "undo",
              onClick: () => {
                console.log("undo move");
              },
            },
            {
              text: "camera",
              onClick: () => {
                console.log("reset camera");
              },
            },
            // {
            //   text: "pause",
            //   onClick: () => match.timer.toggleTimer(),
            // },
          ]}
          icons={icons}
        />
      )}
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
            controller.setPromotionPiece(e.target.innerText);
            controller.updateMeshesRender();
            setPromotion(false);
          }}
        />
      )}
    </>
  );
};

export type IconsIndex = typeof icons;

// {matchReady && <TimerOverlay timer={match.timer} />}
