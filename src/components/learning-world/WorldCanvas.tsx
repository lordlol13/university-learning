"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { PCFShadowMap } from "three";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion";
import { worldConfig } from "@/data/world-config";
import { useProgress } from "@/stores/progress-provider";
import { getLessonStatus } from "@/stores/progress-store";
import { createWorldCurve } from "@/lib/world-geometry";
import { useSceneActivity } from "@/hooks/use-scene-activity";
import { WorldStork } from "@/components/mascot/WorldStork";
import { SceneBoundary } from "@/components/ui/SceneBoundary";
import { Environment } from "./Environment";
import { CameraController } from "./CameraController";
import { Road } from "./Road";
import { LessonPlatform } from "./LessonPlatform";
import type { LearningWorldData, Point3 } from "@/types/learning-world";
import type { Lesson } from "@/types/curriculum";

export default function WorldCanvas({
  data,
  lessons,
  selectedId,
  onSelect,
  paused = false,
}: {
  data: LearningWorldData;
  lessons: Lesson[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  paused?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const active = useSceneActivity(container);
  const reducedMotion = useReducedMotionPreference();
  const completedLessons = useProgress((s) => s.completedLessons);
  const unlockedLessons = useProgress((s) => s.unlockedLessons);
  const curve = useMemo(() => createWorldCurve(data), [data]);
  const positions = useMemo(
    () =>
      data.lessons.map((item) => curve.getPointAt(item.t).toArray() as Point3),
    [curve, data],
  );
  return (
    <div
      ref={container}
      className="world-canvas"
      data-testid="learning-world-canvas"
    >
      <SceneBoundary
        fallback={
          <div className="world-unavailable" role="status">
            3D is unavailable. Choose “Lesson list” above to keep learning.
          </div>
        }
      >
        <Canvas
          shadows={{ type: PCFShadowMap }}
          dpr={[1, worldConfig.maxDpr]}
          frameloop={
            active && !paused ? (reducedMotion ? "demand" : "always") : "never"
          }
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          fallback={
            <div className="world-unavailable">
              Interactive 3D campus. The lesson list provides text navigation.
            </div>
          }
        >
          <color attach="background" args={[worldConfig.background]} />
          <PerspectiveCamera
            makeDefault
            position={[
              worldConfig.camera.x,
              worldConfig.camera.y,
              worldConfig.camera.z,
            ]}
            fov={worldConfig.camera.fov}
            near={worldConfig.camera.near}
            far={worldConfig.camera.far}
          />
          <CameraController reducedMotion={reducedMotion} />
          <Suspense fallback={null}>
            <Environment data={data} reducedMotion={reducedMotion} />
            <Road curve={curve} data={data} />
            {data.lessons.map((placement, index) => {
              const lesson = lessons.find(
                (item) => item.id === placement.lessonId,
              );
              return lesson ? (
                <LessonPlatform
                  key={lesson.id}
                  lesson={lesson}
                  status={getLessonStatus(lesson, {
                    completedLessons,
                    unlockedLessons,
                  })}
                  index={index}
                  position={positions[index]}
                  selected={selectedId === lesson.id}
                  reducedMotion={reducedMotion}
                  onSelect={onSelect}
                />
              ) : null;
            })}
            {worldConfig.mascot.enabled && (
              <WorldStork
                curve={curve}
                data={data}
                reducedMotion={reducedMotion}
              />
            )}
          </Suspense>
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
