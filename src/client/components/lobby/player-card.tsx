import React from "react";
import type { Player } from "../../../shared/match";

const PlayerCard: React.FC<{ player: Player; showReady: boolean }> = ({
  player,
  showReady,
}) => {
  const { name, ready, type } = player;
  return (
    <div className="player-card">
      <p style={{ fontWeight: "bold" }}>{name}</p>
      <p>{type}</p>
      {showReady && (
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
