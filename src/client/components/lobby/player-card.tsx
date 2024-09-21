import React from "react";

const PlayerCard: React.FC<{
  name: string;
  ready?: boolean;
  type?: string;
  team?: string;
}> = ({ name, ready, type, team }) => {
  return (
    <div className="player-card">
      <p style={{ fontWeight: "bold" }}>{name}</p>
      {team !== undefined && <p>{team}</p>}
      {type !== undefined && <p>{type}</p>}
      {ready !== undefined && (
        <p>
          Ready:{" "}
          {ready ? (
            <span className={"green-highlight"}>✔</span>
          ) : (
            <span className={"red-highlight"}>✖</span>
          )}
        </p>
      )}
    </div>
  );
};

export default PlayerCard;
