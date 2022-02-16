import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Time from "../match-settings/time";
import { LobbySettings } from "./online-match";

interface JoinLobbyProps {
  setSocket: React.Dispatch<any>;
  userName: string | undefined;
}

export const JoinLobby: React.FC<JoinLobbyProps> = ({
  setSocket,
  userName,
}) => {
  const [socket] = useState<any>(io(`ws://${window.location.host}`));
  const keyInputRef = useRef<HTMLInputElement>(null);
  const [lobbyKey, setLobbyKey] = useState<string>();
  const [keyVerified, setKeyVerified] = useState(false);
  const [roomInfo, setRoomInfo] = useState<LobbySettings>();

  useEffect(() => {
    if (lobbyKey) {
      socket.emit("join-lobby", {
        lobbyKey,
        name: userName ? userName : "Guest",
      });
      socket.on("room-info", (roomInfo: LobbySettings) => {
        setRoomInfo(roomInfo);
        setKeyVerified(true);
      });
      socket.on("message", (message: string) => console.log(message));

      return () => {
        socket.disconnect();
      };
    }
  }, [lobbyKey]);

  console.log(roomInfo);
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
            <button
              onClick={() => setLobbyKey(keyInputRef.current?.value)}
            ></button>
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
            <p className="player">{`Opponent: `}</p>
            <div className="mini-divider"></div>
            <p className="label">Time</p>
            <p className="player">{`time`}</p>
          </>
        )}
      </div>
      <p>Waiting for game host to start game.</p>
    </div>
  );
};
