import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { BackButton } from "../components/buttons/back-button";
import { OfflineLobby } from "../components/lobbys/offline-lobby";
import { OnlineLobby } from "../components/lobbys/online-lobby";

export const Lobby: React.FC<{
  socket: Socket;
}> = ({ socket }) => {
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<LobbySettings>(createLobby(LOBBY.OFFLINE));

  const updateLobby = useCallback(
    <KEY extends keyof LobbySettings>(key: KEY, value: LobbySettings[KEY]) => {
      setLobby((prev) => ({ ...prev, [key]: value }));
    },
    [setLobby]
  );

  return (
    <div className="lobby screen">
      <div className="header glass-dark">
        <BackButton
          customClass={"bottom-left"}
          size={30}
          onClick={() => navigate(-1)}
        />
        <h1>Lobby</h1>
      </div>
      <div className="selections mt-1">
        {Object.values(LOBBY).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              const lobbyOptions = createLobby(mode);
              setLobby(lobbyOptions);
              if (mode === LOBBY.ONLINE) {
                socket.emit("create-lobby", lobbyOptions);
              }
            }}
            className={`glass-light ${lobby.mode === mode && "highlight"}`}
            disabled={lobby.mode === mode}
          >
            {mode}
          </button>
        ))}
      </div>
      {lobby.mode === LOBBY.OFFLINE && (
        <OfflineLobby
          time={lobby.time}
          setTime={(time) => updateLobby("time", time)}
        />
      )}
      {lobby.mode === LOBBY.ONLINE && (
        <OnlineLobby lobby={lobby} updateLobby={updateLobby} socket={socket} />
      )}
      <div className="footer">
        <button
          className={"btn glass-light"}
          onClick={() => {
            navigate("/game", { state: lobby });
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

enum LOBBY {
  OFFLINE = "Offline",
  ONLINE = "Online",
}

export interface LobbySettings {
  mode: string | LOBBY;
  key: string | null;
  players: string[];
  time: number;
}

function createLobby(mode: string | LOBBY) {
  return {
    mode,
    key: null,
    players: [],
    time: 0,
  };
}
