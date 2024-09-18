import { Controller } from "../controller";
import { websocket } from "../../../websocket-client";

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
