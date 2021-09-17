const express = require("express");
const path = require("path");

const httpServer = require("http").createServer(express);
const options = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};

const app = express();

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server started port: ${port}`);
  }
});

const io = require("socket.io")(httpServer, options);

io.on("connection", (socket) => {
  socket.on("create-room", () => {
    let room = "abcd";
    socket.join(room);
    socket.emit("message", "You have created a new Game Room!");
    socket.emit("reply-room-id", room);
    const clients = io.sockets.adapter.rooms.get(room);
    const serializedSet = [...clients.keys()];
    socket.emit("room-info", serializedSet);
    console.log(clients);
  });
  socket.on("join-room", (room) => {
    socket.join(room);
    socket.to(room).emit("message", "A new player has joined the room");
    const clients = io.sockets.adapter.rooms.get(room);
    const serializedSet = [...clients.keys()];
    socket.to(room).emit("room-info", serializedSet);
    socket.emit("reply-room-id", room);
    socket.emit("room-info", serializedSet);
    console.log(clients);
  });

  socket.on("stateChange", ({ originPoint, targetPoint, room }) => {
    socket.to(room).emit("message", "Move has been entered");
    socket.to(room).emit("stateChange", { originPoint, targetPoint });
  });

  socket.on("reset-board", () => {
    socket.to(room).emit("message", "Opponent has requested a board reset!");
    socket.to(room).emit("reset-board-request");
  });

  socket.on("reset-board-response", (answer) => {
    if (answer === "Yes") {
      socket.to(room).emit("message", "Opponent has agreed to reset the board!");
      socket.to(room).emit("reset-board-resolve", "Yes");
      socket.emit("reset-board-resolve", "Yes");
    } else {
      socket.to(room).emit("message", "Opponent has declined to reset the board!");
      socket.to(room).emit("reset-board-resolve", "No");
      socket.emit("reset-board-resolve", "No");
    }
  });

  socket.on("draw", () => {
    socket.to(room).emit("message", "Opponent has requested a game Draw!");
    socket.to(room).emit("draw-request");
  });

  socket.on("draw-response", (answer) => {
    if (answer === "Yes") {
      socket.to(room).emit("message", "Opponent has agreed for game Draw!");
      socket.to(room).emit("draw-resolve", "Yes");
      socket.emit("draw-resolve", "Yes");
    } else {
      socket.to(room).emit("message", "Opponent has declined for game Draw!");
      socket.to(room).emit("draw-resolve", "No");
      socket.emit("draw-resolve", "No");
    }
  });

  socket.on("resign-game", () => {
    socket.to(room).emit("message", "Opponent has resigned the game!");
    socket.to(room).emit("resign-request");
  });
});

httpServer.listen(8080);
