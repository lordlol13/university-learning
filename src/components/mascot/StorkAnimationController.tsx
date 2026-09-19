"use client";
import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useLearningEvents } from "@/stores/progress-provider";
import { StorkController } from "@/lib/stork-controller";

export type { StorkAnimation } from "@/lib/stork-controller";
export function useStorkController(enabled = true) {
  const [controller] = useState(() => new StorkController());
  const events = useLearningEvents();
  useEffect(() => {
    if (!enabled) {
      controller.reset();
      return;
    }
    return events.subscribe((event) => controller.react(event));
  }, [events, controller, enabled]);
  return controller;
}
export function StorkAnimationController({
  controller,
}: {
  controller: StorkController;
}) {
  useFrame((_, delta) => controller.update(delta), -3);
  return null;
}
