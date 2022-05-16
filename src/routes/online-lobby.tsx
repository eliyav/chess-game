import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import Time from "../component/match-settings/time";

interface OnlineLobbyProps {
  setSocket: React.Dispatch<any>;
  userName: string | undefined;
}

export interface LobbySettings {
  lobbyKey: string;
  hostName: string;
  opponentName: string;
  time: number;
  firstMove: string;
}

export const OnlineLobby: React.FC<OnlineLobbyProps> = ({
  setSocket,
  userName,
}) => {
  const [socket] = useState<any>(
    io(`wss://${window.location.host}`, {
      transports: ["websocket"],
    })
  );
  const defaultChoice = useRef(true);
  const [lobbySettings, setLobbySettings] = useState<LobbySettings>({
    lobbyKey: "",
    hostName: userName ? userName : "Guest",
    opponentName: "Waiting...",
    time: 0,
    firstMove: "Game Host",
  });

  useEffect(() => {
    setSocket(socket);
    socket.emit("create-lobby", lobbySettings);
    socket.on("room-info", (settings: LobbySettings) =>
      setLobbySettings(settings)
    );

    return () => {
      socket.off("room-info");
    };
  }, [socket]);

  useEffect(() => {
    if (lobbySettings.lobbyKey) socket.emit("update-lobby", { lobbySettings });
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
        <p>{lobbySettings.lobbyKey}</p>
        <div className="mini-divider"></div>
        <p className="label">Players</p>
        <p className="player">{`You: ${lobbySettings.hostName}`}</p>
        <p className="player">{`Opponent: ${lobbySettings.opponentName}`}</p>
        <div className="mini-divider"></div>
        <p className="label">First move - (White Player)</p>
        <button
          className={defaultChoice.current === true ? "highlight-choice" : ""}
          value="Game Host"
          onClick={(e) => {
            const value = e.currentTarget.value;
            defaultChoice.current = true;
            setLobbySettings((prevState) => ({
              ...prevState,
              firstMove: value,
            }));
          }}
        >
          Game Host
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

      <Link
        to={`/online-game?room=${lobbySettings.lobbyKey}&move=${
          lobbySettings.firstMove === "Game Host" ? 1 : 2
        }`}
      >
        <button
          onClick={() => {
            socket.emit(
              "start-match",
              lobbySettings.lobbyKey,
              lobbySettings.firstMove
            );
          }}
        >
          Start Match!
        </button>
      </Link>
    </div>
  );
};
