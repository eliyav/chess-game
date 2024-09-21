import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lobby } from "../../shared/match";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { websocket } from "../websocket-client";
import PlayerCard from "../components/lobby/player-card";
import { ControllerOptionsList } from "../components/lobby/controller-options-list";

export const OnlineLobby: React.FC<{
  lobby: Lobby | undefined;
}> = ({ lobby }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const lobbyKey = location.search.split("=")[1];
  const playersReady = lobby?.players.every((player) => player.ready);
  const disableReadyButton =
    lobby?.teams.White === "" ||
    lobby?.teams.Black === "" ||
    lobby?.players.length !== 2;
  const disableMatchStart = lobby
    ? lobby.players.length < 2 || !playersReady
    : true;

  useEffect(() => {
    if (lobbyKey) {
      websocket.emit("joinLobby", { lobbyKey });
    }

    return () => {
      if (lobbyKey) {
        if (lobby?.matchStarted === false) {
          websocket.emit("leaveLobby", { lobbyKey });
        }
      }
    };
  }, [lobbyKey, websocket]);

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
                  const text = lobbyKey ?? "";
                  navigator.clipboard.writeText(text);
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              {lobbyKey ?? "..."}
            </span>
          </p>
        </div>
        <h2 className="sub-title glass-dark">Players</h2>
        <div className="flex">
          {lobby?.players.map((player, i) => (
            <PlayerCard key={i} player={player} showReady={true} />
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
                  websocket.emit("setTeams", {
                    lobbyKey,
                    first: e.target.value,
                  });
                }}
                style={{ display: "none" }}
              />
              <label htmlFor={`first-move-${player.id}`}>{player.name}</label>
            </div>
          ))}
        </div>
        <h2 className="sub-title glass-dark">Settings</h2>
        <ControllerOptionsList
          options={lobby.controllerOptions}
          onChange={(key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
            websocket.emit("updateControllerOptions", {
              lobbyKey,
              options: { [key]: e.target.checked },
            })}
        />
        <footer>
          <div className="flex ready">
            <input
              type="checkbox"
              id="ready-checkbox"
              disabled={disableReadyButton}
              onClick={() => {
                websocket.emit("readyPlayer", { lobbyKey });
              }}
              style={{ display: "none" }}
            />
            <label htmlFor="ready-checkbox">Ready</label>
          </div>

          <SelectionButton
            customClass="mgn-1"
            text={"Start Game"}
            onClick={() => {
              websocket.emit("requestMatchStart", { lobbyKey });
            }}
            disabled={disableMatchStart}
          />
        </footer>
      </div>
    </div>
  );
};
