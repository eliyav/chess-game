import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { LobbySettings } from "./online-lobby";

interface JoinLobbyProps {
  setSocket: React.Dispatch<any>;
  userName: string | undefined;
}

export const JoinLobby: React.FC<JoinLobbyProps> = ({
  setSocket,
  userName,
}) => {
  const navigate = useNavigate();
  const [socket] = useState<any>(io(`ws://${window.location.host}`));
  const keyInputRef = useRef<HTMLInputElement>(null);
  const [lobbyKey, setLobbyKey] = useState<string>();
  const [keyVerified, setKeyVerified] = useState(false);
  const [lobbySettings, setLobbySettings] = useState<LobbySettings>();

  useEffect(() => {
    if (lobbyKey) {
      setSocket(socket);
      socket.emit("join-lobby", {
        lobbyKey,
        name: userName ? userName : "Guest",
      });
      socket.on("room-info", (lobbyInfo: LobbySettings) => {
        setLobbySettings(lobbyInfo);
        setKeyVerified(true);
      });
      socket.on("start-match", () => {
        navigate("/online-game");
      });
    }
  }, [lobbyKey]);

  return (
    <div className="lobby">
      <p className="page-title">Lobby</p>
      <div className="divider"></div>
      <div className="settings">
        {!lobbyKey || !keyVerified ? (
          <>
            <label>Online lobby key:</label>
            <input
              ref={keyInputRef}
              type="text"
              placeholder="Enter here"
            ></input>
            <button onClick={() => setLobbyKey(keyInputRef.current?.value)}>
              Enter Lobby
            </button>
          </>
        ) : (
          <>
            <p className="label">Mode:</p>
            <p>Online</p>
            <div className="mini-divider"></div>
            <p className="label">Lobby Code</p>
            <p>{lobbyKey}</p>
            <div className="mini-divider"></div>
            <p className="label">Players</p>
            <p className="player">{`You: ${userName ? userName : "Guest"}`}</p>
            <p className="player">{`Opponent: ${lobbySettings?.hostName}`}</p>
            <div className="mini-divider"></div>
            <p className="label">First move - (White Player)</p>
            <p>
              {lobbySettings?.firstMove === "Game Host" ? "Opponent" : "You"}
            </p>
            <div className="mini-divider"></div>
            <p className="label">Time on clock</p>
            <p className="player">{lobbySettings?.time}</p>
          </>
        )}
      </div>
      <p>Waiting for game host to start game.</p>
    </div>
  );
};
