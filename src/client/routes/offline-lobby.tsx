import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";
import { LOBBY, LobbySettings } from "../../shared/match";

export const OfflineLobby: React.FC<{}> = ({}) => {
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<LobbySettings>(createLobby(LOBBY.OFFLINE));

  const updateLobby = useCallback(
    <KEY extends keyof LobbySettings>(key: KEY, value: LobbySettings[KEY]) => {
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
      <div className="selections mt-1">
        <button className="highlight">Human</button>
      </div>
      <footer>
        <SelectionButton
          text={"Start Game"}
          onClick={() => {
            navigate("/game", { state: { lobby } });
          }}
        />
      </footer>
    </div>
  );
};

function createLobby(mode: string | LOBBY) {
  return {
    mode,
    key: null,
    players: [],
  };
}
