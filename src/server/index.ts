import express from "express";
import path from "path";
import compression from "compression";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { LOBBY_TYPE, Lobby } from "../shared/match";

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
  io.to(room).emit("lobby-info", lobby);
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

const io = new Server(server);

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
        io.to(key).emit("lobby-info", lobby);
      }
    }
  });

  socket.on("join-room", ({ room }) => {
    if (lobbyLog.has(room)) {
      const lobby = lobbyLog.get(room);
      if (!lobby) return;
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
      });
      io.to(room).emit("lobby-info", lobby);
    } else {
      socket.emit("message", "Room does not exist");
    }
  });

  socket.on("leave-room", ({ room }) => {
    if (lobbyLog.has(room)) {
      const lobby = lobbyLog.get(room);
      if (!lobby) return;
      lobby.players = lobby.players.filter((player) => player.id !== socket.id);
      socket.to(room).emit("lobby-info", lobby);
    }
  });

  socket.on("request-match-start", ({ room }) => {
    const clients = io.sockets.adapter.rooms.get(room);
    const serializedSet = clients ? [...clients.keys()] : [];
    if (serializedSet.length === 2) {
      io.to(room).emit("match-start");
      socket.emit("message", "Match started!");
    }
  });

  //Resolve Turn
  socket.on("resolved-move", ({ originPoint, targetPoint, key }) => {
    socket.to(key).emit("resolved-move", { originPoint, targetPoint });
  });

  //Reset Match
  socket.on("reset-match-request", ({ key }) => {
    socket.to(key).emit("reset-match-requested");
  });

  socket.on("reset-match-response", ({ answer, key }) => {
    socket.to(key).emit("reset-match-resolve", { answer });
    socket.emit("reset-match-resolve", { answer });
  });

  //Undo Move
  socket.on("undo-move-request", ({ key }) => {
    socket.to(key).emit("undo-move-requested");
  });

  socket.on("undo-move-response", ({ answer, key }) => {
    socket.to(key).emit("undo-move-resolve", { answer });
    socket.emit("undo-move-resolve", { answer });
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
