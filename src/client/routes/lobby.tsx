import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Socket } from "socket.io-client";

export const Lobby: React.FC<{
  socket: Socket;
}> = ({ socket }) => {
  const [mode, setMode] = useState<LobbyModes>("offline");
  const [opponent, setOpponent] = useState("human");
  const [time, setTime] = useState("0");
  const [lobbySettings, setLobbySettings] = useState<LobbySettings>({
    lobbyKey: null,
    hostName: "Host123",
    opponentName: "Waiting...",
    time: 0,
    firstMove: "Game Host",
  });

  useEffect(() => {
    socket.on("room-info", (settings: LobbySettings) => {
      setLobbySettings(settings);
    });
    return () => {
      socket.off("room-info");
    };
  }, []);

  useEffect(() => {
    if (mode === "online") socket.emit("create-lobby", lobbySettings);
  }, [mode]);

  useEffect(() => {
    if (lobbySettings.lobbyKey) socket.emit("update-lobby", { lobbySettings });
  }, [lobbySettings]);

  return (
    <div className="lobby screen">
      <h1 className="sub-title">Lobby</h1>;
      <div className="lobby-modes">
        <h2 className="label">Join Lobby</h2>
        <input
          type="text"
          placeholder="Enter here"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const lobbyCode = e.currentTarget.value;
              socket.emit("join-lobby", {
                lobbeyKey: lobbyCode,
                name: "Opponent",
              });
              e.currentTarget.value = "";
            }
          }}
        ></input>
      </div>
      <div className="lobby-modes">
        <h2 className="label">Mode</h2>
        <div className="selections">
          <div
            onClick={() => setMode("offline")}
            className={`selection ${mode === "offline" && "highlight"}`}
          >
            Offline
          </div>
          <div
            className={`selection ${mode === "online" && "highlight"}`}
            onClick={() => setMode("online")}
          >
            Online
          </div>
        </div>
      </div>
      {mode === "online" && (
        <div className="lobby-code">
          <h2 className="label">Invite Code</h2>
          <p className="selection">{lobbySettings.lobbyKey ?? "..."}</p>
        </div>
      )}
      <div className="opponent">
        <h2 className="label">Opponent</h2>
        {mode === "offline" && (
          <div className="selections">
            <div className={`selection ${opponent === "human" && "highlight"}`}>
              Human
            </div>
            {/* <div className="selection">{"Bot (Coming Soon)"}</div> */}
          </div>
        )}
        {mode === "online" && (
          <div className="selections">
            <div className={`selection highlight"}`}>
              {lobbySettings.opponentName}
            </div>
            {/* <div className="selection">{"Bot (Coming Soon)"}</div> */}
          </div>
        )}
      </div>
      <div className="clock">
        <h2 className="label">Clock</h2>
        <div className="clock-selections">
          <input
            className="slider"
            name="time"
            type="range"
            min="0"
            max="60"
            step="5"
            defaultValue="0"
            onChange={(e) => setTime(e.currentTarget.value)}
          ></input>
          <p className="time-display">{time === "0" ? "No Limit" : time}</p>
        </div>
      </div>
      <div className="menu">
        <Link to={"/game"}>
          <button className="menu-btn">Start</button>
        </Link>
      </div>
    </div>
  );
};

type LobbyModes = "offline" | "online";

export interface LobbySettings {
  lobbyKey: string | null;
  hostName: string;
  opponentName: string;
  time: number;
  firstMove: string;
}
