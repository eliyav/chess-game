import { Message } from "../../modals/message-modal";
import { Controller } from "../controller";
import { websocket } from "../../../websocket-client";

export function requestUndoMove({
  setMessage,
  controller,
}: {
  setMessage: (value: React.SetStateAction<Message | null>) => void;
  controller: Controller;
}): string[] {
  websocket.on("undoMoveRequested", () => {
    setMessage({
      text: "Opponent requested to undo the last game move. Do you accept?",
      onConfirm: () => {
        websocket.emit("undoMoveResponse", {
          answer: true,
          lobbyKey: controller.match.lobby.key,
        });
        setMessage(null);
      },
      onReject: () => {
        websocket.emit("undoMoveResponse", {
          answer: false,
          lobbyKey: controller.match.lobby.key,
        });
        setMessage(null);
      },
    });
  });

  websocket.on("undoMoveResolve", ({ answer }) => {
    if (answer) {
      controller.match.undoTurn();
      controller.resetView();

      setMessage({
        text: "Last move has been undone successfully!",
        onConfirm: () => setMessage(null),
      });
    }
  });

  return ["undo-move-requested", "undo-move-resolve"];
}
