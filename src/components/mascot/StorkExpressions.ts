import type { StorkAnimation, StorkExpression } from "./types";

export const storkExpressions = {
  neutral: { lids: 0.035, jaw: 0.018, brow: 0, pupil: 1, tilt: 0.07 },
  happy: { lids: 0.23, jaw: 0.13, brow: 0.06, pupil: 0.94, tilt: -0.05 },
  curious: { lids: 0, jaw: 0.055, brow: 0.12, pupil: 1.08, tilt: 0.13 },
  excited: { lids: 0, jaw: 0.31, brow: 0.13, pupil: 0.85, tilt: -0.025 },
  thinking: { lids: 0.16, jaw: 0.025, brow: -0.02, pupil: 0.92, tilt: 0.17 },
} as const;
export function expressionForAnimation(
  animation: StorkAnimation,
  selected: StorkExpression,
) {
  if (animation === "celebrate" || animation === "jump") return "excited";
  if (
    animation === "success" ||
    animation === "happy" ||
    animation === "wave" ||
    animation === "encourage"
  )
    return "happy";
  if (animation === "thinking" || animation === "sleepy") return "thinking";
  if (animation === "confused" || animation === "lookAround") return "curious";
  return selected;
}
