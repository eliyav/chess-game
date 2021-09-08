const app = require("express")();

const httpServer = require("http").createServer(app);
const options = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};

const io = require("socket.io")(httpServer, options);

io.on("connection", (socket: any) => {
  let room: any;
  socket.on("request-room-id", () => {
    room = Math.random();
    socket.join(room);
    socket.emit("message", "You have created a new Game Room!");
    socket.emit("reply-room-id", room);
    const clients = io.sockets.adapter.rooms.get(room);
    const serializedSet = [...clients.keys()];
    socket.emit("room-info", serializedSet);
    console.log(clients);
  });
  socket.on("join-room", (roomNumber: any) => {
    room = roomNumber;
    socket.join(room);
    socket.to(room).emit("message", "A new player has joined the room");
    const clients = io.sockets.adapter.rooms.get(room);
    const serializedSet = [...clients.keys()];
    socket.to(room).emit("room-info", serializedSet);
    socket.emit("reply-room-id", room);
    socket.emit("room-info", serializedSet);
    console.log(clients);
  });

  socket.on("stateChange", ({ originPoint, targetPoint, room }: any) => {
    socket.to(room).emit("message", "Move has been entered");
    socket.to(room).emit("stateChange", { originPoint, targetPoint });
  });

  socket.on("reset-board", () => {
    socket.to(room).emit("message", "Opponent has requested a board reset!");
    socket.to(room).emit("reset-board-request");
  });

  socket.on("reset-board-response", (answer: any) => {
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

  socket.on("draw-response", (answer: any) => {
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

httpServer.listen(3000);
