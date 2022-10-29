import React, { useEffect, useRef, useState } from "react";
import * as icons from "../components/game-overlay/overlay-icons";
import LoadingScreen from "../components/loading-screen";
import { MenuOverlay } from "../components/game-overlay/menu-overlay";
import { Match } from "../components/match";
import { SceneManager } from "../components/scene-manager";
import { Controller } from "../components/match-logic/controller";

export const GameScreen: React.FC<{
  sceneManager: SceneManager;
  match: Match;
  controller: Controller;
}> = ({ sceneManager, match, controller }) => {
  const [matchReady, setMatchReady] = useState(false);
  const loadInitiated = useRef(false);

  useEffect(() => {
    if (!loadInitiated.current) {
      loadInitiated.current = true;
      (async () => {
        await controller.prepGame(sceneManager, match);
        setMatchReady(true);
      })();
    }
  }, [sceneManager]);

  if (!matchReady)
    return (
      <div className="loadingContainer">
        <LoadingScreen text="..." />
      </div>
    );

  //Game Overlay
  return (
    <>
      {matchReady && (
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
    </>
  );
};

export type IconsIndex = typeof icons;

// matchControl.on("promotion-selections", () => {
//   setTimeout(() => setPromotion(true), 1000);
// });

// matchControl.on("end-match", (winningTeam: string) => {
//   sceneManager.current!.gameScreen!.detachControl();
//   setRequest({
//     question: `${winningTeam} team has won!, Would you like to play another game?`,
//     onConfirm: () => {
//       match.resetMatch();
//       sceneManager.current!.prepGameScreen(match.game);
//       setRequest(null);
//     },
//     onReject: () => {
//       setRequest(null);
//     },
//   });
// });

// {promotion ? (
//   <PromotionModal
//     submitSelection={(e) => {
//       matchControl.emit("selected-promotion-piece", e.target.innerText);
//       setPromotion(false);
//     }}
//   />
// ) : null}
// {request ? (
//   <RequestModal
//     question={request.question}
//     onConfirm={request.onConfirm}
//     onReject={request.onReject}
//   />
// ) : null}

// {matchReady && <TimerOverlay timer={match.timer} />}
