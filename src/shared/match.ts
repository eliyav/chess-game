export enum LOBBY {
  OFFLINE = "Offline",
  ONLINE = "Online",
}

export interface LobbySettings {
  mode: string | LOBBY;
  key: string | null;
  players: string[];
}

export type Teams = "White" | "Black";

export type PlayerType = "Human" | "AI";

export type Player = {
  type: PlayerType;
  name: string;
  team: Teams;
};
