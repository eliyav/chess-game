import { Lobby } from "../../shared/lobby";
import { MATCH_TYPE, Player } from "../../shared/match";
import { LocalMatch } from "./local-match";
import { OnlineMatch } from "./online-match";

export function createMatchContext({
  lobby,
  player,
  onTimeUpdate,
  onTimeEnd,
}: {
  lobby: Lobby;
  player: Player;
  onTimeUpdate: () => void;
  onTimeEnd: () => void;
}) {
  return lobby.mode === MATCH_TYPE.OFFLINE
    ? new LocalMatch({
        lobby,
        player,
        onTimeUpdate,
        onTimeEnd,
      })
    : new OnlineMatch({
        lobby,
        player,
        onTimeUpdate,
        onTimeEnd,
      });
}
