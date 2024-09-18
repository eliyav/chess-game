import express from "express";
import path from "path";
import compression from "compression";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { LOBBY_TYPE, Lobby } from "../shared/match";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "../shared/websocket";

const clientPath = fileURLToPath(new URL("../client", import.meta.url));

const app = express();

const port = process.env.PORT || 3000;

app.use(compression());

app.use(express.static(clientPath));

app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.get("/create-lobby", (req, res) => {
  const key = generateKey();
  const lobby = {
    mode: LOBBY_TYPE.ONLINE,
    key,
    players: [],
    teams: { White: "", Black: "" },
    matchStarted: false,
  };
  lobbyLog.set(key, lobby);
  res.send(key);
});

app.post("/update-lobby", (req, res) => {
  const { room, lobby } = JSON.parse(req.body) as {
    room: string;
    lobby: Lobby;
  };
  if (!room) {
    res.status(400).send("Lobby key is required");
    return;
  }
  if (!lobby) {
    res.status(400).send("Lobby is required");
    return;
  }
  if (!lobbyLog.has(room)) res.status(400).send("Lobby does not exist");
  io.to(room).emit("lobbyInfo", lobby);
  res.send("Lobby updated successfully!");
});

app.post("/join-lobby", (req, res) => {
  const { room } = JSON.parse(req.body) as { room: string };
  if (!room) {
    res.status(400).send("Lobby key is required");
    return;
  }
  const lobby = lobbyLog.get(room);
  if (!lobby) {
    res.status(400).send("Lobby does not exist");
    return;
  }
  if (lobby.players.length === 2) {
    res.status(400).send("Room is full");
    return;
  }
  res.send(room);
});

app.get("*", function (req, res) {
  res.sendFile(path.join(clientPath, "index.html"));
});

const server = app.listen(port, function () {
  console.log(`Example app listening on port ${port}!\n`);
});

const lobbyLog = new Map<string, Lobby>();

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>(server);

setInterval(() => {
  const socketedRooms = io.sockets.adapter.rooms;
  for (let lobbyKey of lobbyLog.keys()) {
    if (!socketedRooms.has(lobbyKey)) lobbyLog.delete(lobbyKey);
  }
}, 10000);

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const lobbies = lobbyLog.entries();
    for (const [key, lobby] of lobbies) {
      const player = lobby.players.find((player) => player.id !== socket.id);
      if (player) {
        lobby.players = lobby.players.filter(
          (player) => player.id !== socket.id
        );
        lobby.teams = { White: "", Black: "" };
        io.to(key).emit("lobbyInfo", lobby);
      }
    }
  });

  socket.on("joinRoom", ({ room }) => {
    const lobby = lobbyLog.get(room);
    if (!lobby) {
      socket.emit("message", "Room does not exist");
      return;
    }
    if (lobby.players.find((player) => player.id === socket.id)) return;
    if (lobby.players.length === 2) {
      socket.emit("redirect", { message: "Room is full" });
      return;
    }
    socket.join(room);
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
    io.to(room).emit("lobbyInfo", lobby);
  });

  socket.on("leaveRoom", ({ room }) => {
    const lobby = lobbyLog.get(room);
    if (!lobby) return;
    lobby.players = lobby.players.filter((player) => player.id !== socket.id);
    lobby.teams = { White: "", Black: "" };
    io.to(room).emit("lobbyInfo", lobby);
  });

  socket.on("requestMatchStart", ({ room }) => {
    const lobby = lobbyLog.get(room);
    if (!lobby) return;
    if (
      lobby.players.length === 2 &&
      lobby.players.every((player) => player.ready)
    ) {
      lobby.matchStarted = true;
      io.to(room).emit("lobbyInfo", lobby);
      io.to(room).emit("redirect", {
        path: "/game",
        message: "Match started!",
      });
    }
  });

  socket.on("readyPlayer", ({ room }) => {
    const lobby = lobbyLog.get(room);
    if (!lobby) return;
    const player = lobby.players.find((player) => player.id === socket.id);
    if (!player) return;
    player.ready = !player.ready;
    io.to(room).emit("lobbyInfo", lobby);
  });

  socket.on("setTeams", ({ room, first }) => {
    const lobby = lobbyLog.get(room);
    if (!lobby) return;
    if (lobby.players.length !== 2) return;
    lobby.teams.White = first;
    lobby.teams.Black = lobby.players.find((player) => player.id !== first)!.id;
    io.to(room).emit("lobbyInfo", lobby);
  });

  //Resolve Turn
  socket.on("resolvedMove", ({ originPoint, targetPoint, key }) => {
    socket.to(key).emit("resolvedMove", { originPoint, targetPoint });
  });

  //Reset Match
  socket.on("resetMatchRequest", ({ key }) => {
    socket.to(key).emit("resetMatchRequested");
  });

  socket.on("resetMatchResponse", ({ answer, key }) => {
    socket.to(key).emit("resetMatchResolve", { answer });
    socket.emit("resetMatchResolve", { answer });
  });

  //Undo Move
  socket.on("undoMoveRequest", ({ key }) => {
    socket.to(key).emit("undoMoveRequested");
  });

  socket.on("undoMoveResponse", ({ answer, key }) => {
    socket.to(key).emit("undoMoveResolve", { answer });
    socket.emit("undoMoveResolve", { answer });
  });
});

function generateKey() {
  const chars = [
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
    ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
  ];
  const key = [];
  for (let i = 0; i < 5; i++) {
    const num = Math.floor(Math.random() * 10);
    const charsIndex = Math.random() > 0.5 ? 0 : 1;
    const char = chars[charsIndex][num];
    key[i] = char;
  }
  return key.join("");
}
