import React from "react";
import { Player, TEAM } from "../../../shared/match";
import { Checkmark } from "../svg/checkmark";
import { Pawn } from "../svg/pawn";
import { XIcon } from "../svg/x-icon";

const PlayerCard: React.FC<{
  player: Player | undefined;
  children?: React.ReactNode;
  hideReady?: boolean;
}> = ({ player, hideReady = false, children }) => {
  return (
    <div className="h-full relative w-1/2 p-1 bg-slate-700 rounded-lg border-2 border-slate-400">
      <div className="h-12 bg-slate-500 rounded p-1 text-nowrap">
        <Pawn
          className={`inline-block team-symbol-background h-full border-r-2 mr-1  ${
            player?.team === TEAM.WHITE ? "border-white" : "border-black"
          }`}
          color={player?.team === TEAM.WHITE ? "#ffffff" : "#000000"}
        />
        <p
          className={`inline-block align-middle text-center pl-1 tracking-wide font-bold text-2xl font-mono ${
            player?.team === TEAM.WHITE ? "text-white" : "text-black"
          }`}
        >
          {player?.team}
        </p>
      </div>
      {player ? (
        <div className="">
          <p
            className={`w-9/12 inline-block whitespace-nowrap overflow-hidden text-ellipsis text-slate-200 text-lg font-bold text-md p-2 pb-0 
            `}
          >
            {player.id ? player.name : "Invite Code"}
          </p>
          {!hideReady && (
            <p className={`float-right inline-block text-lg mt-0.5`}>
              {player?.ready ? (
                <Checkmark size={25} className="p-0.5" />
              ) : (
                <XIcon size={25} />
              )}
            </p>
          )}
        </div>
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
