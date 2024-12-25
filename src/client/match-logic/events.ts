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
  return [
    {
      name: "resetMatchRequested",
      event: () => {
        controller.setMessage({
          text: "Opponent requested a match reset. Do you accept?",
          onConfirm: () => {
            websocket.emit("resetMatchResponse", {
              answer: true,
              lobbyKey: controller.match.lobby.key,
            });
            controller.setMessage(null);
          },
          onReject: () => {
            websocket.emit("resetMatchResponse", {
              answer: false,
              lobbyKey: controller.match.lobby.key,
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
          controller.resetMatchAndView();
          controller.setMessage({
            text: "Match reset successfully!",
            onConfirm: () => controller.setMessage(null),
          });
        }
      },
    },
    {
      name: "resolvedMove",
      event: ({
        originPoint,
        targetPoint,
      }: {
        originPoint: Point;
        targetPoint: Point;
      }) => {
        controller.move({ move: [originPoint, targetPoint], emit: false });
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
              lobbyKey: controller.match.lobby.key,
            });
            controller.setMessage(null);
          },
          onReject: () => {
            websocket.emit("undoTurnResponse", {
              answer: false,
              lobbyKey: controller.match.lobby.key,
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
          controller.setMessage({
            text: "Last move has been undone successfully!",
            onConfirm: () => controller.setMessage(null),
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
}): LocalEvents[] {
  return [
    {
      name: "onMove",
      event: (e: MessageEvent) => {
        if (e.data.type === "move") {
          controller.move({
            move: [e.data.move.origin, e.data.move.target],
            emit: false,
          });
        }
      },
    },
  ];
}
