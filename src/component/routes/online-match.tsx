import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import Time from "../match-settings/time";

interface OnlineMatch {
  setSocket: React.Dispatch<any>;
  userName: string | undefined;
}

export const OnlineMatch: React.FC<OnlineMatch> = ({ setSocket, userName }) => {
  const [time, setTime] = useState(0);
  const [lobbyKey, setLobbyKey] = useState<string>("");
  const [opponentName, setOpponentName] = useState<string>("Waiting..");

  useEffect(() => {
    const socket = io(`ws://${window.location.host}`);
    socket.emit("create-lobby");
    socket.on("lobby-key", (lobbyKey) => {
      setLobbyKey(lobbyKey);
      socket.emit("get-room-info", lobbyKey);
    });
    socket.on("room-info", (test) => console.log(test));
  }, []);

  return (
    <div className="lobby">
      <p className="page-title">Lobby</p>
      <div className="divider"></div>
      <div className="settings">
        <p className="label">Mode:</p>
        <p>Online</p>
        <div className="mini-divider"></div>
        <p className="label">Lobby Code</p>
        <p>{lobbyKey}</p>
        <div className="mini-divider"></div>
        <p className="label">Players</p>
        <p className="player">{`You: ${userName ? userName : "Guest"}`}</p>
        <p className="player">{`Opponent: ${opponentName}`}</p>
        <div className="mini-divider"></div>
        <Time time={setTime} />
      </div>
      <button>
        <Link to={`/online-game?mode=online&time=${time}`}>Start Match</Link>
      </button>
    </div>
  );
};
