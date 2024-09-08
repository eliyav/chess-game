import express from "express";
import path from "path";
import compression from "compression";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { LOBBY, LobbySettings } from "../shared/match";

const clientPath = fileURLToPath(new URL("../client", import.meta.url));

const app = express();

const port = process.env.PORT || 3000;

app.use(compression());

app.use(express.static(clientPath));
app.get("*", function (req, res) {
  res.sendFile(path.join(clientPath, "index.html"));
});

app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.post("/create-lobby", (req, res) => {
  const body = JSON.parse(req.body) as { name: string };
  if (!body.name) {
    res.status(400).send("Name is required");
    return;
  }
  const key = generateKey();
  const lobby = {
    mode: LOBBY.ONLINE,
    key,
    players: [body.name],
  };
  lobbyLog.set(key, lobby);
  res.send(key);
});

app.post("/update-lobby", (req, res) => {
  const { room, lobby } = JSON.parse(req.body) as {
    room: string;
    lobby: LobbySettings;
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
  const { name, room } = JSON.parse(req.body) as { name: string; room: string };
  if (!name) {
    res.status(400).send("Name is required");
    return;
  }
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
  lobby.players.push(name);
  io.to(room).emit("lobby-info", lobby);

  res.send("Joined lobby successfully!");
});

const server = app.listen(port, function () {
  console.log(`Example app listening on port ${port}!\n`);
});

const lobbyLog = new Map<string, LobbySettings>();

const io = new Server(server);

setInterval(() => {
  const socketedRooms = io.sockets.adapter.rooms;
  for (let lobbyKey of lobbyLog.keys()) {
    if (!socketedRooms.has(lobbyKey)) lobbyLog.delete(lobbyKey);
  }
}, 10000);

io.on("connection", (socket) => {
  socket.on("join-room", ({ room }) => {
    if (lobbyLog.has(room)) {
      socket.join(room);
      io.to(room).emit("lobby-info", lobbyLog.get(room));
    } else {
      socket.emit("message", "Room does not exist");
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

  socket.on("resolvedTurn", ({ originPoint, targetPoint, lobbyKey }) => {
    socket.to(lobbyKey).emit("resolvedMove", { originPoint, targetPoint });
  });

  socket.on("reset-match-request", ({ key }) => {
    socket.to(key).emit("reset-match-requested");
  });

  socket.on("reset-match-response", ({ answer, key }) => {
    socket.to(key).emit("reset-match-resolve", { answer });
    socket.emit("reset-match-resolve", { answer });
  });
});

function generateKey() {
  let chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  let key = [];
  for (let i = 0; i < 5; i++) {
    let num = Math.floor(Math.random() * 10);
    let char = chars[num];
    key[i] = char;
  }
  return key.join("");
}
