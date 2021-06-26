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
  socket.on("stateChange", (arg) => {
    console.log(arg); // world
    io.emit("stateChange", arg);
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
