import React from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";

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
              navigate("/lobby/offline");
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
            onClick={() => {
              navigate("/lobby/online");
            }}
          />
        </div>
        <div>
          <SelectionButton
            text={`Create ${LOBBY.ONLINE}`}
            onClick={() => {
              navigate("/lobby/online");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export enum LOBBY {
  OFFLINE = "Offline",
  ONLINE = "Online",
}

export interface LobbySettings {
  mode: string | LOBBY;
  key: string | null;
  players: string[];
}
