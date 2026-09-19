import type { StorkAnimation, StorkQuality } from "./types";
export const storkDesign = {
  height: 2.52,
  // Anatomical units; normalized to the existing 2.52-unit integration size.
  modelHeight: 3.15,
  bodyHeight: 1.42,
  headHeight: 2.49,
  headOffset: [0, 1.07, 0.12] as const,
  headScale: 0.8,
  torsoLean: (Math.PI * 6) / 180,
  wingScale: [1.22, 1.4, 1.05] as const,
  hipHeight: 1.02,
  headYaw: (Math.PI * 25) / 180,
  headPitch: (Math.PI * 15) / 180,
  eyeTravel: 0.045,
  blinkDuration: 0.18,
  blinkMin: 2.5,
  blinkMax: 6,
  lookMin: 5,
  lookMax: 12,
  poseDamping: 9,
  headDamping: 7,
  targetDelay: 0.22,
} as const;
export const animationDurations: Record<StorkAnimation, number> = {
  idle: Infinity,
  walk: Infinity,
  lookAround: 3,
  blink: 0.4,
  wave: 2.1,
  point: 2.5,
  pointLeft: 2.5,
  pointRight: 2.5,
  pointDown: 2.5,
  pointAtTarget: 2.5,
  happy: 2,
  celebrate: 1.9,
  jump: 1.3,
  thinking: 3.5,
  confused: 2.6,
  encourage: 2.2,
  success: 1.8,
  sleepy: 3.5,
};
export const qualitySettings = {
  low: { segments: 12, rings: 8, dpr: 1, shadowSize: 0 },
  medium: { segments: 18, rings: 12, dpr: 1.5, shadowSize: 512 },
  high: { segments: 24, rings: 16, dpr: 1.75, shadowSize: 1024 },
} as const;
export function resolveStorkQuality(
  quality: StorkQuality,
  width: number,
  dpr: number,
  cores = 8,
): Exclude<StorkQuality, "auto"> {
  if (quality !== "auto") return quality;
  if (width < 220 || cores <= 4) return "low";
  if (width < 600 || dpr > 2) return "medium";
  return "high";
}
