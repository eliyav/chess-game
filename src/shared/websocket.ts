interface ServerToClientEvents {
  lobbyInfo: (lobby: any) => void;
  message: (message: string) => void;
  redirect: (data: { path?: string; message: string }) => void;
  resolvedMove: (data: { originPoint: any; targetPoint: any }) => void;
  resetMatchRequested: () => void;
  resetMatchResolve: (data: { answer: boolean }) => void;
  undoMoveRequested: () => void;
  undoMoveResolve: (data: { answer: boolean }) => void;
}

interface ClientToServerEvents {
  disconnect: () => void;
  joinRoom: (data: { room: string }) => void;
  leaveRoom: (data: { room: string }) => void;
  requestMatchStart: (data: { room: string }) => void;
  readyPlayer: (data: { room: string }) => void;
  setTeams: (data: { room: string; first: string }) => void;
  resolvedMove: (data: {
    originPoint: any;
    targetPoint: any;
    key: string;
  }) => void;
  resetMatchRequest: (data: { key: string }) => void;
  resetMatchResponse: (data: { answer: boolean; key: string }) => void;
  undoMoveRequest: (data: { key: string }) => void;
  undoMoveResponse: (data: { answer: boolean; key: string }) => void;
}

interface InterServerEvents {
  ping: (data: { message: string }) => void;
}
