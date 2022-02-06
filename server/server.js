require("dotenv").config();
const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const compression = require("compression");
const config = require("../webpack.config.js");
const { Mongo } = require("./mongoDB/mongo.js");

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
const app = express();
const compiler = webpack(config);
app.use(compression());
app.use(webpackDevMiddleware(compiler));

// Serve the files on port 3000.
const port = process.env.PORT || 3000;
const server = app.listen(port, function () {
  console.log("Example app listening on port 3000!\n");
});

//MongoDB
const mongo = new Mongo();

//Activate Sockets
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  // socket.on("save-game", (match) => {
  //   if (db) {
  //     db.collection("matches").insertOne(match);
  //     console.log("Match Added to DB");
  //   }
  // });

  // socket.on("lookup-game", (objId) => {
  //   if (db) {
  //     async function loadGame() {
  //       const match = await lookupObjId("matches", objId);
  //       socket.emit("load-game", match);
  //     }
  //     loadGame();
  //   }
  // });

  //Create Room
  socket.on("create-room", () => {
    const room = generateKey();
    socket.join(room);
    socket.emit("message", "You have created a new Game Room!");
    socket.emit("reply-invite-code", room);
    socket.emit("assign-room-number", room);
  });
  //Join Room
  socket.on("join-room", (room) => {
    socket.join(room);
    socket.to(room).emit("message", "A new player has joined the room");
    socket.to(room).emit("request-room-info");
  });

  socket.on("reply-room-info", (matchInfo) => {
    socket.to(matchInfo.room).emit("assign-room-info", matchInfo);
  });

  socket.on("check-match-start", (room) => {
    const clients = io.sockets.adapter.rooms.get(room);
    const serializedSet = [...clients.keys()];
    if (serializedSet.length === 2) {
      socket.to(room).emit("start-online-match");
      socket.emit("start-online-match");
    }
  });

  socket.on("stateChange", ({ originPoint, targetPoint, room }) => {
    socket.to(room).emit("message", "Move has been entered");
    socket.to(room).emit("stateChange", { originPoint, targetPoint });
  });

  socket.on("pause-game", ({ room, currentPlayer, time }) => {
    socket.to(room).emit("pause-game", { currentPlayer, time });
    socket.emit("pause-game", { currentPlayer, time });
  });

  socket.on("reset-board", (room) => {
    socket.to(room).emit("message", "Opponent has requested a board reset!");
    socket.to(room).emit("reset-board-request", room);
  });

  socket.on("confirm-board-reset", (room) => {
    socket.to(room).emit("message", "Opponent has agreed to reset the board!");
    socket.to(room).emit("reset-board-resolve", "Yes");
    socket.emit("reset-board-resolve", "Yes");
  });

  socket.on("reject-board-reset", (room) => {
    socket
      .to(room)
      .emit("message", "Opponent has declined to reset the board!");
    socket.to(room).emit("reset-board-resolve", "No");
    socket.emit("reset-board-resolve", "No");
  });

  socket.on("undo-move", (room) => {
    socket
      .to(room)
      .emit("message", "Opponent has requested to undo their last turn!");
    socket.to(room).emit("undo-move-request", room);
  });

  socket.on("confirm-undo-move", (room) => {
    socket.to(room).emit("message", "Opponent has agreed for game Draw!");
    socket.to(room).emit("undo-move-resolve", "Yes");
    socket.emit("undo-move-resolve", "Yes");
  });

  socket.on("reject-undo-move", (room) => {
    socket.to(room).emit("message", "Opponent has declined for game Draw!");
    socket.to(room).emit("undo-move-resolve", "No");
    socket.emit("undo-move-resolve", "No");
  });

  socket.on("resign-game", () => {
    socket.to(room).emit("message", "Opponent has resigned the game!");
    socket.to(room).emit("resign-request");
  });

  function generateKey() {
    let chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    let key = [];
    for (i = 0; i < 5; i++) {
      let num = Math.floor(Math.random() * 10);
      let char = chars[num];
      key[i] = char;
    }
    return key.join("");
  }

  async function lookupObjId(collection, objID) {
    const doc = await db.collection(collection).findOne({
      _id: ObjectId(objID),
    });
    return doc;
  }
});
