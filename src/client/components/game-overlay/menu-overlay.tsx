import React from "react";
import { IconsIndex } from "../../routes/game";
import OverlaySelection from "./menu-overlay-selection";

interface MenuOverlayProps {
  items: Array<{ text: keyof IconsIndex; onClick: () => void }>;
  icons: IconsIndex;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({ items, icons }) => {
  return (
    <div className="z-10 absolute top-0 w-full h-3.5rem bg-transparent text-center">
      <div className="flex min-w-80 max-w-[600px] max-h-16 m-auto">
        {items.map((item, idx) => (
          <OverlaySelection item={item} icons={icons} key={idx} />
        ))}
      </div>
    </div>
  );
};
