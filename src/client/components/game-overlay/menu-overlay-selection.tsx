import React from "react";
import { IconsIndex } from "../../routes/game";

interface SelectionProps {
  item: { text: keyof IconsIndex; onClick: () => void };
  icons: IconsIndex;
}

const OverlaySelection: React.FC<SelectionProps> = ({
  item: { text, onClick },
  icons,
}) => {
  return (
    <div
      className="text-black bg-slate-300 bold pointer-events-auto min-w-16 grow border-2 border-black rounded-lg p-2 border-collapse"
      onClick={onClick}
    >
      <img
        className="block h-2/3 object-contain m-auto bg-transparent"
        src={icons[text]}
        alt="logo"
      ></img>
      {text.charAt(0).toUpperCase() + text.slice(1)}
    </div>
  );
};

export default OverlaySelection;
