import compression from "compression";
import cors from "cors";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "path";
import { createLobby, Lobby, LOBBY_TYPE } from "../shared/match";
import { RESOURCES } from "../shared/resources";
import { createWebsocketServer } from "./websocket-server";
import { generateKey } from "../shared/helpers";

const clientPath = fileURLToPath(new URL("../client", import.meta.url));

const app = express();

const port = process.env.PORT || 3000;

app.use(compression());
app.use(cors());

app.use(express.static(clientPath));

app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.get(RESOURCES.CREATE_LOBBY, (req, res) => {
  const lobby = createLobby({
    type: LOBBY_TYPE.ONLINE,
    vs: "human",
    key: generateKey(),
  });
  lobbies.set(lobby.key, lobby);
  res.send(lobby.key);
});

app.get(RESOURCES.JOIN_LOBBY, (req, res) => {
  const lobbyKey = req.query.key as string;
  if (!lobbyKey) {
    res.status(400).send("Lobby key is required");
    return;
  }
  const lobby = lobbies.get(lobbyKey);
  if (!lobby) {
    res.status(400).send("Lobby does not exist");
    return;
  }
  if (lobby.players.length === 2) {
    res.status(400).send("Lobby is full");
    return;
  }
  res.send(lobbyKey);
});

app.get("*", function (req, res) {
  res.sendFile(path.join(clientPath, "index.html"));
});

const server = app.listen(port, function () {
  console.log(`Server listening on port ${port}!\n`);
});

const lobbies = new Map<string, Lobby>();

const io = createWebsocketServer({ server, lobbies });

setInterval(() => {
  const socketedRooms = io.sockets.adapter.rooms;
  for (let lobbyKey of lobbies.keys()) {
    if (!socketedRooms.has(lobbyKey)) lobbies.delete(lobbyKey);
  }
}, 10000);
