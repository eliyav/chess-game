import React from "react";
import { IconsIndex } from "../../routes/game";
import OverlaySelection from "./overlay-selection";
import { PlayersOverlay } from "./players-overlay";
import { Lobby } from "../../../shared/match";

export const GameOverlay: React.FC<{
  items: Array<{ text: keyof IconsIndex; onClick: () => void }>;
  icons: IconsIndex;
  lobby: Lobby;
}> = ({ items, icons, lobby }) => {
  return (
    <div>
      <div className="z-10 absolute top-0 w-full h-16 bg-transparent text-center">
        <div className="flex min-w-80 max-w-[600px] max-h-16 m-auto">
          {items.map((item, idx) => (
            <OverlaySelection item={item} icons={icons} key={idx} />
          ))}
        </div>
      </div>
      <div className="z-10 absolute bottom-0 w-full h-16 bg-transparent text-center ">
        <PlayersOverlay players={lobby.players} />
      </div>
    </div>
  );
};
