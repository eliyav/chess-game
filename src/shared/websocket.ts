import { Point } from "./game";
import { Lobby } from "./match";

export interface ServerToClientEvents {
  lobbyInfo: (lobby: Lobby) => void;
  message: (message: string) => void;
  redirect: (data: { path: string; message: string | undefined }) => void;
  resolvedMove: (data: { originPoint: Point; targetPoint: Point }) => void;
  resetMatchRequested: () => void;
  resetMatchResolve: (data: { answer: boolean }) => void;
  undoMoveRequested: () => void;
  undoMoveResolve: (data: { answer: boolean }) => void;
}

export interface ClientToServerEvents {
  disconnect: () => void;
  joinLobby: (data: { lobbyKey: string }) => void;
  leaveLobby: (data: { lobbyKey: string }) => void;
  requestMatchStart: (data: { lobbyKey: string }) => void;
  readyPlayer: (data: { lobbyKey: string }) => void;
  switchTeams: (data: { lobbyKey: string }) => void;
  resolvedMove: (data: {
    originPoint: Point;
    targetPoint: Point;
    key: string;
  }) => void;
  resetMatchRequest: (data: { lobbyKey: string }) => void;
  resetMatchResponse: (data: { answer: boolean; lobbyKey: string }) => void;
  undoMoveRequest: (data: { lobbyKey: string }) => void;
  undoMoveResponse: (data: { answer: boolean; lobbyKey: string }) => void;
  updateControllerOptions: (data: {
    lobbyKey: string;
    options: { [key: string]: boolean };
  }) => void;
}

export interface InterServerEvents {
  ping: (data: { message: string }) => void;
}
