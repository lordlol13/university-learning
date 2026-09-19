import { MathUtils } from "three";
import { storkDesign as c } from "./stork-config";
import type { StorkAnimation } from "./types";

export class IdleVariation {
  private nextBlink = 3.1;
  private blinkStart = -100;
  private nextLook = 6;
  lookX = 0;
  lookY = 0;
  tilt = 0;
  constructor(private random: () => number = Math.random) {
    this.nextBlink = this.between(c.blinkMin, c.blinkMax);
    this.nextLook = this.between(c.lookMin, c.lookMax);
  }
  private between(min: number, max: number) {
    return min + this.random() * (max - min);
  }
  update(time: number, autoBlink: boolean) {
    if (time >= this.nextBlink) {
      this.blinkStart = time;
      this.nextBlink = time + this.between(c.blinkMin, c.blinkMax);
    }
    if (time >= this.nextLook) {
      this.lookX = this.between(-0.32, 0.32);
      this.lookY = this.between(-0.18, 0.18);
      this.tilt = this.between(-0.055, 0.055);
      this.nextLook = time + this.between(c.lookMin, c.lookMax);
    }
    const phase = (time - this.blinkStart) / c.blinkDuration;
    return autoBlink && phase >= 0 && phase <= 1
      ? Math.sin(phase * Math.PI)
      : 0;
  }
}
export function clampLook(x: number, y: number) {
  return {
    yaw: MathUtils.clamp(x, -c.headYaw, c.headYaw),
    pitch: MathUtils.clamp(y, -c.headPitch, c.headPitch),
  };
}
/** A single takeoff and landing, with a preparatory crouch. No accumulated translation. */
export function jumpEnvelope(time: number, reduced: boolean) {
  if (reduced) return { lift: 0, crouch: 0 };
  const airborne = (time - 0.28) / 0.72;
  const lift =
    airborne > 0 && airborne < 1 ? Math.sin(airborne * Math.PI) * 0.32 : 0;
  const crouch =
    time < 0.28
      ? -0.1 * Math.sin((Math.max(0, time) / 0.28) * Math.PI)
      : time > 1 && time < 1.25
        ? -0.065 * Math.sin(((time - 1) / 0.25) * Math.PI)
        : 0;
  return { lift, crouch };
}
export const isPointing = (animation: StorkAnimation) =>
  animation === "point" || animation.startsWith("point");
