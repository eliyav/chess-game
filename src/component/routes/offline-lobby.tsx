import React, { useState } from "react";
import { Link } from "react-router-dom";
import Time from "../match-settings/time";
import { LobbySettings } from "./online-lobby";

export const OfflineLobby: React.FC = ({}) => {
  const [lobbySettings, setLobbySettings] = useState<LobbySettings>({
    lobbyKey: "Unassaigned",
    hostName: "Guest",
    opponentName: "Waiting...",
    time: 0,
    firstMove: "host",
  });

  return (
    <div className="lobby">
      <p className="page-title">Lobby</p>
      <div className="divider"></div>
      <div className="settings">
        <p className="label">Mode:</p>
        <p>Offline</p>
        <div className="mini-divider"></div>
        <Time setTime={setLobbySettings} />
      </div>
      <button>
        <Link to={`/offline-game?mode=offline&time=${lobbySettings.time}`}>
          Start Match
        </Link>
      </button>
    </div>
  );
};
