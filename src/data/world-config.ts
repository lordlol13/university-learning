/** Shared tuning for both mascot instances and the learning diorama. */
export const worldConfig = {
  camera: {
    fov: 37,
    near: 0.1,
    far: 120,
    x: 5.2,
    y: 21.5,
    z: 25.5,
    targetX: 0.5,
    targetY: 0.5,
    targetZ: 1.8,
    narrowX: 3.2,
    narrowTargetX: 1.8,
    narrowZoom: 1.25,
    easing: 2.8,
  },
  maxDpr: 1.5,
  assistantMaxDpr: 1.25,
  shadowSize: 1024,
  background: "#7ec8e3",
  mascot: {
    enabled: false,
    scale: 1.38,
    pathOffset: -1.12,
    feetOffset: 0,
    idleHeading: 0.48,
    speed: 0.075,
    arrivalTolerance: 0.00015,
    pointDuration: 1.8,
    introDelay: 1.1,
  },
} as const;

export const storkAnimations = [
  "idle",
  "walk",
  "point",
  "wave",
  "celebrate",
  "thinking",
  "lookAround",
  "blink",
  "pointLeft",
  "pointRight",
  "pointDown",
  "pointAtTarget",
  "happy",
  "jump",
  "confused",
  "encourage",
  "success",
  "sleepy",
] as const;
export const storkTiming = {
  hoverCooldown: 7,
  clickCooldown: 2.5,
  speechCooldown: 12000,
  crossfade: 0.2,
  celebration: 1.9,
  maxQueue: 3,
} as const;

/** Missing clips use Idle; a model without Idle safely holds its rest pose. */
export function resolveStorkClip(
  names: readonly string[],
  animation: (typeof storkAnimations)[number],
) {
  return (
    names.find((name) => name.toLowerCase() === animation.toLowerCase()) ??
    names.find(
      (name) =>
        name.toLowerCase() ===
        (animation.startsWith("point")
          ? "point"
          : animation === "happy" || animation === "jump"
            ? "celebrate"
            : animation === "confused" || animation === "lookAround"
              ? "thinking"
              : animation === "encourage"
                ? "wave"
                : animation
        ).toLowerCase(),
    ) ??
    names.find((name) => name.toLowerCase() === "idle") ??
    null
  );
}
