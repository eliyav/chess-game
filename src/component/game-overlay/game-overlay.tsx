import React, { useState } from "react";
import { IconsIndex } from "../routes/offline-game-view";
import OverlaySelection from "./game-overlay-selection";

interface OverlayProps {
  items: Array<{ text: keyof IconsIndex; onClick: () => void }>;
  icons: IconsIndex;
}

const GameOverlay: React.VFC<OverlayProps> = ({ items, icons }) => {
  return (
    <div className="overlayWrapper">
      <div className="gameOverlay">
        {items.map((item, idx) => (
          <OverlaySelection item={item} icons={icons} key={idx} />
        ))}
      </div>
    </div>
  );
};

export default GameOverlay;
