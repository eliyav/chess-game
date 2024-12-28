import React, { useState } from "react";
import { Player, TEAM } from "../../../shared/match";
import { Controller } from "../../match-logic/controller";

export const PlayersOverlay: React.FC<{
  players: Player[];
  info: ReturnType<Controller["info"]> | null;
}> = ({ players, info }) => {
  return (
    <div className="flex justify-center items-center h-full  p-2 text-white rounded-t-lg max-w-[600px] m-auto gap-x-4">
      {players.map((player, index) => (
        <div
          key={index}
          className="flex flex-col items-center bg-slate-700 rounded-lg p-4 relative w-1/2 md:w-1/3"
        >
          <p className="font-bold text-lg">{player.name}</p>
          <div className="flex items-center mt-2">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">05:10</p>
          </div>
          <div className="absolute top-2 right-2">
            {player.team === TEAM.WHITE ? (
              <div
                className={`w-4 h-4 bg-white rounded-full ${
                  info?.currentTeam === TEAM.WHITE ? "animate-pulse" : ""
                }`}
              ></div>
            ) : (
              <div
                className={`w-4 h-4 bg-black rounded-full ${
                  info?.currentTeam === TEAM.BLACK ? "animate-pulse" : ""
                }`}
              ></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
