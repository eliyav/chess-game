import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ENV_BASE_URL } from "..";
import { MATCH_TYPE } from "../../shared/match";
import { RESOURCES } from "../../shared/resources";
import { APP_ROUTES } from "../../shared/routes";
import { SelectionButton } from "../components/buttons/selection-button";
import { BackButton } from "../components/svg/back-button";
import { Divider } from "../components/svg/divider";
import { Alert } from "../components/modals/alert-tab";

export const LobbySelect: React.FC<{
  setAlert: React.Dispatch<React.SetStateAction<Alert | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setLoading, setAlert }) => {
  const navigate = useNavigate();
  const [lobbyKey, setLobbyKey] = useState("");

  return (
    <div className="grid grid-rows-5 h-dvh select-none md:w-3/4 md:max-w-4xl md:m-auto z-10">
      <div className="flex grid-rows-1 justify-center align-center glass dark-pane m-4">
        <BackButton
          className={
            "inline-block h-full border-r-2 border-white min-w-16 p-3 hover:bg-[var(--hover-bg)]"
          }
          size={30}
          onClick={() => navigate(APP_ROUTES.HOME)}
        />
        <h1 className="inline-block place-self-center text-white grow text-center text-4xl font-bold italic pb-2">
          Select Lobby
        </h1>
      </div>
      <div className="row-span-4 flex flex-col gap-2 p-2 align-center md:w-3/4 md:justify-self-center">
        <SelectionButton
          customClass="m-10 p-4 font-bold text-2xl border-2 border-white italic tracking-widest hover:opacity-80"
          text={"Offline"}
          onClick={() => {
            navigate(
              `${APP_ROUTES.LOBBY}?type=offline&vs=computer&depth=3&time=10`
            );
          }}
        />
        <Divider className="w-full z-10" />
        <SelectionButton
          customClass="m-10 p-4 font-bold text-2xl border-2 h-16 border-white italic tracking-widest hover:opacity-80"
          text={"Create Online"}
          onClick={async () => {
            try {
              setLoading(true);
              const response = await fetch(
                `${ENV_BASE_URL}${RESOURCES.CREATE_LOBBY}`
              );
              const lobbyKey = await response.text();
              navigate(
                `${APP_ROUTES.LOBBY}?type=${MATCH_TYPE.ONLINE}&key=${lobbyKey}`
              );
            } catch (e) {
              if (e instanceof Error) {
                setAlert({ message: e.message });
              } else {
                setAlert({ message: "Failed to create lobby" });
              }
            } finally {
              setLoading(false);
            }
          }}
        />
        <Divider className="w-full z-10" />
        <div className="text-center m-10">
          <input
            type="text"
            placeholder="Enter Invite Code"
            maxLength={5}
            onChange={(e) => setLobbyKey(e.target.value.toUpperCase())}
            autoComplete="off"
            value={lobbyKey}
            className="relative w-full p-2 rounded-xl mb-4 bg-white text-center border-2 h-16 border-gray-700 shadow-sm shadow-white placeholder-opacity-50 focus:outline-none focus:shadow-md focus:shadow-white"
          ></input>
          <SelectionButton
            customClass={
              "w-full p-4 font-bold text-2xl border-2 border-white italic tracking-widest hover:opacity-80"
            }
            disabled={lobbyKey.length !== 5}
            text={"Join Online"}
            onClick={async () => {
              try {
                setLoading(true);
                const response = await fetch(
                  `${ENV_BASE_URL}${RESOURCES.JOIN_LOBBY}?key=${lobbyKey}`,
                  {}
                );
                if (!response.ok) {
                  throw new Error(await response.text());
                }
                navigate(
                  `${APP_ROUTES.LOBBY}?type=${MATCH_TYPE.ONLINE}&key=${lobbyKey}`
                );
              } catch (e) {
                if (e instanceof Error) {
                  setAlert({ message: e.message });
                }
              } finally {
                setLoading(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
