import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Socket } from "socket.io-client";
import { OfflineLobby } from "../components/lobbys/offline-lobby";

export const Lobby: React.FC<{
  socket: Socket;
}> = ({ socket }) => {
  const [lobby, setLobby] = useState<LobbySettings>({
    mode: LOBBY.OFFLINE,
    lobbyKey: null,
    hostName: "Host123",
    opponentName: "Waiting...",
    time: 0,
    firstMove: "Game Host",
  });

  const updateLobby = useCallback(
    <KEY extends keyof LobbySettings>(key: KEY, value: LobbySettings[KEY]) => {
      setLobby((prev) => ({ ...prev, [key]: value }));
    },
    [setLobby]
  );

  return (
    <div className="lobby screen">
      <div className="header glass-dark">
        <h1>Lobby</h1>
      </div>
      <div className="selections mt-1">
        <button
          onClick={() => updateLobby("mode", LOBBY.OFFLINE)}
          className={`glass-light ${
            lobby.mode === LOBBY.OFFLINE && "highlight"
          }`}
        >
          Offline
        </button>
        <button
          className={`glass-light ${
            lobby.mode === LOBBY.ONLINE && "highlight"
          }`}
          onClick={() => updateLobby("mode", LOBBY.ONLINE)}
        >
          Online
        </button>
      </div>
      {lobby.mode === LOBBY.OFFLINE && (
        <OfflineLobby
          time={lobby.time}
          setTime={(time) => updateLobby("time", time)}
        />
      )}
      <div className="footer">
        <Link to="/game" state={lobby} className={"btn glass-light"}>
          Start
        </Link>
      </div>
    </div>
  );
};

const enum LOBBY {
  ONLINE,
  OFFLINE,
}

export interface LobbySettings {
  mode: LOBBY;
  lobbyKey: string | null;
  hostName: string;
  opponentName: string;
  time: number;
  firstMove: string;
}
