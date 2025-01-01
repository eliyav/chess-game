import React from "react";
import { useNavigate } from "react-router-dom";
import { Lobby, LOBBY_TYPE } from "../../../shared/match";
import { APP_ROUTES } from "../../../shared/routes";
import { POSSIBLE_DEPTHS } from "../../game-logic/bot-opponent";
import { SelectionButton } from "../buttons/selection-button";
import { BackButton } from "../svg/back-button";
import { Gear } from "../svg/gear";
import { ControllerOptionsList } from "./controller-options-list";
import PlayerCard from "./player-card";

export const OfflineLobby: React.FC<{
  lobby: Lobby;
  updateLobby: <KEY extends keyof Lobby>(key: KEY, value: Lobby[KEY]) => void;
  updateOpponentType: () => void;
}> = ({ lobby, updateLobby, updateOpponentType }) => {
  const navigate = useNavigate();

  const player2 = lobby.players[1];

  return (
    <div className="grid grid-rows-5 h-dvh select-none md:w-3/4 md:max-w-4xl md:m-auto z-10 overflow-hidden">
      <div className="flex grid-rows-1 justify-center align-center glass dark-pane m-4">
        <BackButton
          className={
            "inline-block h-full border-r-2 border-white min-w-16 p-3 hover:bg-white hover:bg-opacity-10"
          }
          size={30}
          onClick={() => navigate(APP_ROUTES.LOBBY_SELECT)}
        />
        <h1 className="inline-block place-self-center text-white grow text-center text-4xl font-bold italic pb-2">
          Offline Lobby
        </h1>
      </div>
      <div className="row-start-2 row-span-1 ml-auto mr-auto w-11/12 flex flex-col flex-wrap gap-0.5 justify-center md:w-3/4">
        {lobby.players.map((player, i) => {
          return (
            <PlayerCard key={i} player={player} hideReady={true}>
              {player.type === "computer" ? (
                <div className="overflow-x-scroll whitespace-nowrap mt-1 p-1 rounded bg-slate-800 text-slate-200">
                  <span className="text-sm pr-2">Depth</span>
                  {POSSIBLE_DEPTHS.map((depth, i) => (
                    <button
                      key={i}
                      className={`py-1.5 px-2.5 mx-1 rounded border-2 border-black ${
                        lobby.depth === depth
                          ? "bg-slate-500  border-white"
                          : "bg-slate-600 border-transparent hover:bg-slate-500"
                      }`}
                      onClick={() => {
                        updateLobby("depth", depth);
                      }}
                    >
                      {depth}
                    </button>
                  ))}
                </div>
              ) : null}
            </PlayerCard>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 p-2 align-center">
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
                  player2
                    ? player2.type === "computer"
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
          />
        </div>
      </div>
      <button
        className="m-auto w-fit h-fit z-10 rounded-full p-3 border-2 bg-slate-700 border-slate-200 hover:bg-white hover:bg-opacity-10 !important"
        onClick={() => navigate(APP_ROUTES.SETTINGS)}
      >
        <Gear size={30} />
      </button>
      <SelectionButton
        customClass="row-start-5 m-10 font-bold text-4xl border-2 border-white italic tracking-widest hover:opacity-80 md:w-1/2 md:justify-self-center "
        text={"Start Game"}
        onClick={() => {
          if (player2.type === "computer") {
            navigate(
              `${APP_ROUTES.GAME}?type=${LOBBY_TYPE.LOCAL}&vs=${player2.type}&depth=${lobby.depth}&time=${lobby.time}`
            );
          } else {
            navigate(
              `${APP_ROUTES.GAME}?type=${LOBBY_TYPE.LOCAL}&vs=${player2.type}&time=${lobby.time}`
            );
          }
        }}
      />
    </div>
  );
};
