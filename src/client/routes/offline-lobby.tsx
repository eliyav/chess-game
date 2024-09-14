import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { LOBBY_TYPE, Lobby } from "../../shared/match";

export const OfflineLobby: React.FC<{}> = ({}) => {
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<Lobby>(createLobby(LOBBY_TYPE.LOCAL));

  const updateLobby = useCallback(
    <KEY extends keyof Lobby>(key: KEY, value: Lobby[KEY]) => {
      setLobby((prev) => ({ ...prev, [key]: value }));
    },
    [setLobby]
  );

  return (
    <div className="lobby screen">
      <div className="header glass-dark">
        <BackButton
          customClass={"bottom-left"}
          size={30}
          onClick={() => navigate(-1)}
        />
        <h1>Offline Lobby</h1>
      </div>
      <h2 className="sub-title glass-dark">Opponent</h2>
      <div className="flex mt-1">
        <button>Human</button>
      </div>
      <footer>
        <SelectionButton
          customClass="mgn-1"
          text={"Start Game"}
          onClick={() => {
            navigate("/game", { state: { lobby } });
          }}
        />
      </footer>
    </div>
  );
};

function createLobby(mode: LOBBY_TYPE) {
  return {
    mode,
    key: null,
    players: [],
  };
}
