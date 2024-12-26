import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ENV_BASE_URL } from "..";
import { ControllerOptions, Lobby } from "../../shared/match";
import { APP_ROUTES } from "../../shared/routes";
import { SelectionButton } from "../components/buttons/selection-button";
import { ControllerOptionsList } from "../components/lobby/controller-options-list";
import PlayerCard from "../components/lobby/player-card";
import { BackButton } from "../components/svg/back-button";
import { ClipboardAdd } from "../components/svg/clipboard-add";
import { ClipboardChecked } from "../components/svg/clipboard-checked";
import { CopyUrl } from "../components/svg/copy-url";
import { websocket } from "../websocket-client";

export const OnlineLobby: React.FC<{
  lobby: Lobby | undefined;
  options: ControllerOptions;
  updateOptions: <KEY extends keyof ControllerOptions>(
    key: KEY,
    value: ControllerOptions[KEY]
  ) => void;
}> = ({ lobby, options, updateOptions }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
    const lobbyKey = location.search.split("=")[1];
    if (lobbyKey) {
      websocket.emit("joinLobby", { lobbyKey });
    }
  }, [websocket, location]);

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

  if (!lobby) return null;

  const somePlayersReady = lobby.players.some((player) => player.ready);
  const disableMatchStart = !lobby.players.every((player) => player.ready);

  return (
    <div className="grid grid-rows-5 h-dvh md:w-3/4 md:max-w-4xl md:m-auto z-10 select-none ">
      <div className="flex grid-rows-1 justify-center align-center glass dark-pane m-4">
        <BackButton
          className={
            "inline-block h-full border-r-2 border-white min-w-16 p-3 hover:bg-white hover:bg-opacity-10"
          }
          size={30}
          onClick={() => navigate(APP_ROUTES.Lobby)}
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
      <div className="row-span-3 flex flex-col gap-2 p-2 align-center md:w-3/4 md:justify-self-center">
        <div className="h-40 ml-auto mr-auto w-11/12 row-span-1 flex flex-col flex-wrap gap-0.5 justify-center md:w-3/4">
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
                          const url = `${ENV_BASE_URL}${APP_ROUTES.OnlineLobby}?key=${lobby.key}`;
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
        <ControllerOptionsList
          options={options}
          onChange={(key) => (e: React.ChangeEvent<HTMLInputElement>) =>
            updateOptions(key, e.target.checked)}
          uniqueOptions={[
            {
              text: "Switch Teams",
              disabled: somePlayersReady,
              onChange: () => {
                websocket.emit("switchTeams", { lobbyKey: lobby.key });
              },
            },
          ]}
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
          className={`select-none basis-1/2 m-2 p-2 text-xl glass text-white border-2 border-white text-center tracking-widest italic font-bold bg-red-500`}
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
