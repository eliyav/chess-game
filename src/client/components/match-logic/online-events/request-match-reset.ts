import { Message } from "../../modals/message-modal";
import { Controller } from "../controller";
import { websocket } from "../../../websocket-client";

export function requestMatchReset({
  setMessage,
  controller,
}: {
  setMessage: (value: React.SetStateAction<Message | null>) => void;
  controller: Controller;
}): string[] {
  websocket.on("resetMatchRequested", () => {
    setMessage({
      text: "Opponent requested a match reset. Do you accept?",
      onConfirm: () => {
        websocket.emit("resetMatchResponse", {
          answer: true,
          lobbyKey: controller.match.lobby.key,
        });
        setMessage(null);
      },
      onReject: () => {
        websocket.emit("resetMatchResponse", {
          answer: false,
          lobbyKey: controller.match.lobby.key,
        });
        setMessage(null);
      },
    });
  });

  websocket.on("resetMatchResolve", ({ answer }) => {
    if (answer) {
      controller.match.reset();
      controller.resetView();

      setMessage({
        text: "Match reset successfully!",
        onConfirm: () => setMessage(null),
      });
    }
  });

  return ["reset-match-requested", "reset-match-resolve"];
}
