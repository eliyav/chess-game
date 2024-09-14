export enum LOBBY_TYPE {
  LOCAL = "Local",
  ONLINE = "Online",
}

export interface Lobby {
  mode: LOBBY_TYPE;
  key: string | null;
  players: Player[];
}

export interface RoomDetails {
  key: string;
  playerId: Player["id"];
}

export type Teams = "White" | "Black";

export type PlayerType = "Human" | "AI";

export type Player = {
  id: string;
  type: PlayerType;
  name: string;
};
