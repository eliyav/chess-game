import { Point } from "../../shared/game";
import { websocket } from "../websocket-client";
import type { Controller } from "./controller";

type EventFunc = () => void;

export type OnlineEvent = {
  subscribe: (event: EventFunc) => void;
  unsubscribe: (event: EventFunc) => void;
  event: EventFunc;
};

//Each event has its individual subscribe, unsubscribe because websocket does not export the Event Types and I get type checking from the .on .off methods
export function getOnlineSubscribers(events: OnlineEvent[]) {
  const subscribe = () => {
    events.forEach(({ subscribe, event }) => subscribe(event));
  };

  const unsubscribe = () => {
    events.forEach(({ unsubscribe, event }) => unsubscribe(event));
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
      subscribe: (event: EventFunc) => {
        websocket.on("resetMatchRequested", event);
      },
      unsubscribe: (event: EventFunc) => {
        websocket.off("resetMatchRequested", event);
      },
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
      subscribe: (event: EventFunc) => {
        websocket.on("resetMatchResolve", event);
      },
      unsubscribe: (event: EventFunc) => {
        websocket.off("resetMatchResolve", event);
      },
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
      subscribe: (event: EventFunc) => {
        websocket.on("resolvedMove", event);
      },
      unsubscribe: (event: EventFunc) => {
        websocket.off("resolvedMove", event);
      },
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
      subscribe: (event: EventFunc) => {
        websocket.on("undoTurnRequested", event);
      },
      unsubscribe: (event: EventFunc) => {
        websocket.off("undoTurnRequested", event);
      },
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
      subscribe: (event: EventFunc) => {
        websocket.on("undoTurnResolve", event);
      },
      unsubscribe: (event: EventFunc) => {
        websocket.off("undoTurnResolve", event);
      },
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
      subscribe: (event: EventFunc) => {
        websocket.on("opponentDisconnected", event);
      },
      unsubscribe: (event: EventFunc) => {
        websocket.off("opponentDisconnected", event);
      },
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
  ] as OnlineEvent[];
}
