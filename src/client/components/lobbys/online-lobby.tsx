import React from "react";
import { Socket } from "socket.io-client";
import { LobbySettings } from "../../routes/lobby";
import { Clock } from "../buttons/clock";

export const OnlineLobby: React.FC<{
  socket: Socket;
  lobby: LobbySettings;
  setTime: (time: number) => void;
}> = ({ socket, lobby, setTime }) => {
  // useEffect(() => {
  //   socket.on("room-info", (settings: LobbySettings) => {
  //     setLobbySettings(settings);
  //   });
  //   return () => {
  //     socket.off("room-info");
  //   };
  // }, []);

  // useEffect(() => {
  //   if (mode === "online") socket.emit("create-lobby", lobbySettings);
  // }, []);

  // useEffect(() => {
  //   if (lobbySettings.lobbyKey) socket.emit("update-lobby", { lobbySettings });
  // }, [lobbySettings]);

  return (
    <div>
      <div className="lobby-code">
        <h2 className="sub-title glass-dark">Invite Code</h2>
        <p>
          <span>{lobby.key ?? "..."}</span>
        </p>
      </div>
      <h2 className="sub-title glass-dark">Players</h2>
      <div className="selections">
        {lobby.players.map((player) => (
          <button>{player}</button>
        ))}
      </div>
      <Clock time={lobby.time} setTime={setTime} />
    </div>
  );
};
