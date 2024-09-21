export enum LOBBY_TYPE {
  LOCAL = "Local",
  ONLINE = "Online",
}

export interface Lobby {
  mode: LOBBY_TYPE;
  key: string;
  players: Player[];
  teams: { [key in TEAM]: Player["id"] };
  matchStarted: boolean;
  controllerOptions: ControllerOptions;
}

export interface RoomDetails {
  key: string;
  playerId: Player["id"];
}

export enum TEAM {
  WHITE = "White",
  BLACK = "Black",
}

export type PlayerType = "Human" | "AI";

export type Player = {
  id: string;
  type: PlayerType;
  name: string;
  ready: boolean;
};

export type ControllerOptions = {
  playAnimations: boolean;
  renderShadows: boolean;
};

export function buildDefaultOptions(): ControllerOptions {
  return {
    playAnimations: true,
    renderShadows: false,
  };
}

export function getOptionText(option: keyof ControllerOptions) {
  switch (option) {
    case "playAnimations":
      return "Animations";
    case "renderShadows":
      return "Shadows";
  }
}
