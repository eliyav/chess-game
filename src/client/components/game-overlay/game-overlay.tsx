import React from "react";
import { Lobby } from "../../../shared/match";
import HeaderGameOverlay from "./header-game-overlay";
import { FooterGameOverlay } from "./footer-game-overlay.tsx";
import { Controller } from "../../match-logic/controller";

export const GameOverlay: React.FC<{
  lobby: Lobby;
  info: ReturnType<Controller["info"]> | null;
  headerItems: Array<{ text: string; onClick: () => void; iconPath: string }>;
}> = ({ headerItems, lobby, info }) => {
  return (
    <div>
      <div className="z-10 absolute top-0 w-full bg-transparent text-center">
        <div className="max-w-[600px] text-center t m-auto">
          {headerItems.map((item, idx) => (
            <HeaderGameOverlay item={item} key={idx} />
          ))}
        </div>
      </div>
      <div className="z-10 absolute bottom-0 w-full bg-transparent text-center ">
        <FooterGameOverlay players={lobby.players} info={info} />
      </div>
    </div>
  );
};
