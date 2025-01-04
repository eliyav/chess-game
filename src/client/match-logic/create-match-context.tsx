import { PIECE } from "../../shared/game";
import { Lobby } from "../../shared/lobby";
import { MATCH_TYPE, Player } from "../../shared/match";
import { LocalMatch } from "./local-match";
import { OnlineMatch } from "./online-match";

export function createMatchContext({
  lobby,
  player,
  onTimeUpdate,
  onTimeEnd,
  onPromotion,
}: {
  lobby: Lobby;
  player: Player;
  onTimeUpdate: () => void;
  onTimeEnd: () => void;
  onPromotion: (resolve: (piece: PIECE) => void) => void;
}) {
  return lobby.mode === MATCH_TYPE.OFFLINE
    ? new LocalMatch({
        lobby,
        player,
        onTimeUpdate,
        onTimeEnd,
        onPromotion,
      })
    : new OnlineMatch({
        lobby,
        player,
        onTimeUpdate,
        onTimeEnd,
        onPromotion,
      });
}
