import React, { useEffect } from "react";
import { Socket } from "socket.io-client";
import { LobbySettings } from "../../routes/lobby";
import { Clock } from "../buttons/clock";

export const OnlineLobby: React.FC<{
  socket: Socket;
  lobby: LobbySettings;
  updateLobby: (key: keyof LobbySettings, value: any) => void;
}> = ({ socket, lobby, updateLobby }) => {
  useEffect(() => {
    socket.on("room-info", (settings: LobbySettings) => {
      Object.entries(settings).forEach(([key, value]) => {
        updateLobby(key as keyof LobbySettings, value);
      });
    });
    return () => {
      socket.off("room-info");
    };
  }, []);

  useEffect(() => {
    if (lobby.key) socket.emit("update-lobby", { lobby });
  }, [lobby]);

  return (
    <div>
      <div className="lobby-code">
        <h2 className="sub-title glass-dark">Invite Code</h2>
        <p>
          <span
            onClick={() => {
              try {
                const text = lobby.key ?? "";
                navigator.clipboard.writeText(text);
              } catch (e) {
                console.error(e);
              }
            }}
          >
            {lobby.key ?? "..."}
          </span>
        </p>
      </div>
      <h2 className="sub-title glass-dark">Players</h2>
      <div className="selections">
        {lobby.players.map((player) => (
          <button>{player}</button>
        ))}
      </div>
      <Clock time={lobby.time} setTime={(time) => updateLobby("time", time)} />
    </div>
  );
};
