import express from "express";
import path from "path";
import compression from "compression";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";

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

const server = app.listen(port, function () {
  console.log(`Example app listening on port ${port}!\n`);
});

const lobbyLog = new Map();

const io = new Server(server);
setInterval(() => {
  const socketedRooms = io.sockets.adapter.rooms;
  for (let lobbyKey of lobbyLog.keys()) {
    if (!socketedRooms.has(lobbyKey)) lobbyLog.delete(lobbyKey);
  }
}, 10000);

setInterval(() => {
  console.log(lobbyLog);
}, 2000);

io.on("connection", (socket) => {
  socket.on("create-lobby", (lobbySettings) => {
    const lobbyKey = generateKey();
    socket.join(lobbyKey);
    const lobby = {
      lobbyKey: lobbyKey,
      hostName: lobbySettings.hostName,
      opponentName: "Waiting...",
      time: 0,
      firstMove: "Game Host",
    };
    lobbyLog.set(lobbyKey, lobby);
    socket.emit("room-info", lobbyLog.get(lobbyKey));
  });

  socket.on("get-room-info", (lobbyKey) => {
    io.to(lobbyKey).emit("room-info", lobbyLog.get(lobbyKey));
  });

  socket.on("join-lobby", ({ lobbyKey, name }) => {
    const lobbyExists = lobbyLog.has(lobbyKey);
    if (lobbyExists) {
      socket.join(lobbyKey);
      const lobby = lobbyLog.get(lobbyKey);
      lobbyLog.set(lobbyKey, { ...lobby, opponentName: name });
      io.to(lobbyKey).emit("room-info", lobbyLog.get(lobbyKey));
    } else {
      socket.emit("message", "No Such Lobby Exists");
    }
  });

  socket.on("update-lobby", ({ lobbySettings }) => {
    console.log(lobbySettings);
    lobbyLog.set(lobbySettings.lobbyKey, lobbySettings);
    socket
      .to(lobbySettings.lobbyKey)
      .emit("room-info", lobbyLog.get(lobbySettings.lobbyKey));
  });

  socket.on("resolvedTurn", ({ originPoint, targetPoint, lobbyKey }) => {
    socket.to(lobbyKey).emit("resolvedMove", { originPoint, targetPoint });
  });

  socket.on("start-match", (lobbyKey, firstMove) => {
    const clients = io.sockets.adapter.rooms.get(lobbyKey);
    const serializedSet = clients ? [...clients.keys()] : [];
    if (serializedSet.length === 2) {
      socket.to(lobbyKey).emit("start-match", lobbyKey, firstMove);
      socket.emit("message", "Match started!");
    }
  });

  socket.on("promotion-await", (lobbyKey) => {
    socket.to(lobbyKey).emit("promotion-await");
  });

  socket.on("promote-piece", (piece, lobbyKey) => {
    socket.to(lobbyKey).emit("promote-piece", piece);
  });

  socket.on("match-restart", (lobbyKey) => {
    socket.to(lobbyKey).emit("match-restart-request", lobbyKey);
  });

  socket.on("match-restart-response", (response, lobbyKey) => {
    if (response) {
      socket.to(lobbyKey).emit("match-restart-resolve", true);
      socket.emit("match-restart-resolve", true);
    } else {
      socket.to(lobbyKey).emit("match-restart-resolve", false);
      socket.emit("match-restart-resolve", false);
    }
  });

  socket.on("board-reset", (lobbyKey) => {
    socket.to(lobbyKey).emit("board-reset-request", lobbyKey);
  });

  socket.on("board-reset-response", (response, lobbyKey) => {
    if (response) {
      socket.to(lobbyKey).emit("board-reset-resolve", true);
      socket.emit("board-reset-resolve", true);
    } else {
      socket.to(lobbyKey).emit("board-reset-resolve", false);
      socket.emit("board-reset-resolve", false);
    }
  });

  socket.on("undo-move", (lobbyKey) => {
    socket.to(lobbyKey).emit("undo-move-request", lobbyKey);
  });

  socket.on("undo-move-response", (response, lobbyKey) => {
    if (response) {
      socket.to(lobbyKey).emit("undo-move-resolve", true);
      socket.emit("undo-move-resolve", true);
    } else {
      socket.to(lobbyKey).emit("undo-move-resolve", false);
      socket.emit("undo-move-resolve", false);
    }
  });

  socket.on("pause-game", (lobbyKey) => {
    socket.to(lobbyKey).emit("pause-game-request", lobbyKey);
  });

  socket.on("pause-game-response", (response, lobbyKey) => {
    if (response) {
      socket.to(lobbyKey).emit("pause-game-resolve", true);
      socket.emit("pause-game-resolve", true);
    } else {
      socket.to(lobbyKey).emit("pause-game-resolve", false);
      socket.emit("pause-game-resolve", false);
    }
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
});
