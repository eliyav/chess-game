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

export function createOfflineLobby(): Lobby {
  return {
    mode: LOBBY_TYPE.LOCAL,
    key: "",
    players: [
      {
        name: "Player 1",
        ready: false,
        id: "1",
        type: "Human",
        team: TEAM.WHITE,
      },
      {
        name: "BOT",
        ready: false,
        id: "2",
        type: "Computer",
        depth: 3,
        team: TEAM.BLACK,
      },
    ],
    matchStarted: false,
  };
}
