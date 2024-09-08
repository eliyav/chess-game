import React from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { LOBBY } from "../../shared/match";

export const LobbySelect: React.FC<{}> = () => {
  const navigate = useNavigate();

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
      <div
        className="selections mt-1"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <div>
          <SelectionButton
            text={LOBBY.OFFLINE}
            onClick={() => {
              navigate("/lobby-offline");
            }}
          />
        </div>
        <div>
          <input
            id="join-lobby-input"
            type="text"
            placeholder="Enter Room Code"
          ></input>
          <SelectionButton
            text={`Join ${LOBBY.ONLINE}`}
            onClick={async () => {
              try {
                const roomInput = document.getElementById(
                  "join-lobby-input"
                ) as HTMLInputElement;
                const joinRoomResponse = await fetch("./join-lobby", {
                  method: "POST",
                  body: JSON.stringify({
                    name: "Guest",
                    room: roomInput.value,
                  }),
                });
                if (!joinRoomResponse.ok) {
                  throw new Error("Failed to join lobby");
                }
                navigate("/lobby-online", {
                  state: {
                    room: roomInput.value,
                    player: {
                      name: "Guest",
                      team: "Black",
                    },
                  },
                });
              } catch (e) {
                if (e instanceof Error) {
                  alert(e.message);
                } else {
                  alert("Failed to create lobby");
                }
              }
            }}
          />
        </div>
        <div>
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
                      name: "Host",
                      team: "White",
                    },
                  },
                });
              } catch (e) {
                if (e instanceof Error) {
                  alert(e.message);
                } else {
                  alert("Failed to create lobby");
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
