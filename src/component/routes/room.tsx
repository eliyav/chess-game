import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Time from "../match-settings/time";

interface RoomProps {}

export const Room: React.FC<RoomProps> = ({}) => {
  const timeRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");
  const [time, setTime] = useState(0);

  return (
    <div className="room">
      <p className="page-title">Room</p>
      <div className="divider"></div>
      <div className="settings">
        <p className="label">Mode:</p>
        <p>{mode}</p>
        <div className="mini-divider"></div>
        <Time time={setTime} />
      </div>
      <button>
        <Link to={`/game?mode=${mode}&time=${time}`}>Start Match</Link>
      </button>
    </div>
  );
};
