import React, { useCallback } from "react";
import { MATCH_TYPE } from "../../shared/match";
import { Settings } from "../../shared/settings";
import LoadingScreen from "../components/loading-screen";
import { OfflineLobby } from "../components/lobby/offline-lobby";
import { OnlineLobby } from "../components/lobby/online-lobby";
import { Lobby } from "../../shared/lobby";

export const LobbyView: React.FC<{
  lobby: Lobby | undefined;
  setLobby: React.Dispatch<React.SetStateAction<Lobby | undefined>>;
  settings: Settings;
  updateSettings: <KEY extends keyof Settings>(
    key: KEY,
    value: Settings[KEY]
  ) => void;
}> = ({ setLobby, lobby, updateSettings, settings }) => {
  const updateLobby = useCallback(
    <KEY extends keyof Lobby>(key: KEY, value: Lobby[KEY]) => {
      setLobby((prev) => ({
        mode: prev?.mode ?? MATCH_TYPE.OFFLINE,
        key: prev?.key ?? "",
        players: prev?.players ?? [],
        matchStarted: prev?.matchStarted ?? false,
        time: prev?.time ?? 10,
        depth: prev?.depth ?? 0,
        [key]: value,
      }));
    },
    [setLobby]
  );

  const updateOpponentType = useCallback(() => {
    const players = lobby?.players;
    if (players) {
      const [player, player2] = players;
      const isVsComputer = player2.type === "computer";
      updateLobby("players", [
        player,
        {
          name: isVsComputer ? "Player 2" : "BOT",
          ready: false,
          id: "2",
          type: isVsComputer ? "human" : "computer",
          team: player2.team,
        },
      ]);
    }
  }, [lobby, updateLobby]);

  if (!lobby) return <LoadingScreen />;

  if (lobby.mode === MATCH_TYPE.ONLINE) {
    return <OnlineLobby lobby={lobby} />;
  } else {
    return (
      <OfflineLobby
        lobby={lobby}
        updateLobby={updateLobby}
        updateOpponentType={updateOpponentType}
      />
    );
  }
};
