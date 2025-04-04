import { Point } from "./game";
import { Lobby } from "./lobby";
import { APP_ROUTES } from "./routes";

export interface ServerToClientEvents {
  lobbyInfo: (lobby: Lobby) => void;
  message: (message: string) => void;
  redirect: (data: {
    path: APP_ROUTES;
    message: string | undefined;
    search?: { [id: string]: string };
  }) => void;
  resolvedMove: (data: { from: Point; to: Point }) => void;
  resetMatchRequested: () => void;
  resetMatchResolve: (data: { answer: boolean }) => void;
  undoTurnRequested: () => void;
  undoTurnResolve: (data: { answer: boolean }) => void;
  opponentDisconnected: () => void;
}

export interface ClientToServerEvents {
  disconnect: () => void;
  joinLobby: (data: { lobbyKey: string }) => void;
  leaveLobby: (data: { lobbyKey: string }) => void;
  requestMatchStart: (data: { lobbyKey: string }) => void;
  readyPlayer: (data: { lobbyKey: string }) => void;
  switchTeams: (data: { lobbyKey: string }) => void;
  resolvedMove: (data: { from: Point; to: Point; key: string }) => void;
  resetMatchRequest: (data: { lobbyKey: string }) => void;
  resetMatchResponse: (data: { answer: boolean; lobbyKey: string }) => void;
  undoTurnRequest: (data: { lobbyKey: string }) => void;
  undoTurnResponse: (data: { answer: boolean; lobbyKey: string }) => void;
  abandonMatch: (data: { lobbyKey: string }) => void;
  rejoinMatch: (data: { lobbyKey: string }) => void;
  updateLobbyTime: (data: { lobbyKey: string; time: number }) => void;
}

export interface InterServerEvents {
  ping: (data: { message: string }) => void;
}
