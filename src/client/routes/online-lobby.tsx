import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lobby, TEAM } from "../../shared/match";
import { APP_ROUTES } from "../../shared/routes";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { ControllerOptionsList } from "../components/lobby/controller-options-list";
import PlayerCard from "../components/lobby/player-card";
import { Pawn } from "../components/svg/pawn";
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
    return () => {
      if (!lobby?.matchStarted) {
        websocket.emit("leaveLobby", { lobbyKey });
      }
    };
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
    <div className="grid grid-rows-5 h-dvh md:w-1/2 md:m-auto z-10">
      <div className="flex grid-rows-1 justify-center align-center glass dark-pane m-4">
        <BackButton
          customClass={
            "inline-block border-r-2 border-white min-w-16 p-3 hover:bg-white hover:bg-opacity-10"
          }
          size={30}
          onClick={() => navigate(APP_ROUTES.Lobby)}
        />
        <div className="inline-block grow place-content-center">
          <h1 className="place-self-center text-white text-center text-3xl font-bold italic pb-2">
            Online Lobby
          </h1>
          <p className="text-white text-center tracking-widest italic font-bold mt-2">
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
              Invite Code:{" "}
              <span className="select-all cursor-pointer">
                {lobby.key ?? "..."}
              </span>
            </span>
          </p>
        </div>
      </div>
      <div className="row-span-3 flex flex-col gap-2 p-2 align-center md:w-3/4 md:justify-self-center">
        <h2 className="glass dark-pane text-white text-lg text-center tracking-widest italic font-bold">
          Players
        </h2>
        <div className="flex flex-wrap justify-center m-2 gap-1">
          {lobby.players.map((player, i) => {
            return (
              <React.Fragment key={i}>
                <PlayerCard
                  name={player.name}
                  ready={player.ready}
                  team={
                    lessThanTwoPlayers
                      ? undefined
                      : lobby.teams.White === player.id
                      ? TEAM.WHITE
                      : TEAM.BLACK
                  }
                >
                  {!lessThanTwoPlayers ? (
                    <Pawn
                      size={24}
                      className="team-symbol-background"
                      color={
                        lobby.teams.White === player.id ? "#ffffff" : "#000000"
                      }
                    />
                  ) : null}
                </PlayerCard>
              </React.Fragment>
            );
          })}
          {!player2 && <PlayerCard name={"Waiting for player..."} />}
        </div>
        <h2 className="glass dark-pane text-white text-lg text-center tracking-widest italic font-bold">
          Settings
        </h2>
        <ControllerOptionsList
          options={lobby.controllerOptions}
          onChange={(key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
            websocket.emit("updateControllerOptions", {
              lobbyKey: lobby.key,
              options: { [key]: e.target.checked },
            })}
          onSwitchTeams={() => {
            websocket.emit("switchTeams", { lobbyKey: lobby.key });
          }}
          disableSwitchTeams={lessThanTwoPlayers}
        />
      </div>
      <div className="row-start-5 flex justify-center items-end mb-2">
        <label
          onClick={(e) => {
            const target = e.target as HTMLInputElement;
            if (!target.checked) {
              e.currentTarget.classList.remove("bg-green-500");
              e.currentTarget.classList.add("bg-red-500");
            } else {
              e.currentTarget.classList.remove("bg-red-500");
              e.currentTarget.classList.add("bg-green-500");
            }
          }}
          className={`select-none basis-1/2 m-2 p-2 text-xl glass text-white border-2 border-white text-center tracking-widest italic font-bold bg-red-500 ${
            disableReadyButton ? "opacity-50" : ""
          } `}
        >
          <input
            type="checkbox"
            disabled={disableReadyButton}
            onClick={() => {
              websocket.emit("readyPlayer", { lobbyKey: lobby.key });
            }}
            className="hidden"
          />
          Ready
        </label>
        <SelectionButton
          customClass={`basis-1/2 m-2 p-2 font-bold text-xl border-2 border-white italic tracking-widest hover:opacity-80 md:w-1/2 md:justify-self-center ${
            disableMatchStart ? "opacity-50" : ""
          }`}
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
