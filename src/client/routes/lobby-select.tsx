import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOBBY_TYPE } from "../../shared/match";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { Message } from "../components/modals/message-modal";
import { Divider } from "../components/svg/divider";

export const LobbySelect: React.FC<{
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}> = ({ setMessage }) => {
  const navigate = useNavigate();
  const [lobbyKey, setLobbyKey] = useState("");

  return (
    <div className="content">
      <div className="header glass-dark">
        <BackButton
          customClass={"bottom-left"}
          size={30}
          onClick={() => navigate("/")}
        />
        <h1>Select Lobby</h1>
      </div>
      <div className="flex-column gap-2 mt-3">
        <SelectionButton
          text={LOBBY_TYPE.LOCAL}
          onClick={() => {
            navigate("/lobby-offline");
          }}
        />
        <Divider />
        <div>
          <input
            id="join-lobby-input"
            type="text"
            placeholder="Enter Invite Code"
            maxLength={5}
            onChange={(e) => setLobbyKey(e.target.value.toUpperCase())}
            autoComplete="off"
            value={lobbyKey}
          ></input>
          <SelectionButton
            customClass={"no-top-br-radius"}
            disabled={lobbyKey.length !== 5}
            text={`Join ${LOBBY_TYPE.ONLINE}`}
            onClick={async () => {
              try {
                const response = await fetch(
                  `./join-lobby?key=${lobbyKey}`,
                  {}
                );
                if (!response.ok) {
                  throw new Error("Failed to join lobby");
                }
                navigate(`/lobby-online?key=${lobbyKey}`);
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
        <Divider />
        <SelectionButton
          text={`Create ${LOBBY_TYPE.ONLINE}`}
          onClick={async () => {
            try {
              const response = await fetch("./create-lobby");
              const lobbyKey = await response.text();
              navigate(`/lobby-online?key=${lobbyKey}`);
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
      </div>
    </div>
  );
};
