import React, { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { LOBBY, LobbySettings } from "../../routes/lobby";

export const OnlineLobby: React.FC<{
  socket: Socket;
}> = ({ socket }) => {
  //Get lobby settings from passed state
  const [lobby, setLobby] = useState<LobbySettings>(createLobby(LOBBY.ONLINE));

  const updateLobby = useCallback(
    <KEY extends keyof LobbySettings>(key: KEY, value: LobbySettings[KEY]) => {
      setLobby((prev) => ({ ...prev, [key]: value }));
    },
    [setLobby]
  );

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
        <h2 className="sub-title glass-dark">Join Lobby</h2>
        <div id="join-lobby" className="mt-1"></div>
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
    </div>
  );
};

function createLobby(mode: string | LOBBY) {
  return {
    mode,
    key: null,
    players: [],
  };
}
