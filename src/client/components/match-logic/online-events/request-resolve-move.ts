import { Socket } from "socket.io-client";
import { Message } from "../../modals/message-modal";
import { Controller } from "../controller";

export function requestResolveMove({
  socket,
  controller,
}: {
  socket: Socket;
  setMessage: (value: React.SetStateAction<Message | null>) => void;
  controller: Controller;
}): string[] {
  socket.on("resolved-move", ({ originPoint, targetPoint }) => {
    controller.handleResolvedMove([originPoint, targetPoint]);
  });

  return ["resolved-move"];
}
