import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { LobbySettings } from "../../shared/lobby";

export const OnlineLobby: React.FC<{
  socket: Socket;
}> = ({ socket }) => {
  const navigate = useNavigate();
  const { room, player } = useLocation().state as {
    room: string;
    player: string;
  };

  const [lobby, setLobby] = useState<LobbySettings>();

  useEffect(() => {
    socket.on("match-start", () => {
      navigate("/game", { state: { lobby, player } });
    });

    return () => {
      socket.off("match-start");
    };
  }, [socket, navigate, lobby, player]);

  useEffect(() => {
    socket.on("lobby-info", (settings: LobbySettings) => {
      setLobby(settings);
    });

    return () => {
      socket.off("lobby-info");
      socket.off("match-start");
    };
  }, [socket, setLobby]);

  useEffect(() => {
    if (room) {
      socket.emit("join-room", { room });
    }
  }, [room]);

  return (
    <div className="lobby screen">
      <div className="header glass-dark">
        <BackButton
          customClass={"bottom-left"}
          size={30}
          onClick={() => navigate(-1)}
        />
        <h1>Online Lobby</h1>
      </div>
      <div>
        <div className="lobby-code">
          <h2 className="sub-title glass-dark">Room</h2>
          <p>
            <span
              onClick={() => {
                try {
                  const text = room ?? "";
                  navigator.clipboard.writeText(text);
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              {room ?? "..."}
            </span>
          </p>
        </div>
        <h2 className="sub-title glass-dark">Players</h2>
        <div className="selections">
          {lobby?.players.map((player, i) => (
            <button key={i}>{player}</button>
          ))}
        </div>
        <footer>
          <SelectionButton
            text={"Start Game"}
            onClick={() => {
              socket.emit("request-match-start", { room });
            }}
            disabled={lobby ? lobby.players.length < 2 : true}
          />
        </footer>
      </div>
    </div>
  );
};
