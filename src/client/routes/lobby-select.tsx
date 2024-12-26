import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOBBY_TYPE } from "../../shared/match";
import { SelectionButton } from "../components/buttons/start-button";
import { Message } from "../components/modals/message-modal";
import { Divider } from "../components/svg/divider";
import { APP_ROUTES } from "../../shared/routes";
import { RESOURCES } from "../../shared/resources";
import { ENV_BASE_URL } from "..";
import { BackButton } from "../components/svg/back-button";

export const LobbySelect: React.FC<{
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}> = ({ setMessage }) => {
  const navigate = useNavigate();
  const [lobbyKey, setLobbyKey] = useState("");

  return (
    <div className="grid grid-rows-5 h-dvh select-none md:w-3/4 md:max-w-4xl md:m-auto z-10">
      <div className="flex grid-rows-1 justify-center align-center glass dark-pane m-4">
        <BackButton
          className={
            "inline-block h-full border-r-2 border-white min-w-16 p-3 hover:bg-white hover:bg-opacity-10"
          }
          size={30}
          onClick={() => navigate(APP_ROUTES.Home)}
        />
        <h1 className="inline-block place-self-center text-white grow text-center text-4xl font-bold italic pb-2">
          Select Lobby
        </h1>
      </div>
      <div className="row-span-4 flex flex-col gap-2 p-2 align-center md:w-3/4 md:justify-self-center">
        <SelectionButton
          customClass="m-10 p-4 font-bold text-2xl border-2 border-white italic tracking-widest hover:opacity-80"
          text={LOBBY_TYPE.LOCAL}
          onClick={() => {
            navigate(APP_ROUTES.OfflineLobby);
          }}
        />
        <Divider className="w-full" />
        <SelectionButton
          customClass="m-10 p-4 font-bold text-2xl border-2 border-white italic tracking-widest hover:opacity-80"
          text={`Create ${LOBBY_TYPE.ONLINE}`}
          onClick={async () => {
            try {
              const response = await fetch(
                `${ENV_BASE_URL}${RESOURCES.CREATE_LOBBY}`
              );
              const lobbyKey = await response.text();
              navigate(`${APP_ROUTES.OnlineLobby}?key=${lobbyKey}`);
            } catch (e) {
              if (e instanceof Error) {
                setMessage({
                  text: e.message,
                  onConfirm: () => setMessage(null),
                });
              } else {
                setMessage({
                  text: "Failed to create lobby",
                  onConfirm: () => setMessage(null),
                });
              }
            }
          }}
        />
        <Divider className="w-full" />
        <div className="text-center m-10">
          <input
            type="text"
            placeholder="Enter Invite Code"
            maxLength={5}
            onChange={(e) => setLobbyKey(e.target.value.toUpperCase())}
            autoComplete="off"
            value={lobbyKey}
            className="w-full p-2 rounded-t text-center border-2 h-12 border-gray-500 placeholder-opacity-50 focus:outline-none"
          ></input>
          <SelectionButton
            customClass={
              "w-full p-4 !rounded-t-none font-bold text-2xl border-2 border-white italic tracking-widest hover:opacity-80"
            }
            disabled={lobbyKey.length !== 5}
            text={`Join ${LOBBY_TYPE.ONLINE}`}
            onClick={async () => {
              try {
                const response = await fetch(
                  `${ENV_BASE_URL}${RESOURCES.JOIN_LOBBY}?key=${lobbyKey}`,
                  {}
                );
                if (!response.ok) {
                  throw new Error("Failed to join lobby");
                }
                navigate(`${APP_ROUTES.OnlineLobby}?key=${lobbyKey}`);
              } catch (e) {
                if (e instanceof Error) {
                  setMessage({
                    text: e.message,
                    onConfirm: () => setMessage(null),
                  });
                } else {
                  setMessage({
                    text: "Failed to join lobby",
                    onConfirm: () => setMessage(null),
                  });
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
