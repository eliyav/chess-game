import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LOBBY_TYPE, Lobby, buildDefaultOptions } from "../../shared/match";
import { SelectionButton } from "../components/buttons/start-button";
import { ControllerOptionsList } from "../components/lobby/controller-options-list";
import PlayerCard from "../components/lobby/player-card";
import { APP_ROUTES } from "../../shared/routes";
import { BackButton } from "../components/svg/back-button";

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

  const updateOpponentType = useCallback(() => {
    const player = lobby?.players[0];
    if (player) {
      const opponentType = lobby?.players[1].type;
      const newType = opponentType === "Computer" ? "Human" : "Computer";
      const opponentName =
        opponentType === "Computer" ? "Player 2" : "BOT - Depth 3";
      updateLobby("players", [
        player,
        { name: opponentName, ready: false, id: "2", type: newType },
      ]);
    }
  }, [lobby, updateLobby]);

  useEffect(() => {
    setLobby({
      mode: LOBBY_TYPE.LOCAL,
      key: "",
      players: [
        { name: "Player 1", ready: false, id: "1", type: "Human" },
        { name: "BOT - Depth 3", ready: false, id: "2", type: "Computer" },
      ],
      teams: {
        White: "1",
        Black: "2",
      },
      matchStarted: false,
      controllerOptions: buildDefaultOptions(),
    });
  }, []);

  if (!lobby) return null;

  return (
    <div className="grid grid-rows-5 h-dvh select-none md:w-1/2 md:m-auto z-10">
      <div className="flex grid-rows-1 justify-center align-center glass dark-pane m-4">
        <BackButton
          className={
            "inline-block h-full border-r-2 border-white min-w-16 p-3 hover:bg-white hover:bg-opacity-10"
          }
          size={30}
          onClick={() => navigate(APP_ROUTES.Lobby)}
        />
        <h1 className="inline-block place-self-center text-white grow text-center text-3xl font-bold italic pb-2">
          Offline Lobby
        </h1>
      </div>
      <div className="row-span-3 flex flex-col gap-2 p-2 align-center md:w-3/4 md:justify-self-center">
        <div>
          <h2 className="glass dark-pane text-white text-lg text-center tracking-widest italic font-bold">
            Players
          </h2>
          <div className="flex flex-wrap justify-center m-2 gap-1">
            {lobby?.players.map((player, i) => (
              <PlayerCard key={i} name={player.name} type={player.type} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="glass dark-pane text-white text-lg text-center tracking-widest italic font-bold">
            Settings
          </h2>
          <ControllerOptionsList
            uniqueOptions={[
              {
                text: `VS ${
                  lobby.players[1].type === "Computer" ? "Human" : "Computer"
                }`,
                onChange: updateOpponentType,
                disabled: lobby.players.length === 1,
              },
            ]}
            options={lobby.controllerOptions}
            onChange={(key: string) =>
              (e: React.ChangeEvent<HTMLInputElement>) =>
                updateLobby("controllerOptions", {
                  ...lobby.controllerOptions,
                  [key]: e.target.checked,
                })}
          />
        </div>
      </div>
      <SelectionButton
        customClass="row-start-5 m-10 font-bold text-2xl border-2 border-white italic tracking-widest hover:opacity-80 md:w-1/2 md:justify-self-center"
        disabled={lobby.mode !== LOBBY_TYPE.LOCAL}
        text={"Start Game"}
        onClick={() => {
          navigate("/game");
        }}
      />
    </div>
  );
};
