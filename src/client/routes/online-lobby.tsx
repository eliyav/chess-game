import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lobby, TEAM } from "../../shared/match";
import { APP_ROUTES } from "../../shared/routes";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { ControllerOptionsList } from "../components/lobby/controller-options-list";
import PlayerCard from "../components/lobby/player-card";
import { Pawn } from "../components/svg/pawn";
import { Switch } from "../components/svg/switch";
import { websocket } from "../websocket-client";

export const OnlineLobby: React.FC<{
  lobby: Lobby | undefined;
}> = ({ lobby }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const lobbyKey = location.search.split("=")[1];
    if (lobbyKey) {
      websocket.emit("joinLobby", { lobbyKey });
    }
  }, [websocket, location]);

  if (!lobby) return null;

  const [player1, player2] = lobby.players;
  const lessThanTwoPlayers = lobby.players.length < 2;
  const playersReady = lobby.players.every((player) => player.ready);
  const disableReadyButton =
    lobby.teams.White === "" ||
    lobby.teams.Black === "" ||
    lobby.players.length !== 2;
  const disableMatchStart = lobby.players.length < 2 || !playersReady;

  return (
    <div className="content flex-column h-100">
      <div className="header glass-dark">
        <BackButton
          customClass={"bottom-left"}
          size={30}
          onClick={() => navigate(APP_ROUTES.Lobby)}
        />
        <h1>Online Lobby</h1>
      </div>
      <div className="lobby-content">
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
        <div className="flex">
          {player1 ? (
            <div className="flex">
              {!lessThanTwoPlayers && (
                <Pawn
                  className="team-symbol-background"
                  color={
                    lobby.teams.White === player1.id ? "#ffffff" : "#000000"
                  }
                />
              )}
              <PlayerCard
                name={player1.name}
                ready={player1.ready}
                type={player1.type}
                team={
                  lessThanTwoPlayers
                    ? undefined
                    : lobby.teams.White === player1.id
                    ? TEAM.WHITE
                    : TEAM.BLACK
                }
              />
            </div>
          ) : null}
          {!lessThanTwoPlayers && (
            <Switch
              className="gold-switch"
              onClick={() => {
                websocket.emit("switchTeams", { lobbyKey: lobby.key });
              }}
            />
          )}
          {player2 ? (
            <div className="flex">
              <PlayerCard
                name={player2.name}
                ready={player2.ready}
                type={player2.type}
                team={
                  lessThanTwoPlayers
                    ? undefined
                    : lobby.teams.White === player2.id
                    ? TEAM.WHITE
                    : TEAM.BLACK
                }
              />
              {!lessThanTwoPlayers && (
                <Pawn
                  className="team-symbol-background"
                  color={
                    lobby.teams.White === player2.id ? "#ffffff" : "#000000"
                  }
                />
              )}
            </div>
          ) : null}
        </div>
        <h2 className="sub-title glass-dark">Settings</h2>
        <ControllerOptionsList
          options={lobby.controllerOptions}
          onChange={(key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
            websocket.emit("updateControllerOptions", {
              lobbyKey: lobby.key,
              options: { [key]: e.target.checked },
            })}
        />
      </div>
      <div className="flex-align-end pb-1">
        <div className="ready">
          <input
            type="checkbox"
            id="ready-checkbox"
            disabled={disableReadyButton}
            onClick={() => {
              websocket.emit("readyPlayer", { lobbyKey: lobby.key });
            }}
            style={{ display: "none" }}
          />
          <label htmlFor="ready-checkbox">Ready</label>
        </div>
        <SelectionButton
          text={"Start Game"}
          onClick={() => {
            websocket.emit("requestMatchStart", { lobbyKey: lobby.key });
          }}
          disabled={disableMatchStart}
        />
      </div>
    </div>
  );
};
