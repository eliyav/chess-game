import React, { useState } from "react";
import { Link } from "react-router-dom";
import Time from "../match-settings/time";

export const OfflineMatch: React.FC = ({}) => {
  const [time, setTime] = useState(0);

  return (
    <div className="lobby">
      <p className="page-title">Lobby</p>
      <div className="divider"></div>
      <div className="settings">
        <p className="label">Mode:</p>
        <p>Offline</p>
        <div className="mini-divider"></div>
        <Time time={setTime} />
      </div>
      <button>
        <Link to={`/offline-game?mode=offline&time=${time}`}>Start Match</Link>
      </button>
    </div>
  );
};
