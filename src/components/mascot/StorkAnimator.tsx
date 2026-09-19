"use client";
/* The rig contains imperative Three.js joints. Animation changes their transforms,
   never React props/state. React's immutability rule cannot infer this custom rig holder. */
/* eslint-disable react-hooks/immutability */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import {
  IdleVariation,
  clampLook,
  jumpEnvelope,
  isPointing,
} from "./StorkAnimations";
import { expressionForAnimation, storkExpressions } from "./StorkExpressions";
import { storkDesign as c } from "./stork-config";
import type { BoundStorkRig, StorkJoint } from "./StorkRig";
import type { StorkPoseProps } from "./types";

export function StorkAnimator({
  rig,
  controller,
  expression = "neutral",
  reducedMotion = false,
  gaze,
  lookAt = "none",
  pointTarget,
  autoBlink = true,
  autoIdleVariation = true,
  animationSpeed = 1,
}: StorkPoseProps & { rig: BoundStorkRig }) {
  const time = useRef(0),
    variation = useRef<IdleVariation | null>(null),
    target = useRef(new Vector3());
  const tassel = useRef({ position: 0, velocity: 0, priorHead: 0 });
  useFrame(({ camera, pointer }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05),
      dt = delta * animationSpeed;
    time.current += dt;
    variation.current ??= new IdleVariation();
    const idle = variation.current;
    const blink = idle.update(time.current, autoBlink);
    const a = controller.animation,
      t = controller.time,
      clock = time.current;
    const pointing = isPointing(a),
      thinking = a === "thinking",
      celebrating = a === "celebrate" || a === "jump";
    const f = storkExpressions[expressionForAnimation(a, expression)],
      motion = reducedMotion ? 0 : 1;
    const j = rig.joints.current;
    if (!j.root) return;
    const rotate = (
      name: StorkJoint,
      axis: "x" | "y" | "z",
      value: number,
      damping: number = c.poseDamping,
    ) => {
      const joint = j[name];
      if (joint)
        joint.rotation[axis] = MathUtils.damp(
          joint.rotation[axis],
          value,
          damping,
          delta,
        );
    };
    let yaw = autoIdleVariation ? idle.lookX * 0.3 : 0,
      pitch = autoIdleVariation ? idle.lookY * 0.3 : 0;
    if (gaze || lookAt === "cursor") {
      // Attention waxes and wanes; pointer movement never drives the entire character.
      const attention = 0.55 + Math.sin(clock * 0.45) * 0.15;
      yaw += (gaze?.current.x ?? pointer.x) * c.headYaw * attention;
      pitch += (gaze ? gaze.current.y : -pointer.y) * c.headPitch * attention;
    }
    const worldTarget =
      pointing && pointTarget
        ? pointTarget
        : typeof lookAt === "object"
          ? lookAt
          : lookAt === "camera"
            ? camera.position
            : null;
    if (worldTarget) {
      // Convert a world-space target into character coordinates; parent rotation/scale stays intact.
      j.root.updateWorldMatrix(true, false);
      target.current.copy(worldTarget);
      j.root.worldToLocal(target.current);
      target.current.y -= c.headHeight;
      yaw = Math.atan2(target.current.x, Math.max(0.15, target.current.z));
      pitch = -Math.atan2(
        target.current.y,
        Math.hypot(target.current.x, target.current.z),
      );
    }
    if (a === "pointLeft") yaw = -0.8;
    if (a === "pointRight") yaw = 0.8;
    if (a === "pointDown") pitch = 0.7;
    if (a === "lookAround") yaw += Math.sin(t * 2) * 0.4;
    if (thinking) {
      yaw = -0.16;
      pitch = -0.22;
    }
    const look = clampLook(yaw, pitch);
    rotate("head", "y", look.yaw, c.headDamping);
    rotate(
      "head",
      "x",
      look.pitch + (a === "success" ? Math.sin(t * 8) * 0.085 * motion : 0),
      c.headDamping,
    );
    rotate(
      "head",
      "z",
      f.tilt +
        (autoIdleVariation ? idle.tilt * motion : 0) +
        (a === "confused" ? Math.sin(t * 3) * 0.09 * motion : 0),
    );
    rotate("chest", "y", pointing ? MathUtils.clamp(yaw * 0.12, -0.1, 0.1) : 0);
    rotate("neck_01", "z", a === "encourage" ? -0.04 : 0);
    rotate("neck_02", "x", a === "sleepy" ? 0.12 : 0);
    const manualBlink =
      a === "blink" ? Math.sin(Math.min(1, t / 0.22) * Math.PI) : 0;
    const closure = Math.max(blink, manualBlink, a === "sleepy" ? 0.7 : f.lids);
    for (const side of ["left", "right"] as const) {
      const eye = j[`eye_${side}`];
      if (eye) {
        eye.position.x = MathUtils.damp(
          eye.position.x,
          MathUtils.clamp(yaw * 0.095, -c.eyeTravel, c.eyeTravel),
          10,
          delta,
        );
        eye.position.y = MathUtils.damp(
          eye.position.y,
          MathUtils.clamp(-pitch * 0.12, -0.035, 0.035),
          10,
          delta,
        );
        eye.scale.y = MathUtils.damp(eye.scale.y, f.pupil, 9, delta);
      }
      rotate(
        `eyelid_${side}`,
        "x",
        -1.48 + closure * 3.05,
        closure > 0.5 ? 42 : 25,
      );
      const brow = j[`brow_${side}`];
      if (brow)
        brow.position.y = MathUtils.damp(
          brow.position.y,
          0.246 + f.brow * 0.25,
          8,
          delta,
        );
      rotate(
        `brow_${side}`,
        "z",
        (side === "left" ? -1 : 1) *
          (expression === "curious" ? 0.19 : -f.brow),
      );
    }
    rotate(
      "beak_lower",
      "x",
      f.jaw +
        (a === "encourage" || a === "wave"
          ? Math.max(0, Math.sin(t * 8)) * 0.065 * motion
          : 0),
    );
    let left = -0.28,
      right = 0.48,
      bendLeft = 0,
      bendRight = 0,
      forwardLeft = -0.09,
      forwardRight = -0.14;
    if (a === "wave") {
      right = 1.85 + Math.sin(t * 9) * 0.2 * motion;
      bendRight = 0.38;
    }
    if (celebrating || a === "happy") {
      left = -1.55;
      right = 1.55;
      bendLeft = -0.18;
      bendRight = 0.18;
    }
    if (a === "success") {
      left = -0.62;
      right = 0.72;
    }
    if (a === "encourage") {
      left = -0.3;
      right = 0.85 + Math.sin(t * 4) * 0.1 * motion;
      forwardRight = -0.32;
    }
    if (thinking) {
      right = -0.25;
      bendRight = 1.0;
      forwardRight = -2.4;
    }
    if (a === "confused") {
      left = -0.5;
      right = 0.6;
    }
    if (pointing && (t > c.targetDelay || reducedMotion)) {
      const direction = yaw < 0 ? -1 : 1;
      const elevation = MathUtils.clamp(-pitch, -0.65, 0.65);
      if (direction < 0) {
        left = -(1.25 + elevation);
        forwardLeft = -0.38;
      } else {
        right = 1.25 + elevation;
        forwardRight = -0.38;
      }
    }
    if (a === "walk") {
      forwardLeft = Math.sin(clock * 9) * 0.18;
      forwardRight = -forwardLeft;
    }
    rotate("wing_L_shoulder", "z", left);
    rotate("wing_R_shoulder", "z", right);
    rotate("wing_L_shoulder", "x", forwardLeft);
    rotate("wing_R_shoulder", "x", forwardRight);
    rotate("wing_L_mid", "z", bendLeft);
    rotate("wing_R_mid", "z", bendRight);
    rotate("wing_L_tip", "x", celebrating ? -0.22 : 0);
    rotate(
      "wing_R_tip",
      "x",
      a === "wave" ? Math.sin(t * 9) * 0.15 * motion : 0,
    );
    const jump = celebrating
      ? jumpEnvelope(t, reducedMotion)
      : { lift: 0, crouch: 0 };
    j.root.position.y = jump.lift;
    if (j.body) {
      j.body.position.y =
        c.bodyHeight +
        jump.crouch +
        (autoIdleVariation ? Math.sin(clock * 2.1) * 0.009 * motion : 0);
      j.body.scale.y =
        1 +
        jump.crouch * 0.25 +
        (autoIdleVariation ? Math.sin(clock * 2.1) * 0.006 * motion : 0);
    }
    const step = a === "walk" ? Math.sin(clock * 9) * 0.3 * motion : 0;
    rotate("leg_L_upper", "x", step - 0.07);
    rotate("leg_R_upper", "x", -step);
    rotate("leg_L_lower", "x", Math.max(0, -step) * 0.5 + 0.14);
    rotate("leg_R_lower", "x", Math.max(0, step) * 0.5);
    rotate("foot_L", "x", -step * 0.4 - 0.07);
    rotate("foot_R", "x", step * 0.4);
    rotate(
      "body",
      "z",
      autoIdleVariation ? Math.sin(clock * 0.7) * 0.013 * motion : 0,
    );
    rotate(
      "tail",
      "y",
      autoIdleVariation ? Math.sin(clock * 1.2) * 0.055 * motion : 0,
    );
    // A damped spring adds secondary tassel motion without cloth or physics engines.
    const spring = tassel.current,
      headYaw = j.head?.rotation.y ?? 0;
    const impulse =
      (headYaw - spring.priorHead) * -7 + jump.lift * Math.sin(t * 10) * 0.7;
    spring.priorHead = headYaw;
    spring.velocity +=
      (impulse - spring.position * 25 - spring.velocity * 7) * delta;
    spring.position = MathUtils.clamp(
      spring.position + spring.velocity * delta,
      -0.35,
      0.35,
    );
    rotate(
      "tassel_01",
      "z",
      spring.position * motion + Math.sin(clock * 1.5) * 0.018 * motion,
    );
    rotate("tassel_02", "z", -spring.position * 0.65 * motion);
  }, -1);
  return null;
}
