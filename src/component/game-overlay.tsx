import React, { useRef } from "react";
import OverlaySelection, { IconsIndex } from "./game-overlay-selection";
import "./game-overlay.css";

interface Props {
  selectionHandler: (e: any) => void;
}

const GameOverlay: React.FC<Props> = ({ selectionHandler }) => {
  const gameOverlayRef = useRef<HTMLDivElement>(null);
  const overlaySelections: IconsIndex[] = [
    "menu",
    "home",
    "restart",
    "camera",
    "undo",
  ];

  return (
    <div
      ref={gameOverlayRef}
      className={"gameOverlay"}
      onClick={selectionHandler}
    >
      {overlaySelections.map((str, idx) => (
        <OverlaySelection name={str} key={idx} />
      ))}
    </div>
  );
};

export default GameOverlay;
