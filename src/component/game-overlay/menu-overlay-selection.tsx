import React from "react";
import { IconsIndex } from "../../routes/offline-game-view";

interface SelectionProps {
  item: { text: keyof IconsIndex; onClick: () => void };
  icons: IconsIndex;
}

const OverlaySelection: React.VFC<SelectionProps> = ({
  item: { text, onClick },
  icons,
}) => {
  return (
    <div className="item" onClick={onClick}>
      <img src={icons[text]} alt="logo"></img>
      {text.charAt(0).toUpperCase() + text.slice(1)}
    </div>
  );
};

export default OverlaySelection;
