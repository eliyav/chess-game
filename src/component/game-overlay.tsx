import React, { useState } from "react";
import { IconsIndex } from "../main";
import OverlaySelection from "./game-overlay-selection";
import "./game-overlay.css";
import Timer from "./game/timer";
import TimerOverlay from "./timer-overlay";

interface OverlayProps {
  timerRef: React.MutableRefObject<Timer>;
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
      <TimerOverlay timerRef={timerRef} paused={gamePaused} />
    </div>
  );
};

export default GameOverlay;
