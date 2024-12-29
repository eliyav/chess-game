import React from "react";
import { Player, TEAM } from "../../../shared/match";
import { BaseMatch } from "../../match-logic/base-match";
import { ClockIcon } from "../svg/clock-icon";

export const FooterGameOverlay: React.FC<{
  players: Player[];
  controllerState: ReturnType<BaseMatch["state"]> | null;
}> = ({ players, controllerState }) => {
  return (
    <div className="h-full p-2 text-white rounded-t-lg max-w-[600px] m-auto gap-x-4">
      {players.map((player, index) => (
        <div className="inline-block w-1/2" key={index}>
          <div className="flex flex-col items-center bg-slate-700 rounded-lg p-2 m-2 relative min-w-1/3 overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out transform hover:scale-105">
            <div
              className={`absolute top-1 transition-all duration-500 ease-in-out ${
                index % 2 === 0 ? "left-1" : "right-1"
              } ${
                controllerState?.currentTeam === player.team
                  ? "animate-pulse bg-red-500"
                  : player.team === TEAM.WHITE
                  ? "bg-white"
                  : "bg-black"
              } rounded-full w-4 h-4`}
            ></div>
            <p className="font-bold text-lg whitespace-nowrap overflow-hidden text-ellipsis w-3/4 max-w-3/4">
              {player.name}
            </p>
            <div
              className={`flex items-center overflow-hidden justify-center mt-2 h-0 transition-all duration-1000 ease-in-out ${
                controllerState ? "h-10" : ""
              }`}
            >
              <ClockIcon
                className={`w-8 h-8 mr-1 ${
                  controllerState?.currentTeam === player.team
                    ? "animate-pulse text-red-500"
                    : ""
                }`}
              />
              <div className="flex items-center space-x-1 text-lg">
                <span className="font-mono">
                  {controllerState?.timers?.[player.team].formatted}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
