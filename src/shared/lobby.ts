export enum LOBBY {
  OFFLINE = "Offline",
  ONLINE = "Online",
}

export interface LobbySettings {
  mode: string | LOBBY;
  key: string | null;
  players: string[];
}
