import React, { ReactNode } from "react";
import { Lobby } from "../../../shared/match";
import { BaseMatch } from "../../match-logic/base-match";
import { FooterGameOverlay } from "./footer-game-overlay.tsx";
import HeaderGameOverlay from "./header-game-overlay";

export const GameOverlay: React.FC<{
  lobby: Lobby;
  controllerState: ReturnType<BaseMatch["state"]> | null;
  headerItems: Array<{
    text: string;
    onClick: () => void;
    children: ReactNode;
  }>;
}> = ({ headerItems, lobby, controllerState }) => {
  return (
    <div>
      <div className="z-10 absolute select-none top-0 w-full bg-transparent text-center">
        <div className="max-w-[600px] text-center t m-auto">
          {headerItems.map((item, idx) => (
            <HeaderGameOverlay item={item} key={idx} />
          ))}
        </div>
      </div>
      <div className="z-10 absolute select-none bottom-0 w-full bg-transparent text-center ">
        <FooterGameOverlay
          players={lobby.players}
          controllerState={controllerState}
        />
      </div>
    </div>
  );
};
