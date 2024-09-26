import { Message } from "../../components/modals/message-modal";
import { Controller } from "../controller";
import { websocket } from "../../websocket-client";

export function requestUndoTurn({
  setMessage,
  controller,
}: {
  setMessage: (value: React.SetStateAction<Message | null>) => void;
  controller: Controller;
}): string[] {
  websocket.on("undoTurnRequested", () => {
    setMessage({
      text: "Opponent requested to undo the last game move. Do you accept?",
      onConfirm: () => {
        websocket.emit("undoTurnResponse", {
          answer: true,
          lobbyKey: controller.match.lobby.key,
        });
        setMessage(null);
      },
      onReject: () => {
        websocket.emit("undoTurnResponse", {
          answer: false,
          lobbyKey: controller.match.lobby.key,
        });
        setMessage(null);
      },
    });
  });

  websocket.on("undoTurnResolve", ({ answer }) => {
    if (answer) {
      controller.undoTurn();

      setMessage({
        text: "Last move has been undone successfully!",
        onConfirm: () => setMessage(null),
      });
    }
  });

  return ["undo-move-requested", "undo-move-resolve"];
}
