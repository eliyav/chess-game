// import { Server } from "socket.io";
import { Server as Webserver } from "node:http";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "../shared/websocket";
import { Server } from "socket.io";
import { Lobby } from "../shared/match";
import { APP_ROUTES } from "../shared/routes";

function playerDisconnected({
  io,
  socketId,
  lobby,
  key,
}: {
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;
  socketId: string;
  lobby: Lobby;
  key: string;
}) {
  if (lobby.matchStarted) {
    io.to(key).emit("opponentDisconnected");
  } else {
    lobby.players = lobby.players.filter((player) => player.id !== socketId);
    lobby.teams = { White: "", Black: "" };
    io.to(key).emit("lobbyInfo", lobby);
  }
}

export function createWebsocketServer({
  server,
  lobbies,
}: {
  server: Webserver;
  lobbies: Map<string, Lobby>;
}) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents
  >(server);

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      const lobbyEntries = lobbies.entries();
      for (const [key, lobby] of lobbyEntries) {
        const player = lobby.players.find((player) => player.id === socket.id);
        if (player) {
          playerDisconnected({ io, socketId: socket.id, lobby, key });
        }
      }
    });

    socket.on("joinLobby", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) {
        return socket.emit("message", "Lobby does not exist");
      }
      if (lobby.players.find((player) => player.id === socket.id)) return;
      if (lobby.players.length === 2) {
        return socket.emit("message", "Lobby is full");
      }
      socket.join(lobbyKey);
      lobby.players.push({
        id: socket.id,
        type: "Human",
        name: `Player ${lobby.players.length + 1}`,
        ready: false,
      });
      if (lobby.players.length === 2) {
        lobby.teams.White = lobby.players[0].id;
        lobby.teams.Black = lobby.players[1].id;
      }
      io.to(lobbyKey).emit("lobbyInfo", lobby);
    });

    socket.on("leaveLobby", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) return;
      playerDisconnected({ io, socketId: socket.id, lobby, key: lobbyKey });
    });

    socket.on("requestMatchStart", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) return;
      if (
        lobby.players.length === 2 &&
        lobby.players.every((player) => player.ready)
      ) {
        lobby.matchStarted = true;
        io.to(lobbyKey).emit("lobbyInfo", lobby);
        io.to(lobbyKey).emit("redirect", {
          path: APP_ROUTES.Game,
          message: "Match started!",
        });
      }
    });

    socket.on("readyPlayer", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) return;
      const player = lobby.players.find((player) => player.id === socket.id);
      if (!player) return;
      player.ready = !player.ready;
      io.to(lobbyKey).emit("lobbyInfo", lobby);
    });

    socket.on("updateControllerOptions", ({ lobbyKey, options }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) return;
      lobby.controllerOptions = { ...lobby.controllerOptions, ...options };
      io.to(lobbyKey).emit("lobbyInfo", lobby);
    });

    socket.on("switchTeams", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) return;
      if (lobby.players.length !== 2) return;
      const temp = lobby.teams.White;
      lobby.teams.White = lobby.teams.Black;
      lobby.teams.Black = temp;
      io.to(lobbyKey).emit("lobbyInfo", lobby);
    });

    //Resolve Turn
    socket.on("resolvedMove", ({ originPoint, targetPoint, key }) => {
      socket.to(key).emit("resolvedMove", { originPoint, targetPoint });
    });

    //Reset Match
    socket.on("resetMatchRequest", ({ lobbyKey }) => {
      socket.to(lobbyKey).emit("resetMatchRequested");
    });

    socket.on("resetMatchResponse", ({ answer, lobbyKey }) => {
      socket.to(lobbyKey).emit("resetMatchResolve", { answer });
      socket.emit("resetMatchResolve", { answer });
    });

    //Undo Move
    socket.on("undoTurnRequest", ({ lobbyKey }) => {
      socket.to(lobbyKey).emit("undoTurnRequested");
    });

    socket.on("undoTurnResponse", ({ answer, lobbyKey }) => {
      socket.to(lobbyKey).emit("undoTurnResolve", { answer });
      socket.emit("undoTurnResolve", { answer });
    });
  });

  return io;
}
