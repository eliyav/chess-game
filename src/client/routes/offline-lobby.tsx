import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LOBBY_TYPE, Lobby } from "../../shared/match";
import { BackButton } from "../components/buttons/back-button";
import { SelectionButton } from "../components/buttons/start-button";

export const OfflineLobby: React.FC<{
  setLobby: React.Dispatch<React.SetStateAction<Lobby | undefined>>;
}> = ({ setLobby }) => {
  const navigate = useNavigate();

  const updateLobby = useCallback(
    <KEY extends keyof Lobby>(key: KEY, value: Lobby[KEY]) => {
      setLobby((prev) => ({
        mode: prev?.mode ?? LOBBY_TYPE.LOCAL,
        key: prev?.key ?? "",
        players: prev?.players ?? [],
        teams: prev?.teams ?? { White: "", Black: "" },
        matchStarted: prev?.matchStarted ?? false,
        [key]: value,
      }));
    },
    [setLobby]
  );

  useEffect(() => {
    setLobby({
      mode: LOBBY_TYPE.LOCAL,
      key: "",
      players: [],
      teams: {
        White: "",
        Black: "",
      },
      matchStarted: false,
    });
  }, [setLobby]);

  return (
    <div className="lobby screen">
      <div className="header glass-dark">
        <BackButton
          customClass={"bottom-left"}
          size={30}
          onClick={() => navigate("/lobby")}
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
            navigate("/game");
          }}
        />
      </footer>
    </div>
  );
};
