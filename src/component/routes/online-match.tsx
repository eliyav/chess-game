import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Time from "../match-settings/time";

interface OnlineLobbyProps {
  setSocket: React.Dispatch<any>;
  userName: string | undefined;
}

export interface LobbySettings {
  hostName: string;
  opponentName: string;
  time: number;
  firstMove: string;
}

export const OnlineLobby: React.FC<OnlineLobbyProps> = ({
  setSocket,
  userName,
}) => {
  const [socket] = useState<any>(io(`ws://${window.location.host}`));
  const [lobbyKey, setLobbyKey] = useState<string>();
  const defaultChoice = useRef(true);
  const [lobbySettings, setLobbySettings] = useState<LobbySettings>({
    hostName: "Guest",
    opponentName: "Waiting...",
    time: 0,
    firstMove: "Host",
  });

  useEffect(() => {
    socket.emit("create-lobby");
    socket.on("lobby-key", (lobbyKey: string) => {
      setLobbyKey(lobbyKey);
      socket.emit("get-room-info", lobbyKey);
    });
    socket.on("room-info", (info: any) => setLobbySettings(info));

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (lobbyKey) socket.emit("update-lobby", { lobbyKey, lobbySettings });
  }, [lobbySettings]);

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
        <p className="player">{`Opponent: ${lobbySettings.opponentName}`}</p>
        <div className="mini-divider"></div>
        <p className="label">First move - (White Player)</p>
        <button
          className={defaultChoice.current === true ? "highlight-choice" : ""}
          value="Host"
          onClick={(e) => {
            const value = e.currentTarget.value;
            defaultChoice.current = true;
            setLobbySettings((prevState) => ({
              ...prevState,
              firstMove: value,
            }));
          }}
        >
          Host
        </button>
        <button
          className={defaultChoice.current === false ? "highlight-choice" : ""}
          value="Opponent"
          onClick={(e) => {
            const value = e.currentTarget.value;
            defaultChoice.current = false;
            setLobbySettings((prevState) => ({
              ...prevState,
              firstMove: value,
            }));
          }}
        >
          Opponent
        </button>
        <div className="mini-divider"></div>
        <Time setTime={setLobbySettings} />
      </div>
      <button>
        <Link to={`/online-game?mode=online`}>Start Match</Link>
      </button>
    </div>
  );
};
