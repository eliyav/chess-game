import React from "react";
import EventEmitter from "../events/event-emitter";
import OverlaySelection, { IconsIndex } from "./game-overlay-selection";
import "./game-overlay.css";

interface Props {
  emitter: EventEmitter | undefined;
  isNavbarOpen: boolean;
  setIsNavbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GameOverlay: React.FC<Props> = ({
  emitter,
  isNavbarOpen,
  setIsNavbarOpen,
}) => {
  const overlaySelection = (e: any) => {
    const choice = e.target.innerText;
    if (choice === "Restart") {
      emitter!.emit("reset-board");
    } else if (choice === "Undo") {
      emitter!.emit("undo-move");
    } else if (choice === "Camera") {
      emitter!.emit("reset-camera");
    } else if (choice === "Menu") {
      isNavbarOpen ? setIsNavbarOpen(false) : setIsNavbarOpen(true);
    }
  };

  const overlaySelections: IconsIndex[] = ["menu", "restart", "camera", "undo"];

  return (
    <div className={"gameOverlay"} onClick={overlaySelection}>
      {overlaySelections.map((str, idx) => (
        <OverlaySelection name={str} key={idx} />
      ))}
    </div>
  );
};

export default GameOverlay;
