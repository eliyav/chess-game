import { Point } from "../../shared/game";
import type { ServerToClientEvents } from "../../shared/websocket";
import { websocket } from "../websocket-client";
import type { Controller } from "./controller";

export type OnlineEvent = {
  name: keyof ServerToClientEvents;
  event: (args: any) => void;
};

export function getOnlineSubscribers(events: OnlineEvent[]) {
  const subscribe = () => {
    for (const { name, event } of events) {
      websocket.on(name, event);
    }
  };

  const unsubscribe = () => {
    for (const { name, event } of events) {
      websocket.off(name, event);
    }
  };

  return { subscribe, unsubscribe };
}

export function createMatchEvents({
  controller,
}: {
  controller: Controller;
}): OnlineEvent[] {
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
        controller.move([originPoint, targetPoint], false);
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
    {
      name: "opponentDisconnected",
      event: () => {
        controller.opponentLeftMatch();
        controller.setMessage({
          text: "Opponent has left the match",
          onConfirm: () => {
            controller.setMessage(null);
          },
        });
      },
    },
  ];
}
