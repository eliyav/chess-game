import React from "react";

const PlayerCard: React.FC<{
  name: string;
  ready?: boolean;
  type?: string;
  team?: string;
  children?: React.ReactNode;
}> = ({ name, ready, type, team, children }) => {
  const isOnlyName =
    ready === undefined && type === undefined && team === undefined;
  return (
    <div className="relative flex basis-full gap-1 p-2 bg-slate-200 rounded-lg border-2 border-black h-14">
      {children}
      <p
        className={`font-bold pr-2 border-r-2 w-24 text-sm mr-2 border-black ${
          isOnlyName ? "w-full border-r-0" : ""
        }`}
      >
        {name}
      </p>
      {team !== undefined && <p>{team}</p>}
      {type !== undefined && <p>{type}</p>}
      {ready !== undefined && (
        <p
          className={`place-self-end self-center grow text-right ${
            ready ? "text-green-500" : "text-red-500"
          }`}
        >
          {ready ? "✔" : "✖"}
        </p>
      )}
    </div>
  );
};

export default PlayerCard;
