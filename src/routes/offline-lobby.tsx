import React, { useState } from "react";
import { Link } from "react-router-dom";
import Time from "../component/match-settings/time";
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
      <h1 className="page-title">Lobby</h1>
      <div className="settings">
        <p className="label">Mode:</p>
        <p>Offline</p>
        <div className="mini-divider"></div>
        <Time setTime={setLobbySettings} />
      </div>

      <Link to={`/offline-game?mode=offline&time=${lobbySettings.time}`}>
        <button className="btn">Start Match</button>
      </Link>
    </div>
  );
};
