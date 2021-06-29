const app = require("express")();
const httpServer = require("http").createServer(app);
const options = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};
const io = require("socket.io")(httpServer, options);

io.on("connection", (socket) => {
  socket.on("get-id", () => {
    socket.emit("sent-id", Math.random());
  });
  socket.on("join-room", (id) => {
    socket.join(id);
    socket.to(id).emit("message", "A new player has joined the room");
    const clients = io.sockets.adapter.rooms.get(id);
    const serializedSet = [...clients.keys()];
    socket.emit("room-info", serializedSet);
    console.log(clients);
  });

  socket.on("stateChange", ({ originPoint, targetPoint, room }) => {
    socket.broadcast.to(room).emit("message", "Move has been entered");
    socket.broadcast.to(room).emit("stateChange", { originPoint, targetPoint });
  });
});

httpServer.listen(3000);

// import express from "express";
// import path, { dirname } from "path";
// import { fileURLToPath } from "url";
// import { WebSocket } from "socket.io";

// // const __dirname = dirname(fileURLToPath(import.meta.url));

// // const app = express();

// // const ownRootPath = path.join(__dirname, "../../");

// // const port = 3000;

// // app.use(express.static(ownRootPath));

// // app.listen(port, () => {
// //   console.log("Server is up on port " + port + "!");
// // });
