import { RandomGUID } from "@babylonjs/core";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { Lobby } from "../../shared/match";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";

export const OnlineLobby: React.FC<{
  socket: Socket;
}> = ({ socket }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const room = location.search.split("=")[1];
  const [lobby, setLobby] = useState<Lobby>();
  const playersReady = lobby?.players.every((player) => player.ready);
  const disableMatchStart = lobby
    ? lobby.players.length < 2 || !playersReady
    : true;
  // useEffect(() => {
  //   socket.on("match-start", () => {
  //     navigate("/game", { state: { lobby, player } });
  //   });

  //   return () => {
  //     socket.off("match-start");
  //   };
  // }, [socket, navigate, lobby, player]);

  useEffect(() => {
    socket.on("lobby-info", (lobby: Lobby) => {
      setLobby(lobby);
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

    return () => {
      if (room) {
        socket.emit("leave-room", { room });
      }
    };
  }, [room, socket]);

  return (
    <div className="lobby screen">
      <div className="header glass-dark">
        <BackButton
          customClass={"bottom-left"}
          size={30}
          onClick={() => navigate("/lobby")}
        />
        <h1>Online Lobby</h1>
      </div>
      <div>
        <div className="lobby-code">
          <h2 className="sub-title glass-dark">Invite Code</h2>
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
        <div className="flex">
          {lobby?.players.map((player) => (
            <div className="player-card">
              <p style={{ fontWeight: "bold" }} key={player.id}>
                {player.name}
              </p>
              <p>
                Ready:{" "}
                {player.ready ? (
                  <span className={"green-highlight"}>✔</span>
                ) : (
                  <span className={"red-highlight"}>✖</span>
                )}
              </p>
            </div>
          ))}
        </div>
        <h2 className="sub-title glass-dark">Teams</h2>
        <div className="flex">
          <button>White</button>
          <button>Black</button>
        </div>
        <div className="flex">
          <label>Ready</label>
          <input
            type="checkbox"
            onClick={() => {
              socket.emit("readyPlayer", { room });
            }}
          ></input>
        </div>
        <footer>
          <SelectionButton
            customClass="mgn-1"
            text={"Start Game"}
            onClick={() => {
              socket.emit("request-match-start", { room });
            }}
            disabled={disableMatchStart}
          />
        </footer>
      </div>
    </div>
  );
};
