export enum MATCH_TYPE {
  OFFLINE = "offline",
  ONLINE = "online",
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
      team: TEAM;
    };
