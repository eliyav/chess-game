import React, { useState } from "react";
import EventEmitter from "../events/event-emitter";
import OverlaySelection, { IconsIndex } from "./game-overlay-selection";
import "./game-overlay.css";
import Timer from "./game/timer";
import TimerOverlay from "./timer-overlay";

interface Props {
  emitter: EventEmitter | undefined;
  isNavbarOpen: boolean;
  setIsNavbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  timerRef: React.MutableRefObject<Timer>;
}

const GameOverlay: React.FC<Props> = ({
  emitter,
  isNavbarOpen,
  setIsNavbarOpen,
  timerRef,
}) => {
  const [gamePaused, setGamePaused] = useState(false);

  const overlaySelection = (e: any) => {
    const choice = e.target.innerText;
    if (choice === "Restart") {
      emitter!.emit("reset-board");
    } else if (choice === "Undo") {
      emitter!.emit("undo-move");
    } else if (choice === "Camera") {
      emitter!.emit("reset-camera");
    } else if (choice === "Pause") {
      emitter?.emit("pause-game");
      gamePaused ? setGamePaused(false) : setGamePaused(true);
    } else if (choice === "Menu") {
      isNavbarOpen ? setIsNavbarOpen(false) : setIsNavbarOpen(true);
    }
  };

  const overlaySelections: IconsIndex[] = [
    "menu",
    "restart",
    "camera",
    "undo",
    "pause",
  ];

  return (
    <div className="overlayWrapper">
      <div className="gameOverlay" onClick={overlaySelection}>
        {overlaySelections.map((str, idx) => (
          <OverlaySelection name={str} key={idx} />
        ))}
      </div>
      <TimerOverlay timerRef={timerRef} paused={gamePaused} />
    </div>
  );
};

export default GameOverlay;
