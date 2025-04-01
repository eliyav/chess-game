import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ENV_BASE_URL } from "../..";
import { MATCH_TYPE } from "../../../shared/match";
import { APP_ROUTES } from "../../../shared/routes";
import { websocket } from "../../websocket-client";
import { SelectionButton } from "../buttons/selection-button";
import LoadingScreen from "../loading-screen";
import { BackButton } from "../svg/back-button";
import { ClipboardAdd } from "../svg/clipboard-add";
import { ClipboardChecked } from "../svg/clipboard-checked";
import { CopyUrl } from "../svg/copy-url";
import { Gear } from "../svg/gear";
import { ControllerOptionsList } from "./controller-options-list";
import PlayerCard from "./player-card";
import { Lobby } from "../../../shared/lobby";

export const OnlineLobby: React.FC<{
  lobby: Lobby | undefined;
}> = ({ lobby }) => {
  const navigate = useNavigate();
  const [clipboardMessage, setClipboardMessage] = useState("");

  const copyToClipboard = useCallback(
    (text: string, type: "CODE" | "URL") => {
      try {
        navigator.clipboard.writeText(text);
        setClipboardMessage(`Copied ${type} to clipboard!`);
      } catch (e) {
        setClipboardMessage(`Failed to copy to clipboard!`);
      }
    },
    [setClipboardMessage]
  );

  useEffect(() => {
    if (clipboardMessage) {
      const timeout = setTimeout(() => {
        setClipboardMessage("");
      }, 3000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [clipboardMessage, setClipboardMessage]);

  if (!lobby) return <LoadingScreen />;

  const somePlayersReady = lobby.players.some((player) => player.ready);
  const disableMatchStart = !lobby.players.every((player) => player.ready);

  return (
    <div className="grid grid-rows-5 h-dvh md:w-3/4 md:max-w-4xl md:m-auto z-10 select-none ">
      <div className="flex justify-center align-center glass dark-pane m-4">
        <BackButton
          className={
            "inline-block h-full border-r-2 border-white min-w-16 p-3 hover:bg-[var(--hover-bg)]"
          }
          size={30}
          onClick={() => {
            websocket.emit("leaveLobby", { lobbyKey: lobby.key });
            navigate(APP_ROUTES.LOBBY_SELECT);
          }}
        />
        <div className="relative inline-block grow place-content-center">
          <h1 className="place-self-center text-white text-center text-4xl font-bold italic pb-2">
            Online Lobby
          </h1>
          {clipboardMessage && (
            <p className="font-bold text-rose-600 text-center w-full absolute bottom-1 left-1/2 transform -translate-x-1/2 text-sm">
              {clipboardMessage}
            </p>
          )}
        </div>
      </div>
      <div className="row-start-2 row-span-1 ml-auto mr-auto w-11/12 flex flex-col flex-wrap gap-0.5 justify-center md:w-3/4">
        {lobby.players.map((player, i) => {
          return (
            <React.Fragment key={i}>
              <PlayerCard player={player}>
                {!player.id ? (
                  <div className="text-rose-600 max-w-40 mt-3 tracking-widest italic font-bold flex items-center justify-around gap-1 m-auto">
                    <span
                      className="animate-pulse select-text text-lg cursor-pointer bold hover:opacity-80"
                      onClick={() => {
                        const text = lobby.key ?? "";
                        copyToClipboard(text, "CODE");
                      }}
                    >
                      {lobby.key ?? "..."}
                    </span>
                    {clipboardMessage ? (
                      <ClipboardChecked
                        onClick={() => {
                          const text = lobby.key ?? "";
                          copyToClipboard(text, "CODE");
                        }}
                        size={35}
                        className="inline-block cursor-pointer rounded hover:opacity-70"
                      />
                    ) : (
                      <ClipboardAdd
                        onClick={() => {
                          const text = lobby.key ?? "";
                          copyToClipboard(text, "CODE");
                        }}
                        size={35}
                        className="inline-block cursor-pointer rounded hover:opacity-70"
                      />
                    )}
                    <CopyUrl
                      onClick={() => {
                        const url = `${ENV_BASE_URL}${APP_ROUTES.LOBBY}?type=${MATCH_TYPE.ONLINE}&key=${lobby.key}`;
                        copyToClipboard(url, "URL");
                      }}
                      size={35}
                      className="inline-block cursor-pointer rounded hover:opacity-70"
                    />
                  </div>
                ) : null}
              </PlayerCard>
            </React.Fragment>
          );
        })}
      </div>
      <div className="m-auto w-full md:w-3/4">
        <ControllerOptionsList
          uniqueOptions={[
            {
              text: `Time: ${lobby.time === 0 ? "∞" : lobby.time} min`,
              className: "inline-block p-1 w-full",
              onChange: (e) => {
                const target = e.target as HTMLInputElement;
                const time = parseInt(target.value, 10);
                websocket.emit("updateLobbyTime", {
                  lobbyKey: lobby.key,
                  time,
                });
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
                      websocket.emit("updateLobbyTime", {
                        lobbyKey: lobby.key,
                        time,
                      });
                    }}
                    className="slider inline-block bg-slate-200"
                  />
                </div>
              ),
            },
            {
              text: "Switch Teams",
              className: "p-1",
              disabled: somePlayersReady,
              onChange: () => {
                websocket.emit("switchTeams", { lobbyKey: lobby.key });
              },
            },
          ]}
        />
      </div>

      <button
        className="relative m-auto w-fit h-fit rounded-full p-3 border-2 bg-slate-700 border-slate-200 hover:bg-white hover:bg-opacity-10"
        onClick={() => navigate(APP_ROUTES.SETTINGS)}
      >
        <Gear size={30} />
      </button>
      <div className="row-start-5 flex justify-center m-2 gap-2">
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
          className={`m-auto text-2xl md:text-4xl select-none basis-1/2 p-4 glass text-white border-2 border-white text-center tracking-widest italic font-bold bg-red-500`}
        >
          <input
            type="checkbox"
            onClick={() => {
              websocket.emit("readyPlayer", { lobbyKey: lobby.key });
            }}
            className="hidden"
          />
          Ready
        </label>
        <SelectionButton
          customClass={`m-auto text-2xl font-bold md:text-4xl basis-1/2 p-4 font-bold border-2 border-white italic tracking-widest hover:opacity-80 md:w-1/2 md:justify-self-center ${
            disableMatchStart ? "opacity-50" : ""
          }`}
          text={"Start"}
          onClick={() => {
            websocket.emit("requestMatchStart", { lobbyKey: lobby.key });
          }}
          disabled={disableMatchStart}
        />
      </div>
    </div>
  );
};
