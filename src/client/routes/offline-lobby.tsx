import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LOBBY_TYPE, Lobby, buildDefaultOptions } from "../../shared/match";
import { APP_ROUTES } from "../../shared/routes";
import { SelectionButton } from "../components/buttons/start-button";
import { ControllerOptionsList } from "../components/lobby/controller-options-list";
import PlayerCard from "../components/lobby/player-card";
import { BackButton } from "../components/svg/back-button";
import { POSSIBLE_DEPTHS } from "../game-logic/bot-opponent";

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
    const players = lobby?.players;
    if (players) {
      const [player, player2] = players;
      const isVsComputer = player2.type === "Computer";
      updateLobby("players", [
        player,
        {
          name: isVsComputer ? "Player 2" : "BOT",
          ready: false,
          id: "2",
          type: isVsComputer ? "Human" : "Computer",
          depth: isVsComputer ? 0 : 3,
        },
      ]);
    }
  }, [lobby, updateLobby]);

  useEffect(() => {
    setLobby({
      mode: LOBBY_TYPE.LOCAL,
      key: "",
      players: [
        { name: "Player 1", ready: false, id: "1", type: "Human" },
        {
          name: "BOT",
          ready: false,
          id: "2",
          type: "Computer",
          depth: 3,
        },
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
    <div className="grid grid-rows-5 h-dvh select-none md:w-3/4 md:max-w-4xl md:m-auto z-10">
      <div className="flex grid-rows-1 justify-center align-center glass dark-pane m-4">
        <BackButton
          className={
            "inline-block h-full border-r-2 border-white min-w-16 p-3 hover:bg-white hover:bg-opacity-10"
          }
          size={30}
          onClick={() => navigate(APP_ROUTES.Lobby)}
        />
        <h1 className="inline-block place-self-center text-white grow text-center text-4xl font-bold italic pb-2">
          Offline Lobby
        </h1>
      </div>
      <div className="h-42 ml-auto mr-auto w-11/12 row-span-1 flex flex-col flex-wrap gap-0.5 justify-center md:w-3/4">
        {lobby.players.map((player, i) => {
          const team = lobby.teams.White === player.id ? "White" : "Black";
          return (
            <React.Fragment key={i}>
              <PlayerCard player={player} team={team}>
                {player.type === "Computer" ? (
                  <div className="overflow-x-scroll whitespace-nowrap mt-1 p-1 rounded bg-slate-700 text-slate-200">
                    <span className="text-sm">Depth</span>
                    {POSSIBLE_DEPTHS.map((depth) => (
                      <button
                        key={depth}
                        className={`p-1.5 mx-1 rounded ${
                          player.depth === depth
                            ? "bg-slate-500 border-2 border-white"
                            : "bg-slate-600 border-2 border-transparent hover:bg-slate-500"
                        }`}
                        onClick={() => {
                          updateLobby("players", [
                            lobby.players[0],
                            {
                              ...player,
                              depth,
                            },
                          ]);
                        }}
                      >
                        {depth}
                      </button>
                    ))}
                  </div>
                ) : null}
              </PlayerCard>
            </React.Fragment>
          );
        })}
      </div>
      <div className="row-span-2 flex flex-col gap-2 p-2 align-center">
        <div>
          <h2 className="glass dark-pane text-white text-lg text-center tracking-widest italic font-bold">
            Settings
          </h2>
          <ControllerOptionsList
            uniqueOptions={[
              {
                text: `VS ${
                  lobby.players[1]
                    ? lobby.players[1].type === "Computer"
                      ? "Human"
                      : "Computer"
                    : "Computer"
                }`,
                onChange: updateOpponentType,
                disabled: lobby.players.length === 1,
              },
              {
                text: "Switch Teams",
                onChange: () => {
                  const temp = lobby.teams.White;
                  updateLobby("teams", {
                    White: lobby.teams.Black,
                    Black: temp,
                  });
                },
                disabled: false,
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
