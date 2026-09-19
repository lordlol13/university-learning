import type { Ref, RefObject } from "react";
import type { Vector3 } from "three";
import type { StorkController, StorkAnimation } from "@/lib/stork-controller";
export type StorkExpression =
  "neutral" | "happy" | "curious" | "excited" | "thinking";
export type StorkQuality = "auto" | "low" | "medium" | "high";
export type StorkLookTarget = "none" | "camera" | "cursor" | Vector3;
export interface StorkHandle {
  play: (animation: StorkAnimation) => void;
  lookAt: (target: StorkLookTarget) => void;
  pointAt: (target: Vector3) => void;
}
export interface StorkMascotProps {
  ref?: Ref<StorkHandle>;
  controller?: StorkController;
  animation?: StorkAnimation;
  expression?: StorkExpression;
  lookAt?: StorkLookTarget;
  pointTarget?: Vector3 | null;
  backpack?: boolean;
  interactive?: boolean;
  quality?: StorkQuality;
  scale?: number;
  reducedMotion?: boolean;
  autoBlink?: boolean;
  autoIdleVariation?: boolean;
  animationSpeed?: number;
  gaze?: RefObject<{ x: number; y: number }>;
  onAnimationChange?: (animation: StorkAnimation) => void;
}
export interface StorkPoseProps extends Omit<
  StorkMascotProps,
  "ref" | "controller"
> {
  controller: StorkController;
  quality: Exclude<StorkQuality, "auto">;
}
export type { StorkAnimation };
