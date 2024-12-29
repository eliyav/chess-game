import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ControllerOptions,
  LOBBY_TYPE,
  Lobby,
  PlayerType,
  createLobby,
} from "../../shared/match";
import { APP_ROUTES } from "../../shared/routes";
import { SelectionButton } from "../components/buttons/selection-button";
import { ControllerOptionsList } from "../components/lobby/controller-options-list";
import PlayerCard from "../components/lobby/player-card";
import { BackButton } from "../components/svg/back-button";
import { POSSIBLE_DEPTHS } from "../game-logic/bot-opponent";

export const OfflineLobby: React.FC<{
  lobby: Lobby | undefined;
  setLobby: React.Dispatch<React.SetStateAction<Lobby | undefined>>;
  options: ControllerOptions;
  updateOptions: <KEY extends keyof ControllerOptions>(
    key: KEY,
    value: ControllerOptions[KEY]
  ) => void;
}> = ({ setLobby, lobby, updateOptions, options }) => {
  const navigate = useNavigate();

  const updateLobby = useCallback(
    <KEY extends keyof Lobby>(key: KEY, value: Lobby[KEY]) => {
      setLobby((prev) => ({
        mode: prev?.mode ?? LOBBY_TYPE.LOCAL,
        key: prev?.key ?? "",
        players: prev?.players ?? [],
        matchStarted: prev?.matchStarted ?? false,
        time: prev?.time ?? 10,
        [key]: value,
      }));
    },
    [setLobby]
  );

  const updateOpponentType = useCallback(() => {
    const players = lobby?.players;
    if (players) {
      const [player, player2] = players;
      const isVsComputer = player2.type === "computer";
      updateLobby("players", [
        player,
        {
          name: isVsComputer ? "Player 2" : "BOT",
          ready: false,
          id: "2",
          type: isVsComputer ? "human" : "computer",
          depth: isVsComputer ? 0 : 3,
          team: player2.team,
        },
      ]);
    }
  }, [lobby, updateLobby]);

  useEffect(() => {
    const vs = new URLSearchParams(location.search).get(
      "vs"
    ) as PlayerType | null;
    const depth = new URLSearchParams(location.search).get("depth");
    const time = new URLSearchParams(location.search).get("time");
    const newLobby = createLobby({ type: LOBBY_TYPE.LOCAL, vs, depth, time });
    if (newLobby) {
      if (newLobby.players[1].type === "computer") {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set("vs", vs || newLobby.players[1].type);
        searchParams.set("depth", String(newLobby.players[1].depth));
        searchParams.set("time", time ?? String(newLobby.time));
        navigate(`${location.pathname}?${searchParams.toString()}`);
      }
      setLobby(newLobby);
    }
  }, [location]);

  if (!lobby) return null;

  return (
    <div className="grid grid-rows-5 h-dvh select-none md:w-3/4 md:max-w-4xl md:m-auto z-10 overflow-hidden">
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
          return (
            <React.Fragment key={i}>
              <PlayerCard player={player} hideReady={true}>
                {player.type === "computer" ? (
                  <div className="overflow-x-scroll whitespace-nowrap mt-1 p-1 rounded bg-slate-700 text-slate-200">
                    <span className="text-sm pr-2">Depth</span>
                    {POSSIBLE_DEPTHS.map((depth) => (
                      <button
                        key={depth}
                        className={`py-1.5 px-2.5 mx-1 rounded ${
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
          <ControllerOptionsList
            uniqueOptions={[
              {
                text: `Time: ${lobby.time === 0 ? "∞" : lobby.time} min`,
                className: "inline-block p-1 w-full",
                onChange: (e) => {
                  const target = e.target as HTMLInputElement;
                  const time = parseInt(target.value, 10);
                  updateLobby("time", time);
                },
                render: () => (
                  <div className="relative flex items-center gap-x-2 w-full bg-slate-700 p-2 rounded-lg border-2 border-slate-200 text-center text-white text-lg min-w-16 font-bold">
                    <div className="w-1/3">
                      <span className="text-4xl truncate">
                        {lobby.time === 0 ? "∞" : lobby.time}
                      </span>
                    </div>
                    <span>min</span>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={lobby.time}
                      onChange={(e) => {
                        const time = parseInt(e.target.value, 10);
                        updateLobby("time", time);
                      }}
                      className="slider inline-block bg-slate-200"
                    />
                  </div>
                ),
              },
              {
                text: `VS ${
                  lobby.players[1]
                    ? lobby.players[1].type === "computer"
                      ? "human"
                      : "computer"
                    : "computer"
                }`,
                onChange: updateOpponentType,
                className: "inline-block p-1 w-1/2",
              },
              {
                text: "Switch Teams",
                className: "inline-block p-1 w-1/2",
                onChange: () => {
                  const players = [...lobby.players];
                  const temp = players[0].team;
                  players[0].team = players[1].team;
                  players[1].team = temp;
                  updateLobby("players", players);
                },
                disabled: false,
              },
            ]}
            options={options}
            onChange={(key) => (e: React.ChangeEvent<HTMLInputElement>) =>
              updateOptions(key, e.target.checked)}
          />
        </div>
      </div>
      <SelectionButton
        customClass="row-start-5 m-10 font-bold text-4xl border-2 border-white italic tracking-widest hover:opacity-80 md:w-1/2 md:justify-self-center"
        text={"Start Game"}
        onClick={() => {
          if (lobby.players[1].type === "computer") {
            navigate(
              `${APP_ROUTES.Game}?type=${LOBBY_TYPE.LOCAL}&vs=${lobby.players[1].type}&depth=${lobby.players[1].depth}`
            );
          } else {
            navigate(
              `${APP_ROUTES.Game}?type=${LOBBY_TYPE.LOCAL}&vs=${lobby.players[1].type}`
            );
          }
        }}
      />
    </div>
  );
};
