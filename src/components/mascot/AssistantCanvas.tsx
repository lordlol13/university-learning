"use client";
import { Suspense, useRef, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useSceneActivity } from "@/hooks/use-scene-activity";
import { worldConfig } from "@/data/world-config";
import { SceneBoundary } from "@/components/ui/SceneBoundary";
import type { StorkController } from "@/lib/stork-controller";
import { StorkMascot } from "./StorkMascot";
import { StorkAnimationController } from "./StorkAnimationController";

export default function AssistantCanvas({
  controller,
  gaze,
  reducedMotion,
}: {
  controller: StorkController;
  gaze: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const active = useSceneActivity(container);
  return (
    <div ref={container} className="assistant-canvas" aria-hidden="true">
      <SceneBoundary
        fallback={
          <span className="assistant-fallback">Your campus companion</span>
        }
      >
        <Canvas
          dpr={[1, worldConfig.assistantMaxDpr]}
          frameloop={active ? (reducedMotion ? "demand" : "always") : "never"}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          fallback={
            <span className="assistant-fallback">Your campus companion</span>
          }
        >
          <PerspectiveCamera
            makeDefault
            position={[0.45, 1.9, 5.9]}
            fov={30}
            onUpdate={(camera) => camera.lookAt(0, 1.15, 0)}
          />
          <ambientLight intensity={1.3} />
          <directionalLight
            position={[-3, 5, 4]}
            intensity={2.5}
            color="#fff4dc"
          />
          <directionalLight
            position={[3, 1, -2]}
            intensity={1}
            color="#d4e9ff"
          />
          <StorkAnimationController controller={controller} />
          <Suspense fallback={null}>
            <group rotation={[0, 0.48, 0]}>
              <StorkMascot
                controller={controller}
                gaze={gaze}
                reducedMotion={reducedMotion}
              />
            </group>
          </Suspense>
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
