import React from "react";
import { Player, TEAM } from "../../../shared/match";
import { Controller } from "../../match-logic/controller";
import { ClockIcon } from "../svg/clock-icon";

export const FooterGameOverlay: React.FC<{
  players: Player[];
  info: ReturnType<Controller["info"]> | null;
}> = ({ players, info }) => {
  return (
    <div className="h-full p-2 text-white rounded-t-lg max-w-[600px] m-auto gap-x-4">
      {players.map((player, index) => (
        <div className="inline-block w-1/2" key={index}>
          <div className="flex flex-col items-center bg-slate-700 rounded-lg p-2 m-2 relative md:w-1/3 transition-all duration-500 ease-in-out transform hover:scale-105">
            <div
              className={`absolute top-2 ${
                player.team === TEAM.WHITE
                  ? "left-2 bg-white"
                  : "right-2 bg-black"
              } rounded-full w-4 h-4 ${
                info?.currentTeam === player.team ? "animate-pulse" : ""
              }`}
            ></div>
            <p className="font-bold text-lg whitespace-nowrap overflow-hidden text-ellipsis w-3/4 max-w-3/4">
              {player.name}
            </p>
            <div
              className={`flex items-center justify-center mt-2 transition-all duration-1000 ease-in-out ${
                info?.time ? "h-10" : "h-0 opacity-0"
              }`}
            >
              <ClockIcon
                className={`w-8 h-8 mr-1 ${
                  info?.currentTeam === player.team
                    ? "animate-pulse text-red-500"
                    : ""
                }`}
              />
              <div className="flex items-center space-x-1 text-lg">
                <span className="font-mono">{info?.time}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
