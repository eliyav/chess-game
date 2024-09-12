import { Socket } from "socket.io-client";
import { Message } from "../../modals/message-modal";
import { Controller } from "../controller";

export function requestUndoMove({
  socket,
  setMessage,
  controller,
}: {
  socket: Socket;
  setMessage: (value: React.SetStateAction<Message | null>) => void;
  controller: Controller;
}): string[] {
  socket.on("undo-move-requested", () => {
    setMessage({
      text: "Opponent requested to undo the last game move. Do you accept?",
      onConfirm: () => {
        socket.emit("undo-move-response", {
          answer: true,
          key: controller.match.lobby.key,
        });
        setMessage(null);
      },
      onReject: () => {
        socket.emit("undo-move-response", {
          answer: false,
          key: controller.match.lobby.key,
        });
        setMessage(null);
      },
    });
  });

  socket.on("undo-move-resolve", ({ answer }) => {
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
