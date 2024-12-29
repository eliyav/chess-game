import { POSSIBLE_DEPTHS } from "../client/game-logic/bot-opponent";

export enum LOBBY_TYPE {
  LOCAL = "local",
  ONLINE = "online",
}

export interface Lobby {
  mode: LOBBY_TYPE;
  key: string;
  players: Player[];
  matchStarted: boolean;
  time: number;
}

export interface RoomDetails {
  key: string;
  playerId: Player["id"];
}

export enum TEAM {
  WHITE = "White",
  BLACK = "Black",
}

export type PlayerType = "human" | "computer";

export type Player =
  | {
      id: string;
      type: "human";
      name: string;
      ready: boolean;
      team: TEAM;
    }
  | {
      id: string;
      type: "computer";
      name: string;
      ready: boolean;
      depth: number;
      team: TEAM;
    };

export type ControllerOptions = {
  playAnimations: boolean;
  renderShadows: boolean;
  playGameSounds: boolean;
  displayAvailableMoves: boolean;
};

export function buildDefaultOptions(): ControllerOptions {
  return {
    displayAvailableMoves: true,
    playAnimations: true,
    renderShadows: false,
    playGameSounds: true,
  };
}

export function getOptionText(option: keyof ControllerOptions) {
  switch (option) {
    case "playAnimations":
      return "Animations";
    case "renderShadows":
      return "Shadows";
    case "playGameSounds":
      return "Game Sounds";
    case "displayAvailableMoves":
      return "Display Available Moves";
  }
}

export function createLobby(preset: {
  type: LOBBY_TYPE;
  vs?: PlayerType | null;
  depth?: string | null;
  key?: string | null;
  time?: string | null;
}): Lobby {
  if (preset.type === LOBBY_TYPE.LOCAL) {
    return {
      mode: preset.type,
      key: preset.key ?? "",
      time: preset.time ? Number(preset.time) : 10,
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
              depth: POSSIBLE_DEPTHS.some((num) =>
                num === Number(preset.depth) ? true : false
              )
                ? Number(preset.depth)
                : 3,
            },
      ],
      matchStarted: false,
    };
  } else {
    return {
      mode: preset.type,
      key: preset.key ?? "",
      time: preset.time ? Number(preset.time) : 10,
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
  }
}
