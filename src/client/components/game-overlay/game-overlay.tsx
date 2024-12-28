import React from "react";
import { Lobby } from "../../../shared/match";
import OverlaySelection from "./overlay-selection";
import { PlayersOverlay } from "./players-overlay";
import { Controller } from "../../match-logic/controller";

export const GameOverlay: React.FC<{
  lobby: Lobby;
  info: ReturnType<Controller["info"]> | null;
  headerItems: Array<{ text: string; onClick: () => void; iconPath: string }>;
}> = ({ headerItems, lobby, info }) => {
  return (
    <div>
      <div className="z-10 absolute top-0 w-full h-16 bg-transparent text-center">
        <div className="flex min-w-80 max-w-[600px] max-h-16 m-auto">
          {headerItems.map((item, idx) => (
            <OverlaySelection item={item} key={idx} />
          ))}
        </div>
      </div>
      <div className="z-10 absolute bottom-0 w-full bg-transparent text-center ">
        <PlayersOverlay players={lobby.players} info={info} />
      </div>
    </div>
  );
};
