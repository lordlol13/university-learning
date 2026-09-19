import type { StorkController } from "@/lib/stork-controller";
import { animationDurations } from "./stork-config";
import type { StorkAnimation } from "./types";
const microReactions: StorkAnimation[] = [
  "wave",
  "lookAround",
  "happy",
  "encourage",
];
export function reactToStorkTap(
  controller: StorkController,
  random = Math.random,
) {
  const animation =
    microReactions[Math.min(3, Math.floor(random() * microReactions.length))];
  return controller.request(animation, "click", animationDurations[animation]);
}
export function noticeStorkCursor(controller: StorkController) {
  return controller.request("lookAround", "hover", 1.1);
}
