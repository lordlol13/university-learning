"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { PCFShadowMap, Vector3, type Group } from "three";
import { StorkMascot } from "@/components/mascot/StorkMascot";
import { SceneBoundary } from "@/components/ui/SceneBoundary";
import {
  qualitySettings,
  resolveStorkQuality,
} from "@/components/mascot/stork-config";
import { useSceneActivity } from "@/hooks/use-scene-activity";
import type {
  StorkHandle,
  StorkAnimation,
  StorkExpression,
  StorkQuality,
} from "@/components/mascot/types";
import type { CharacterStats } from "@/components/mascot/StorkDebug";
const Debug =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/components/mascot/StorkDebug"))
    : null;
export const targets = {
  left: new Vector3(-1.7, 1.8, 0.5),
  right: new Vector3(1.7, 1.6, 0.5),
  down: new Vector3(1.3, 0.28, 0.7),
};
export const stageColors = {
  light: "#e9eee1",
  green: "#bdd0a5",
  blue: "#d1e3f5",
};
export interface StageOptions {
  expression: StorkExpression;
  quality: StorkQuality;
  backpack: boolean;
  track: boolean;
  blink: boolean;
  variation: boolean;
  rig: boolean;
  bounds: boolean;
  scale: number;
  rotation: number;
  speed: number;
  light: number;
  background: keyof typeof stageColors;
  target: keyof typeof targets | null;
  reduced: boolean;
  presentation: "small" | "medium" | "hero";
}
interface StageProps {
  options: StageOptions;
  mascot: RefObject<StorkHandle | null>;
  onAnimation: (state: StorkAnimation) => void;
  onStats: (stats: CharacterStats) => void;
  onTarget: (target: keyof typeof targets) => void;
}
function CharacterScene({
  options: o,
  mascot,
  onAnimation,
  onStats,
  onTarget,
}: StageProps) {
  const model = useRef<Group>(null);
  const width = useThree((s) => s.size.width),
    pixelRatio = useThree((s) => s.viewport.initialDpr);
  const setDpr = useThree((s) => s.setDpr),
    gl = useThree((s) => s.gl);
  const quality = resolveStorkQuality(
    o.quality,
    width,
    pixelRatio,
    navigator.hardwareConcurrency,
  );
  const q = qualitySettings[quality];
  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio, q.dpr));
    // WebGLRenderer is an imperative GPU resource, not React state.
    // eslint-disable-next-line react-hooks/immutability
    gl.shadowMap.enabled = q.shadowSize > 0;
    gl.shadowMap.needsUpdate = true;
  }, [setDpr, gl, q]);
  const presentationScale =
    o.presentation === "small" ? 0.38 : o.presentation === "medium" ? 0.72 : 1;
  return (
    <>
      <color attach="background" args={[stageColors[o.background]]} />
      <PerspectiveCamera
        makeDefault
        fov={35}
        position={[2.8, 2.25, 4.8]}
        onUpdate={(camera) => camera.lookAt(0, 1.27, 0)}
      />
      <OrbitControls
        target={[0, 1.27, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.7}
        maxPolarAngle={1.65}
        enableDamping={!o.reduced}
      />
      <ambientLight intensity={0.55 * o.light} />
      <hemisphereLight args={["#fff9ed", "#a5b49e", 0.6 * o.light]} />
      <directionalLight
        key={quality}
        position={[-3, 6, 5]}
        intensity={2.1 * o.light}
        color="#fff2db"
        castShadow={q.shadowSize > 0}
        shadow-mapSize-width={q.shadowSize || 256}
        shadow-mapSize-height={q.shadowSize || 256}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={4}
        shadow-camera-bottom={-3}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-normalBias={0.025}
        shadow-bias={-0.0002}
        shadow-radius={4}
      />
      <directionalLight
        position={[4, 2, 1]}
        intensity={0.7 * o.light}
        color="#d6e6ff"
      />
      <directionalLight
        position={[1, 4, -3]}
        intensity={1.4 * o.light}
        color="#ffffff"
      />
      <mesh position={[0, -0.095, 0]} receiveShadow>
        <cylinderGeometry args={[1.08, 1.13, 0.19, 64]} />
        <meshStandardMaterial color="#d4dfc3" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.192, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial
          color={stageColors[o.background]}
          toneMapped={false}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.1, -0.19, 0.1]}
        scale={[1.7, 1.3, 1]}
      >
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader={
            "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"
          }
          fragmentShader={
            "varying vec2 vUv; void main(){float r=length(vUv*2.0-1.0);gl_FragColor=vec4(0.20,0.27,0.18,(1.0-smoothstep(0.15,1.0,r))*0.15);}"
          }
        />
      </mesh>
      <group ref={model} rotation={[0, (o.rotation * Math.PI) / 180, 0]}>
        <StorkMascot
          ref={mascot}
          expression={o.expression}
          backpack={o.backpack}
          autoBlink={o.blink}
          autoIdleVariation={o.variation}
          lookAt={o.track ? "cursor" : "none"}
          pointTarget={o.target ? targets[o.target] : null}
          interactive
          quality={
            o.presentation === "small" && o.quality === "auto" ? "low" : quality
          }
          scale={o.scale * presentationScale}
          reducedMotion={o.reduced}
          animationSpeed={o.speed}
          onAnimationChange={onAnimation}
        />
      </group>
      {o.target && (
        <group position={targets[o.target]}>
          <mesh>
            <sphereGeometry args={[0.07, 16, 12]} />
            <meshStandardMaterial
              color="#498bdb"
              emissive="#498bdb"
              emissiveIntensity={0.25}
            />
          </mesh>
          <Html center position={[0, 0.2, 0]}>
            <button
              className="studio-target"
              onClick={() => onTarget(o.target!)}
            >
              Next lesson ↗
            </button>
          </Html>
        </group>
      )}
      {Debug && (
        <Debug model={model} rig={o.rig} bounds={o.bounds} onStats={onStats} />
      )}
    </>
  );
}
export default function MascotStage(props: StageProps) {
  const container = useRef<HTMLDivElement>(null),
    active = useSceneActivity(container);
  return (
    <div
      className="studio-canvas"
      ref={container}
      role="img"
      aria-label="Interactive university stork. Use the animation controls, or drag to orbit the camera."
    >
      <SceneBoundary
        fallback={
          <p className="studio-error">
            This device could not start WebGL. Try a browser with hardware
            acceleration enabled.
          </p>
        }
      >
        <Canvas
          shadows={{ type: PCFShadowMap }}
          dpr={[1, 1.5]}
          frameloop={
            active ? (props.options.reduced ? "demand" : "always") : "never"
          }
          gl={{ antialias: true, powerPreference: "low-power" }}
        >
          <CharacterScene {...props} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
