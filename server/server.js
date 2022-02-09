require("dotenv").config();
const express = require("express");
const { Mongo } = require("./mongoDB/mongo.js");
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const bodyParser = require("body-parser");

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
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
  const user = await mongo.checkForUser(body.user.email);
  !user ? await mongo.createUser(body.user) : null;
});

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
