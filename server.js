const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const compression = require("compression");

const app = express();
const config = require("./webpack.config.js");
const compiler = webpack(config);

const port = process.env.PORT || 3000;

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(compression());
app.use(webpackDevMiddleware(compiler));

// Serve the files on port 3000.
const server = app.listen(port, function () {
  console.log("Example app listening on port 3000!\n");
});

//Activate Sockets
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  //Create Room
  socket.on("create-room", (gameMode) => {
    gameMode.room = generateKey();
    socket.join(gameMode.room);
    socket.emit("message", "You have created a new Game Room!");
    socket.emit("reply-invite-code", gameMode.room);
    socket.emit("assign-room-info", gameMode);
  });
  //Join Room
  socket.on("join-room", (roomCode) => {
    socket.join(roomCode);
    socket.to(roomCode).emit("message", "A new player has joined the room");
    socket.to(roomCode).emit("request-room-info");
  });

  socket.on("reply-room-info", (gameMode) => {
    socket.to(gameMode.room).emit("assign-room-info", gameMode);
  });

  socket.on("check-match-start", (gameMode) => {
    const clients = io.sockets.adapter.rooms.get(gameMode.room);
    const serializedSet = [...clients.keys()];
    if (serializedSet.length === 2) {
      socket.to(gameMode.room).emit("start-match");
      socket.emit("start-match");
    }
  });

  socket.on("stateChange", ({ originPoint, targetPoint, room }) => {
    socket.to(room).emit("message", "Move has been entered");
    socket.to(room).emit("stateChange", { originPoint, targetPoint });
  });

  socket.on("pause-game", ({ gameMode, currentPlayer, time }) => {
    socket.to(gameMode.room).emit("pause-game", { currentPlayer, time });
  });

  socket.on("reset-board", (gameMode) => {
    socket
      .to(gameMode.room)
      .emit("message", "Opponent has requested a board reset!");
    socket.to(gameMode.room).emit("reset-board-request");
  });

  socket.on("reset-board-response", ({ string, gameMode }) => {
    console.log(string);
    if (string === "Yes") {
      socket
        .to(gameMode.room)
        .emit("message", "Opponent has agreed to reset the board!");
      socket.to(gameMode.room).emit("reset-board-resolve", "Yes");
      socket.emit("reset-board-resolve", "Yes");
    } else {
      socket
        .to(gameMode.room)
        .emit("message", "Opponent has declined to reset the board!");
      socket.to(gameMode.room).emit("reset-board-resolve", "No");
      socket.emit("reset-board-resolve", "No");
    }
  });

  socket.on("undo-move", (gameMode) => {
    socket
      .to(gameMode.room)
      .emit("message", "Opponent has requested to undo their last turn!");
    socket.to(gameMode.room).emit("undo-move-request");
  });

  socket.on("undo-move-response", ({ string, gameMode }) => {
    if (string === "Yes") {
      socket
        .to(gameMode.room)
        .emit("message", "Opponent has agreed for game Draw!");
      socket.to(gameMode.room).emit("undo-move-resolve", "Yes");
      socket.emit("undo-move-resolve", "Yes");
    } else {
      socket
        .to(gameMode.room)
        .emit("message", "Opponent has declined for game Draw!");
      socket.to(gameMode.room).emit("undo-move-resolve", "No");
      socket.emit("undo-move-resolve", "No");
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
