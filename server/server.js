require("dotenv").config();
const express = require("express");
const socketIO = require("socket.io");
// const { Mongo } = require("./mongoDB/mongo.js");
const { expressjwt: jwt } = require("express-jwt");
const jwks = require("jwks-rsa");
const path = require("path");
const compression = require("compression");

const app = express();
const port = process.env.PORT || 8080;
//MongoDB
// const mongo = new Mongo();
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
app.use(compression());
app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../dist/", "index.html"));
});
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
  console.log(`Example app listening on port ${port}!\n`);
});

const lobbyLog = new Map();

setInterval(() => {
  const socketedRooms = io.sockets.adapter.rooms;
  for (let lobbyKey of lobbyLog.keys()) {
    if (!socketedRooms.has(lobbyKey)) lobbyLog.delete(lobbyKey);
  }
}, 10000);

setInterval(() => {
  console.log(lobbyLog);
}, 5000);

const io = socketIO(server);

//Activate Sockets
io.on("connection", (socket) => {
  socket.on("create-lobby", (userName) => {
    let lobbyKey = generateKey();
    while (lobbyLog.has(lobbyKey)) {
      lobbyKey = generateKey();
    }
    const lobby = {
      lobbyKey,
      players: {
        player1: { name: userName[0], color: "White" },
        player2: { name: "", color: "Black" },
      },
      time: "0",
    };
    lobbyLog.set(lobbyKey, lobby);
    socket.join(lobbyKey);
    socket.emit("lobby-info", lobbyLog.get(lobbyKey));
  });

  socket.on("update-lobby-time", ([lobbyKey, time]) => {
    const lobby = lobbyLog.get(lobbyKey);
    lobby.time = time;
    socket.emit("lobby-info", lobbyLog.get(lobbyKey));
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
    const serializedSet = [...clients.keys()];
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
    for (i = 0; i < 5; i++) {
      let num = Math.floor(Math.random() * 10);
      let char = chars[num];
      key[i] = char;
    }
    return key.join("");
  }
});

// app.post("/login", async (req, res) => {
//   const body = JSON.parse(req.body);
//   const user = await mongo.findUser({ email: body.user.email });
//   if (!user) {
//     const { insertedId } = await mongo.createUser(body.user);
//     const user = await mongo.findUser({ _id: insertedId });
//     return res.json(user);
//   }
//   return res.json(user);
// });
