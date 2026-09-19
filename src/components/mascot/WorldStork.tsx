"use client";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3, type Group } from "three";
import { useProgress } from "@/stores/progress-provider";
import { sampleWorldPath } from "@/lib/world-geometry";
import { worldConfig } from "@/data/world-config";
import type { LearningWorldData } from "@/types/learning-world";
import { StorkMascot } from "./StorkMascot";
import {
  StorkAnimationController,
  useStorkController,
} from "./StorkAnimationController";

export function WorldStork({
  curve,
  data,
  reducedMotion,
}: {
  curve: CatmullRomCurve3;
  data: LearningWorldData;
  reducedMotion: boolean;
}) {
  const currentLessonId = useProgress((s) => s.currentLessonId);
  const completed = useProgress((s) => s.completedLessons);
  const lastCompleted = [...data.lessons]
    .reverse()
    .find((item) => completed.includes(item.lessonId));
  const targetT =
    data.lessons.find((item) => item.lessonId === currentLessonId)?.t ??
    lastCompleted?.t ??
    data.lessons[0].t;
  const [initialT] = useState(targetT);
  const progress = useRef(initialT),
    group = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const arrivalSent = useRef(true),
    introTime = useRef(0),
    introduced = useRef(false);
  const point = useRef(new Vector3()),
    tangent = useRef(new Vector3());
  const controller = useStorkController();
  const config = worldConfig.mascot;
  useEffect(() => {
    invalidate();
  }, [targetT, reducedMotion, invalidate]);
  useFrame((_, rawDelta) => {
    if (!group.current) return;
    const delta = Math.min(rawDelta, 0.05);
    introTime.current += delta;
    if (!introduced.current && introTime.current > config.introDelay) {
      controller.request("point", "navigation", config.pointDuration);
      introduced.current = true;
    }
    const difference = targetT - progress.current;
    const moving = Math.abs(difference) > config.arrivalTolerance;
    const walking = moving && (reducedMotion || controller.cause === "idle");
    if (walking) {
      arrivalSent.current = false;
      if (reducedMotion) progress.current = targetT;
      else
        progress.current +=
          Math.sign(difference) *
          Math.min(Math.abs(difference), delta * config.speed);
      controller.setBase(reducedMotion ? "idle" : "walk");
    } else if (!moving) {
      controller.setBase("idle");
      if (!arrivalSent.current) {
        controller.request("point", "navigation", config.pointDuration);
        arrivalSent.current = true;
      }
    }
    sampleWorldPath(curve, progress.current, config.pathOffset, point.current);
    point.current.y += data.roadDepth / 2 - config.feetOffset * config.scale;
    group.current.position.copy(point.current);
    curve.getTangentAt(progress.current, tangent.current);
    const travelAngle = Math.atan2(
      tangent.current.x * Math.sign(difference || 1),
      tangent.current.z * Math.sign(difference || 1),
    );
    // Point toward the actual platform, even on bends where a fixed yaw faces away.
    const nodeAngle = Math.atan2(
      -tangent.current.z * config.pathOffset,
      tangent.current.x * config.pathOffset,
    );
    const desiredAngle =
      walking && !reducedMotion
        ? travelAngle
        : controller.animation === "point" && !reducedMotion
          ? nodeAngle
          : config.idleHeading;
    const shortest = Math.atan2(
      Math.sin(desiredAngle - group.current.rotation.y),
      Math.cos(desiredAngle - group.current.rotation.y),
    );
    group.current.rotation.y +=
      shortest * (reducedMotion ? 1 : 1 - Math.exp(-delta * 5));
    group.current.userData.pathT = progress.current;
    group.current.userData.animation = controller.animation;
  }, -1);
  const initial = sampleWorldPath(curve, initialT, config.pathOffset);
  return (
    <>
      <StorkAnimationController controller={controller} />
      <group
        ref={group}
        position={[
          initial.x,
          initial.y + data.roadDepth / 2 - config.feetOffset * config.scale,
          initial.z,
        ]}
        rotation={[0, config.idleHeading, 0]}
        scale={config.scale}
        name="world-stork"
        onClick={(event) => {
          event.stopPropagation();
          controller.request("wave", "click", 2);
        }}
      >
        <StorkMascot controller={controller} reducedMotion={reducedMotion} />
      </group>
    </>
  );
}
