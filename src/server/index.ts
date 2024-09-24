import compression from "compression";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "path";
import { LOBBY_TYPE, Lobby, buildDefaultOptions } from "../shared/match";
import { Resources } from "../shared/resources";
import { generateKey } from "./helpers";
import { createWebsocketServer } from "./websocket-server";

const clientPath = fileURLToPath(new URL("../client", import.meta.url));

const app = express();

const port = process.env.PORT || 3000;

app.use(compression());

app.use(express.static(clientPath));

app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.get(Resources.CREATE_LOBBY, (req, res) => {
  const key = generateKey();
  const lobby = {
    mode: LOBBY_TYPE.ONLINE,
    key,
    players: [],
    teams: { White: "", Black: "" },
    matchStarted: false,
    controllerOptions: buildDefaultOptions(),
  };
  lobbies.set(key, lobby);
  res.send(key);
});

app.get(Resources.JOIN_LOBBY, (req, res) => {
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
  console.log(`Example app listening on port ${port}!\n`);
});

const lobbies = new Map<string, Lobby>();

const io = createWebsocketServer({ server, lobbies });

setInterval(() => {
  const socketedRooms = io.sockets.adapter.rooms;
  for (let lobbyKey of lobbies.keys()) {
    if (!socketedRooms.has(lobbyKey)) lobbies.delete(lobbyKey);
  }
}, 10000);
