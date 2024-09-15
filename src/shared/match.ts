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
