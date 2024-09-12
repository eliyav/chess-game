import { Socket } from "socket.io-client";
import { Message } from "../../modals/message-modal";
import { Controller } from "../controller";

export function requestMatchReset({
  socket,
  setMessage,
  controller,
}: {
  socket: Socket;
  setMessage: (value: React.SetStateAction<Message | null>) => void;
  controller: Controller;
}): string[] {
  socket.on("reset-match-requested", () => {
    setMessage({
      question: "Opponent requested a match reset. Do you accept?",
      onConfirm: () => {
        socket.emit("reset-match-response", {
          answer: true,
          key: controller.match.lobby.key,
        });
        setMessage(null);
      },
      onReject: () => {
        socket.emit("reset-match-response", {
          answer: false,
          key: controller.match.lobby.key,
        });
        setMessage(null);
      },
    });
  });

  socket.on("reset-match-resolve", ({ answer }) => {
    if (answer) {
      controller.match.reset();
      controller.resetView();

      setMessage({
        question: "Match reset successfully!",
        onConfirm: () => setMessage(null),
      });
    }
  });

  return ["reset-match-requested", "reset-match-resolve"];
}
