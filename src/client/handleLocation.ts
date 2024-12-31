import { Location } from "react-router-dom";
import { createLobby, Lobby, LOBBY_TYPE, PlayerType } from "../shared/match";
import { APP_ROUTES } from "../shared/routes";
import { Controller } from "./match-logic/controller";
import { websocket } from "./websocket-client";

export function handleLocation(
  lobby: Lobby | undefined,
  setLobby: (lobby: Lobby | undefined) => void,
  location: Location,
  controller: Controller,
  navigate: (to: string) => void
) {
  const type = new URLSearchParams(location.search).get("type");
  const vs = new URLSearchParams(location.search).get(
    "vs"
  ) as PlayerType | null;
  const depth = new URLSearchParams(location.search).get("depth");
  const time = new URLSearchParams(location.search).get("time");

  if (
    location.pathname === APP_ROUTES.GAME ||
    location.pathname === APP_ROUTES.LOBBY
  ) {
    if (type === LOBBY_TYPE.ONLINE) {
      if (!lobby) {
        const key = new URLSearchParams(location.search).get("key");
        if (key) {
          websocket.emit("joinLobby", { lobbyKey: key });
        } else {
          controller?.events.setMessage({
            text: "Lobby does not exist",
            onConfirm: () => controller.events.setMessage(null),
          });
          navigate(APP_ROUTES.LOBBY_SELECT);
        }
      }
      return;
    } else {
      if (!lobby) {
        const searchParams = new URLSearchParams(location.search);
        const lobby = createLobby({
          type: type as LOBBY_TYPE,
          vs,
          time,
          depth,
        });
        setLobby(lobby);
        searchParams.set("type", lobby.mode);
        searchParams.set("vs", vs || lobby.players[1].type);
        searchParams.set("time", String(lobby.time));
        if (lobby.players[1].type === "computer") {
          searchParams.set("depth", String(lobby.depth));
        }
        navigate(`${location.pathname}?${searchParams.toString()}`);
      }
    }
  } else if (location.pathname === APP_ROUTES.LOBBY_SELECT) {
    setLobby(undefined);
  }
}
