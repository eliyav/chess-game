import React, { useState } from "react";
import { IconsIndex } from "../../main-content";
import OverlaySelection from "./game-overlay-selection";
import Timer from "../game-logic/timer";
import TimerOverlay from "./timer-overlay";
import "./game-overlay.css";

interface OverlayProps {
  timerRef: Timer | undefined;
  items: Array<{ text: keyof IconsIndex; onClick: () => void }>;
  icons: IconsIndex;
}

const GameOverlay: React.VFC<OverlayProps> = ({ timerRef, items, icons }) => {
  const [gamePaused, setGamePaused] = useState(false);
  return (
    <div className="overlayWrapper">
      <div className="gameOverlay">
        {items.map((item, idx) => (
          <OverlaySelection item={item} icons={icons} key={idx} />
        ))}
      </div>
      {timerRef?.gameStarted === true ? (
        <TimerOverlay timerRef={timerRef} paused={gamePaused} />
      ) : null}
    </div>
  );
};

export default GameOverlay;
