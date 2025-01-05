import { POSSIBLE_DEPTHS } from "./constants";
import { generateKey } from "./helpers";
import { MATCH_TYPE, Player, PlayerType, TEAM } from "./match";

export interface Lobby {
  mode: MATCH_TYPE;
  key: string;
  players: Player[];
  matchStarted: boolean;
  time: number;
  depth: number;
  timers?: { [key in TEAM]: { formatted: string; raw: number } };
  currentTeam?: TEAM;
  progress?: number;
}

export function createLobby(preset: {
  type: MATCH_TYPE;
  vs?: PlayerType | null;
  depth?: string | null;
  key?: string | null;
  time?: string | null;
}): Lobby {
  if (preset.type === MATCH_TYPE.ONLINE) {
    return {
      mode: preset.type,
      key: preset.key ?? "",
      time: preset.time ? Number(preset.time) : 10,
      depth: 0,
      players: [
        {
          id: "",
          type: "human",
          name: "Player 1",
          ready: false,
          team: TEAM.WHITE,
        },
        {
          id: "",
          type: "human",
          name: "Player 2",
          ready: false,
          team: TEAM.BLACK,
        },
      ],
      matchStarted: false,
    };
  } else {
    return {
      mode: MATCH_TYPE.OFFLINE,
      key: preset.key ?? generateKey(),
      time: preset.time ? Number(preset.time) : 10,
      depth: POSSIBLE_DEPTHS.some((num) =>
        num === Number(preset.depth) ? true : false
      )
        ? Number(preset.depth)
        : 3,
      players: [
        {
          name: "Player 1",
          ready: false,
          id: "1",
          type: "human",
          team: TEAM.WHITE,
        },
        preset?.vs === "human"
          ? {
              name: "Player 2",
              ready: false,
              id: "2",
              type: "human",
              team: TEAM.BLACK,
            }
          : {
              name: "BOT",
              ready: false,
              id: "2",
              type: "computer",
              team: TEAM.BLACK,
            },
      ],
      matchStarted: false,
    };
  }
}
