const express = require("express");
const path = require("path");
const app = express();

//Activate Server
const port = 3000;
// const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});
const server = app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server started port: ${port}`);
  }
});

//Activate Sockets
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  socket.on("create-room", () => {
    let room = generateKey();
    socket.join(room);
    socket.emit("message", "You have created a new Game Room!");
    socket.emit("reply-room-id", room);
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

const generateKey = () => {
  let chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  let key = [];
  for (i = 0; i < 5; i++) {
    let num = Math.floor(Math.random() * 10);
    let char = chars[num];
    key[i] = char;
  }
  return key.join("");
};
