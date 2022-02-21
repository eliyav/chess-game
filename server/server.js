require("dotenv").config();
const express = require("express");
const { Mongo } = require("./mongoDB/mongo.js");
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");

const app = express();
const port = process.env.PORT || 8080;
//MongoDB
const mongo = new Mongo();
//#region Middleware
const verifyJwt = jwt({
  secret: jwks.expressJwtSecret({
    cache: false,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.JWKS_URI,
  }),
  audience: process.env.JWKS_AUDIENCE,
  issuer: process.env.JWKS_ISSUER,
  algorithms: ["RS256"],
}).unless({ path: ["/", "/favicon.ico"] });
app.use(verifyJwt);
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Internal server error";
  res.status(status).send(message);
});
//#endregion

const server = app.listen(port, function () {
  console.log("Example app listening on port 3000!\n");
});

app.post("/login", async (req, res) => {
  const body = JSON.parse(req.body);
  const user = await mongo.findUser({ email: body.user.email });
  if (!user) {
    const { insertedId } = await mongo.createUser(body.user);
    const user = await mongo.findUser({ _id: insertedId });
    return res.json(user);
  }
  return res.json(user);
});
const lobbyLog = new Map();
//Activate Sockets
const io = require("socket.io")(server);
setInterval(() => {
  const socketedRooms = io.sockets.adapter.rooms;
  for (let lobbyKey of lobbyLog.keys()) {
    if (!socketedRooms.has(lobbyKey)) lobbyLog.delete(lobbyKey);
  }
}, 10000);

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
    lobbyLog.set(lobbySettings.lobbyKey, lobbySettings);
    socket
      .to(lobbySettings.lobbyKey)
      .emit("room-info", lobbyLog.get(lobbySettings.lobbyKey));
  });

  socket.on("resolvedTurn", ({ originPoint, targetPoint, lobbyKey }) => {
    socket.to(lobbyKey).emit("message", "Move has been entered");
    socket.to(lobbyKey).emit("opponentsTurn", { originPoint, targetPoint });
  });

  socket.on("start-match", (lobbyKey) => {
    const clients = io.sockets.adapter.rooms.get(lobbyKey);
    const serializedSet = [...clients.keys()];
    if (serializedSet.length === 2) {
      socket.to(lobbyKey).emit("start-match");
      socket.emit("message", "Emitted Message");
    }
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
});
