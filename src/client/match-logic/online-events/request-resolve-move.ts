import { websocket } from "../../websocket-client";
import { Controller } from "../controller";

export function requestResolveMove({
  controller,
}: {
  controller: Controller;
}): string[] {
  websocket.on("resolvedMove", ({ originPoint, targetPoint }) => {
    controller.handleResolvedMove([originPoint, targetPoint]);
  });

  return ["resolved-move"];
}
