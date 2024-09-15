import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { Lobby } from "../../shared/match";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";

export const OnlineLobby: React.FC<{
  socket: Socket;
  lobby: Lobby | undefined;
}> = ({ socket, lobby }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const room = location.search.split("=")[1];
  const playersReady = lobby?.players.every((player) => player.ready);
  const disableReadyButton =
    lobby?.teams.White === "" ||
    lobby?.teams.Black === "" ||
    lobby?.players.length !== 2;
  const disableMatchStart = lobby
    ? lobby.players.length < 2 || !playersReady
    : true;

  useEffect(() => {
    if (room) {
      socket.emit("join-room", { room });
    }

    return () => {
      if (room) {
        if (lobby?.matchStarted === false) {
          socket.emit("leave-room", { room });
        }
      }
    };
  }, [room, socket]);

  if (!lobby) return null;

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
          {lobby?.players.map((player, i) => (
            <div className="player-card" key={i}>
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
        <h2 className="sub-title glass-dark">First Move (White Team)</h2>
        <div className="flex">
          {lobby?.players.map((player, i) => (
            <div className="player-card" key={i}>
              <input
                type="radio"
                id={`first-move-${player.id}`}
                name="first-move"
                value={player.id}
                checked={lobby.teams.White === player.id}
                disabled={lobby?.players.length !== 2}
                onChange={(e) => {
                  socket.emit("set-teams", {
                    room,
                    first: e.target.value,
                  });
                }}
                style={{ display: "none" }}
              />
              <label htmlFor={`first-move-${player.id}`}>{player.name}</label>
            </div>
          ))}
        </div>
        <footer>
          <div className="flex ready">
            <input
              type="checkbox"
              id="ready-checkbox"
              disabled={disableReadyButton}
              onClick={() => {
                socket.emit("readyPlayer", { room });
              }}
              style={{ display: "none" }}
            />
            <label htmlFor="ready-checkbox">Ready</label>
          </div>

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
