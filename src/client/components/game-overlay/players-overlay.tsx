import React from "react";
import { Player } from "../../../shared/match";

interface PlayersOverlayProps {
  players: Player[];
}

export const PlayersOverlay: React.FC<PlayersOverlayProps> = ({ players }) => {
  return (
    <div className="">
      {players.map((player, index) => (
        <p key={index}>{player.name}</p>
      ))}
    </div>
  );
};
