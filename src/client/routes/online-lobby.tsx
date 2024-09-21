import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lobby } from "../../shared/match";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { websocket } from "../websocket-client";
import PlayerCard from "../components/lobby/player-card";
import { ControllerOptionsList } from "../components/lobby/controller-options-list";
import { Pawn } from "../components/svg/pawn";
import { Switch } from "../components/svg/switch";

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
      <div className="lobby-contents">
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
          {lobby.players[0] ? (
            <div className="flex">
              <Pawn
                className="team-symbol-background"
                color={
                  lobby.teams.White === lobby.players[0].id
                    ? "#ffffff"
                    : "#000000"
                }
              />
              <PlayerCard player={lobby.players[0]} showReady={true} />
            </div>
          ) : null}
          <Switch
            className="gold"
            onClick={() => {
              websocket.emit("switchTeams", { lobbyKey });
            }}
          />
          {lobby.players[1] ? (
            <div className="flex">
              <PlayerCard player={lobby.players[1]} showReady={true} />
              <Pawn
                className="team-symbol-background"
                color={
                  lobby.teams.White === lobby.players[1].id
                    ? "#ffffff"
                    : "#000000"
                }
              />
            </div>
          ) : null}
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
      </div>
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
  );
};
