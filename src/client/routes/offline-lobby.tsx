import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LOBBY_TYPE, Lobby } from "../../shared/match";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import PlayerCard from "../components/lobby/player-card";
import { buildDefaultOptions, getOptionText } from "../match-logic/options";
import { Controller } from "../match-logic/controller";
import { ControllerOptionsList } from "../components/lobby/controller-options-list";

export const OfflineLobby: React.FC<{
  lobby: Lobby | undefined;
  setLobby: React.Dispatch<React.SetStateAction<Lobby | undefined>>;
}> = ({ setLobby, lobby }) => {
  const navigate = useNavigate();

  const updateLobby = useCallback(
    <KEY extends keyof Lobby>(key: KEY, value: Lobby[KEY]) => {
      setLobby((prev) => ({
        mode: prev?.mode ?? LOBBY_TYPE.LOCAL,
        key: prev?.key ?? "",
        players: prev?.players ?? [],
        teams: prev?.teams ?? { White: "", Black: "" },
        matchStarted: prev?.matchStarted ?? false,
        controllerOptions: prev?.controllerOptions ?? buildDefaultOptions(),
        [key]: value,
      }));
    },
    [setLobby]
  );

  useEffect(() => {
    setLobby({
      mode: LOBBY_TYPE.LOCAL,
      key: "",
      players: [
        { name: "Player 1", ready: false, id: "1", type: "Human" },
        { name: "Player 2", ready: false, id: "2", type: "Human" },
      ],
      teams: {
        White: "",
        Black: "",
      },
      matchStarted: false,
      controllerOptions: buildDefaultOptions(),
    });
  }, [setLobby]);

  if (!lobby) return null;

  return (
    <div className="lobby screen">
      <div className="header glass-dark">
        <BackButton
          customClass={"bottom-left"}
          size={30}
          onClick={() => navigate("/lobby")}
        />
        <h1>Offline Lobby</h1>
      </div>
      <h2 className="sub-title glass-dark">Players</h2>
      <div className="flex">
        {lobby?.players.map((player, i) => (
          <PlayerCard key={i} player={player} showReady={false} />
        ))}
      </div>
      <h2 className="sub-title glass-dark">Settings</h2>
      <ControllerOptionsList
        options={lobby.controllerOptions}
        onChange={(key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
          updateLobby("controllerOptions", {
            ...lobby.controllerOptions,
            [key]: e.target.checked,
          })}
      />
      <footer>
        <SelectionButton
          disabled={lobby.mode !== LOBBY_TYPE.LOCAL}
          customClass="mgn-1"
          text={"Start Game"}
          onClick={() => {
            navigate("/game");
          }}
        />
      </footer>
    </div>
  );
};
