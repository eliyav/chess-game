import React from "react";
import { Player, TEAM } from "../../../shared/match";
import { Pawn } from "../svg/pawn";

const PlayerCard: React.FC<{
  player: Player | undefined;
  team: string;
  children?: React.ReactNode;
}> = ({ player, team, children }) => {
  return (
    <div className="h-full w-1/2 grow p-1 bg-slate-600 rounded-lg border-2 border-black">
      <div className="h-14 bg-slate-400 rounded p-1 text-nowrap">
        <Pawn
          className={`inline-block team-symbol-background h-full border-r-2  ${
            team === TEAM.WHITE ? "border-white" : "border-black"
          }`}
          color={team === TEAM.WHITE ? "#ffffff" : "#000000"}
        />
        <p
          className={`inline-block text-center pl-2 tracking-wide font-bold text-2xl font-mono ${
            team === TEAM.WHITE ? "text-white" : "text-black"
          }`}
        >
          {team}
        </p>
        {player?.ready && (
          <p
            className={`inline-block place-self-end self-center grow text-right ${
              player.ready ? "text-green-500" : "text-red-500"
            }`}
          >
            {player.ready ? "✔" : "✖"}
          </p>
        )}
      </div>
      {player ? (
        <p
          className={`whitespace-nowrap overflow-hidden text-ellipsis text-slate-200 font-bold text-md p-2 border-b-2 border-black
          `}
        >
          {player.name}
        </p>
      ) : (
        <>
          <p>Waiting...</p>
        </>
      )}
      {children}
    </div>
  );
};

export default PlayerCard;
