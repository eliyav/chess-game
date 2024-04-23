import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LobbyInfo, WebSocketClient } from "../websocket";

export const Lobby: React.FC<{
  webSocketClient: WebSocketClient;
}> = ({ webSocketClient }) => {
  const [lobby, setLobby] = useState<LobbyInfo>();
  const lobbyRequested = useRef(false);

  useEffect(() => {
    if (!lobby && lobbyRequested.current === false) {
      lobbyRequested.current = true;
      webSocketClient.createLobby("username");
    }
  }, []);

  useEffect(() => {
    if (!webSocketClient.socket.hasListeners("lobby-info")) {
      webSocketClient.socket.on("lobby-info", (lobby) => {
        console.log(lobby);
        setLobby(lobby);
      });
    }
  }, []);

  return (
    <div className="lobby screen">
      <h1 className="sub-title">Lobby</h1>;
      <div className="lobby-modes">
        <h2 className="label">Join Lobby</h2>
        <input type="text" placeholder="Enter here"></input>
      </div>
      {lobby && (
        <div>
          <div className="lobby-code">
            <h2 className="label">Invite Code</h2>
            <p className="selection">{lobby.lobbyKey}</p>
          </div>
          <div className="players">
            <h2 className="label">Players</h2>
            <div className="selections">
              <div className={`selection highlight"}`}>
                {lobby.players.player1.name}
              </div>
              <div className={`selection highlight"}`}>
                {lobby.players.player2.name}
              </div>
            </div>
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
                onChange={(e) =>
                  webSocketClient.updateTime(
                    lobby.lobbyKey,
                    e.currentTarget.value
                  )
                }
              ></input>
              <p className="time-display">
                {lobby.time === "0" ? "No Limit" : lobby.time}
              </p>
            </div>
          </div>
          <div className="menu">
            <Link to={"/game"}>
              <button className="menu-btn">Start</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
