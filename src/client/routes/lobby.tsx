import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { LOBBY } from "../../shared/match";
import Divider from "../components/divider";
import { Message } from "../components/modals/message-modal";

export const LobbySelect: React.FC<{
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}> = ({ setMessage }) => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");

  return (
    <div className="lobby screen">
      <div className="header glass-dark">
        <BackButton
          customClass={"bottom-left"}
          size={30}
          onClick={() => navigate(-1)}
        />
        <h1>Select Lobby</h1>
      </div>
      <div className="flex column mt-1">
        <SelectionButton
          text={LOBBY.OFFLINE}
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
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          ></input>
          <SelectionButton
            customClass={"no-top-br-radius"}
            disabled={inviteCode.length !== 5}
            text={`Join ${LOBBY.ONLINE}`}
            onClick={async () => {
              console.log("Joining lobby");
              try {
                const joinRoomResponse = await fetch("./join-lobby", {
                  method: "POST",
                  body: JSON.stringify({
                    name: "Guest",
                    room: inviteCode,
                  }),
                });
                if (!joinRoomResponse.ok) {
                  throw new Error("Failed to join lobby");
                }
                navigate("/lobby-online", {
                  state: {
                    room: inviteCode,
                    player: {
                      type: "Human",
                      name: "Guest",
                      team: "Black",
                    },
                  },
                });
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
          text={`Create ${LOBBY.ONLINE}`}
          onClick={async () => {
            try {
              const createRoomResponse = await fetch("./create-lobby", {
                method: "POST",
                body: JSON.stringify({
                  name: "Host",
                }),
              });
              const roomKey = await createRoomResponse.text();
              navigate("/lobby-online", {
                state: {
                  room: roomKey,
                  player: {
                    type: "Human",
                    name: "Host",
                    team: "White",
                  },
                },
              });
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
