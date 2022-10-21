import React, { useEffect, useRef, useState } from "react";
import * as icons from "../components/game-overlay/overlay-icons";
import { MenuOverlay } from "../components/game-overlay/menu-overlay";
import { Match } from "../components/match";
import { matchController } from "../components/match-logic/match-controller";
import { SceneManager } from "../components/scene-manager";
import LoadingScreen from "../components/loading-screen";
import PromotionModal from "../components/modals/promotion-modal";

export const GameScreen: React.FC<{
  sceneManager: SceneManager;
}> = ({ sceneManager }) => {
  const [matchReady, setMatchReady] = useState(false);
  const [promotion, setPromotion] = useState(false);
  const [request, setRequest] = useState<{
    question: string;
    onConfirm: () => void;
    onReject: () => void;
  } | null>(null);
  const sceneManagerRef = useRef(sceneManager);
  const loadInitiated = useRef(false);
  const matchRef = useRef(new Match(0));
  const matchControlRef = useRef(
    matchController(matchRef.current, sceneManager)
  );
  const { current: match } = matchRef;
  const { current: matchControl } = matchControlRef;

  useEffect(() => {
    if (!loadInitiated.current) {
      (async () => {
        loadInitiated.current = true;
        await sceneManagerRef.current.loadGame(match, matchControl, false);
        match.startMatch();

        matchControl.on("promotion-selections", () => {
          setTimeout(() => setPromotion(true), 1000);
        });
        matchControl.on("end-match", (winningTeam: string) => {
          sceneManagerRef.current.gameScreen!.detachControl();
          setRequest({
            question: `${winningTeam} team has won!, Would you like to play another game?`,
            onConfirm: () => {
              match.resetMatch();
              sceneManager.prepGameScreen(match.game);
              setRequest(null);
            },
            onReject: () => {
              setRequest(null);
            },
          });
        });
        setMatchReady(true);
      })();
    }
  }, []);

  //Game Overlay
  return (
    <>
      {matchReady ? (
        <MenuOverlay
          items={[
            {
              text: "home",
              onClick: () => {},
            },
            {
              text: "restart",
              onClick: () => matchControl.emit("board-reset"),
            },
            {
              text: "undo",
              onClick: () => matchControl.emit("undo-move"),
            },
            {
              text: "camera",
              onClick: () => matchControl.emit("reset-camera"),
            },
            {
              text: "pause",
              onClick: () => match.timer.toggleTimer(),
            },
          ]}
          icons={icons}
        />
      ) : (
        <div className="loadingContainer">
          <LoadingScreen text="..." />
        </div>
      )}
      {promotion ? (
        <PromotionModal
          submitSelection={(e) => {
            matchControl.emit("selected-promotion-piece", e.target.innerText);
            setPromotion(false);
          }}
        />
      ) : null}
      {/* {gameLoaded && (
        <TimerOverlay
          timer={offlineMatch.current?.timer!}
          state={offlineMatch.current?.game.state!}
        />
      )} */}
      {/* {request ? (
        <RequestModal
          question={request.question}
          onConfirm={request.onConfirm}
          onReject={request.onReject}
        />
      ) : null} */}
    </>
  );
};

export type IconsIndex = typeof icons;
