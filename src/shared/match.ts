export enum LOBBY_TYPE {
  LOCAL = "Local",
  ONLINE = "Online",
}

export interface Lobby {
  mode: LOBBY_TYPE;
  key: string;
  players: Player[];
  matchStarted: boolean;
}

export interface RoomDetails {
  key: string;
  playerId: Player["id"];
}

export enum TEAM {
  WHITE = "White",
  BLACK = "Black",
}

export type PlayerType = "Human" | "Computer";

export type Player =
  | {
      id: string;
      type: "Human";
      name: string;
      ready: boolean;
      team: TEAM;
    }
  | {
      id: string;
      type: "Computer";
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
}): Lobby {
  if (preset.type === LOBBY_TYPE.LOCAL) {
    return {
      mode: preset.type,
      key: preset.key ?? "",
      players: [
        {
          name: "Player 1",
          ready: false,
          id: "1",
          type: "Human",
          team: TEAM.WHITE,
        },
        preset?.vs === "Human"
          ? {
              name: "Player 2",
              ready: false,
              id: "2",
              type: "Human",
              team: TEAM.BLACK,
            }
          : {
              name: "BOT",
              ready: false,
              id: "2",
              type: "Computer",
              team: TEAM.BLACK,
              depth: preset.depth ? Number(preset.depth) : 3,
            },
      ],
      matchStarted: false,
    };
  } else {
    return {
      mode: preset.type,
      key: preset.key ?? "",
      players: [
        {
          id: "",
          type: "Human",
          name: "Player 1",
          ready: false,
          team: TEAM.WHITE,
        },
        {
          id: "",
          type: "Human",
          name: "Player 2",
          ready: false,
          team: TEAM.BLACK,
        },
      ],
      matchStarted: false,
    };
  }
}
