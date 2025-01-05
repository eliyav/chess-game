import { Point } from "../../shared/game";
import type { ServerToClientEvents } from "../../shared/websocket";
import { websocket } from "../websocket-client";
import type { Controller } from "./controller";

type GameEvents<T, K = (args: any) => void> = {
  name: T;
  event: K;
};

export type OnlineEvents = GameEvents<keyof ServerToClientEvents>;
export type LocalEvents = GameEvents<
  string,
  ((this: Worker, ev: MessageEvent) => any) | null
>;

export function createOnlineEvents({
  controller,
}: {
  controller: Controller;
}): OnlineEvents[] {
  const match = controller.match;
  if (!match) return [];
  return [
    {
      name: "resetMatchRequested",
      event: () => {
        controller.setMessage({
          text: "Opponent requested a match reset. Do you accept?",
          onConfirm: () => {
            websocket.emit("resetMatchResponse", {
              answer: true,
              lobbyKey: match.lobby.key,
            });
            controller.setMessage(null);
          },
          onReject: () => {
            websocket.emit("resetMatchResponse", {
              answer: false,
              lobbyKey: match.lobby.key,
            });
            controller.setMessage(null);
          },
        });
      },
    },
    {
      name: "resetMatchResolve",
      event: ({ answer }: { answer: boolean }) => {
        if (answer) {
          match.reset();
          controller.resetView();
          controller.setAlert({
            message: "Match reset successfully!",
          });
        }
      },
    },
    {
      name: "resolvedMove",
      event: async ({ from, to }: { from: Point; to: Point }) => {
        await controller.move({
          move: [from, to],
          emit: false,
        });
      },
    },
    {
      name: "undoTurnRequested",
      event: () => {
        controller.setMessage({
          text: "Opponent requested to undo the last game move. Do you accept?",
          onConfirm: () => {
            websocket.emit("undoTurnResponse", {
              answer: true,
              lobbyKey: match.lobby.key,
            });
            controller.setMessage(null);
          },
          onReject: () => {
            websocket.emit("undoTurnResponse", {
              answer: false,
              lobbyKey: match.lobby.key,
            });
            controller.setMessage(null);
          },
        });
      },
    },
    {
      name: "undoTurnResolve",
      event: ({ answer }: { answer: boolean }) => {
        if (answer) {
          controller.undoTurn();
          controller.setAlert({
            message: "Last move has been undone successfully!",
          });
        }
      },
    },
  ];
}

export function createLocalEvents({
  controller,
}: {
  controller: Controller;
}): LocalEvents {
  return {
    name: "onMessage",
    event: async (e: MessageEvent) => {
      if (e.data.type === "move") {
        await controller.move({
          move: [e.data.move.from, e.data.move.to],
          emit: false,
        });
      } else if (e.data.type === "progress") {
        controller.setThinkingProgress(e.data.progress);
      } else {
        console.error("Invalid message type");
      }
    },
  };
}
