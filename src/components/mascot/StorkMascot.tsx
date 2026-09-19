"use client";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Vector3 } from "three";
import { StorkController } from "@/lib/stork-controller";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion";
import { StorkAssetModel } from "./StorkAssetModel";
import { animationDurations, resolveStorkQuality } from "./stork-config";
import { noticeStorkCursor, reactToStorkTap } from "./StorkInteraction";
import type {
  StorkAnimation,
  StorkLookTarget,
  StorkMascotProps,
} from "./types";

/** Reusable R3F character. No progress provider or application events are required. */
export function StorkMascot({
  ref,
  controller: externalController,
  animation = "idle",
  expression = "neutral",
  lookAt,
  pointTarget,
  backpack = true,
  interactive = false,
  quality = "auto",
  scale = 1,
  reducedMotion,
  animationSpeed = 1,
  onAnimationChange,
  ...props
}: StorkMascotProps) {
  const [ownedController] = useState(() => new StorkController());
  const controller = externalController ?? ownedController;
  const [commandLook, setCommandLook] = useState<StorkLookTarget>("none");
  const [commandTarget, setCommandTarget] = useState<Vector3 | null>(null);
  const preference = useReducedMotionPreference();
  const reduced = reducedMotion ?? preference;
  const width = useThree((s) => s.size.width),
    dpr = useThree((s) => s.viewport.dpr);
  const invalidate = useThree((s) => s.invalidate);
  const last = useRef<StorkAnimation | null>(null);
  const level = resolveStorkQuality(
    quality,
    width,
    dpr,
    typeof navigator === "undefined" ? 8 : navigator.hardwareConcurrency,
  );
  useEffect(() => {
    if (!externalController)
      controller.play(animation, animationDurations[animation]);
    invalidate();
  }, [animation, controller, externalController, invalidate]);
  useEffect(() => {
    // Reduced motion retains gentle pose updates/blinks at 10fps even in demand canvases.
    if (!reduced) return;
    const timer = window.setInterval(invalidate, 100);
    return () => window.clearInterval(timer);
  }, [reduced, invalidate]);
  useImperativeHandle(
    ref,
    () => ({
      play(next) {
        controller.play(next, animationDurations[next]);
        invalidate();
      },
      lookAt(target) {
        setCommandLook(target);
        invalidate();
      },
      pointAt(target) {
        setCommandTarget(target.clone());
        controller.play("pointAtTarget", animationDurations.pointAtTarget);
        invalidate();
      },
    }),
    [controller, invalidate],
  );
  useFrame((_, delta) => {
    if (!externalController)
      controller.update(Math.min(delta, 0.05) * animationSpeed);
    if (last.current !== controller.animation) {
      last.current = controller.animation;
      onAnimationChange?.(controller.animation);
    }
  }, -3);
  return (
    <group
      scale={scale}
      name="stork-character"
      onPointerOver={
        interactive
          ? (event) => {
              event.stopPropagation();
              noticeStorkCursor(controller);
            }
          : undefined
      }
      onClick={
        interactive
          ? (event) => {
              event.stopPropagation();
              reactToStorkTap(controller);
              invalidate();
            }
          : undefined
      }
    >
      <StorkAssetModel
        {...props}
        controller={controller}
        expression={expression}
        lookAt={lookAt ?? commandLook}
        pointTarget={pointTarget ?? commandTarget}
        backpack={backpack}
        quality={level}
        reducedMotion={reduced}
        animationSpeed={animationSpeed}
      />
    </group>
  );
}
