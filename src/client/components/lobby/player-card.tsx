import React from "react";

const PlayerCard: React.FC<{
  name: string;
  ready?: boolean;
  type?: string;
  team?: string;
}> = ({ name, ready, type, team }) => {
  return (
    <div className="flex basis-full gap-1 bg-slate-200 p-4 rounded-lg border-2 border-black">
      <p className="font-bold pr-2 border-r-2 border-black">{name}</p>
      {team !== undefined && <p>{team}</p>}
      {type !== undefined && <p>{type}</p>}
      {ready !== undefined && (
        <p>
          Ready:{" "}
          {ready ? (
            <span className="text-green-500 text-right">✔</span>
          ) : (
            <span className="text-red-500 text-right">✖</span>
          )}
        </p>
      )}
    </div>
  );
};

export default PlayerCard;
