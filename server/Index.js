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

//this is the socket of each client in the room.
//const clientSocket = io.sockets.sockets.get(clientId);
