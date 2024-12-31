import { Server as Webserver } from "node:http";
import { Server } from "socket.io";
import { Lobby, LOBBY_TYPE } from "../shared/match";
import { APP_ROUTES } from "../shared/routes";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "../shared/websocket";

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
          if (lobby.matchStarted) {
            socket.to(key).emit("opponentDisconnected");
            lobbies.delete(key);
          } else {
            const findPlayer = lobby.players.find(
              (player) => player.id === socket.id
            );
            if (findPlayer) {
              findPlayer.id = "";
            }
            socket.to(key).emit("lobbyInfo", lobby);
          }
        }
      }
    });

    socket.on("joinLobby", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) {
        return socket.emit("redirect", {
          path: APP_ROUTES.HOME,
          message: "Lobby does not exist",
        });
      }
      const alreadyInLobby = lobby.players.find(
        (player) => player.id === socket.id
      );
      if (!alreadyInLobby) {
        const placeHolderPlayer = lobby.players.find(
          (player) => !Boolean(player.id)
        );
        if (!placeHolderPlayer) {
          return socket.emit("redirect", {
            path: APP_ROUTES.HOME,
            message: "Lobby is full",
          });
        }
        placeHolderPlayer.id = socket.id;
      }
      socket.join(lobbyKey);
      io.to(lobbyKey).emit("lobbyInfo", lobby);
    });

    socket.on("leaveLobby", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) return;
      const findPlayer = lobby.players.find(
        (player) => player.id === socket.id
      );
      if (findPlayer) {
        findPlayer.id = "";
      }
      socket.to(lobbyKey).emit("lobbyInfo", lobby);
    });

    socket.on("rejoinMatch", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) {
        return socket.emit("redirect", {
          path: APP_ROUTES.HOME,
          message: "Lobby does not exist",
        });
      }
      const alreadyInLobby = lobby.players.find(
        (player) => player.id === socket.id
      );
      if (!alreadyInLobby) {
        const placeHolderPlayer = lobby.players.find(
          (player) => !Boolean(player.id)
        );
        if (!placeHolderPlayer) {
          return socket.emit("redirect", {
            path: APP_ROUTES.HOME,
            message: "Lobby is full",
          });
        }
        placeHolderPlayer.id = socket.id;
      }
      socket.join(lobbyKey);
      io.to(lobbyKey).emit("lobbyInfo", lobby);
    });

    socket.on("abandonMatch", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) return;
      socket.to(lobbyKey).emit("opponentDisconnected");
      socket.leave(lobbyKey);
      lobbies.delete(lobbyKey);
    });

    socket.on("requestMatchStart", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) return;
      if (lobby.players.every((player) => player.ready)) {
        lobby.matchStarted = true;
        io.to(lobbyKey).emit("lobbyInfo", lobby);
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

    socket.on("switchTeams", ({ lobbyKey }) => {
      const lobby = lobbies.get(lobbyKey);
      if (!lobby) return;
      const temp = lobby.players[0].team;
      lobby.players[0].team = lobby.players[1].team;
      lobby.players[1].team = temp;
      io.to(lobbyKey).emit("lobbyInfo", lobby);
    });

    //Resolve Turn
    socket.on("resolvedMove", ({ from, to, key }) => {
      socket.to(key).emit("resolvedMove", { from, to });
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
