"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  Sparkles,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion";
import { useProgress } from "@/stores/progress-provider";
import { getLessonStatus } from "@/stores/progress-store";
import { useSceneActivity } from "@/hooks/use-scene-activity";
import { SceneBoundary } from "@/components/ui/SceneBoundary";
import { TrackLandmark } from "./Landmarks";
import type { LearningWorldData } from "@/types/learning-world";
import type { Lesson, LessonStatus } from "@/types/curriculum";

const LIME = "#e9dcc2";
const LIME_DARK = "#cdb894";
const GRASS = "#8fbf5a";
const GRASS_2 = "#a8cf6a";
const SAND = "#f2dcae";
const GOLD = "#e0b04a";
const STONE = "#a39d92";

export const TRACK_THEMES: Record<
  string,
  { color: string; accent: string; biome: string; short: string }
> = {
  "ai-ml": {
    color: "#10b981",
    accent: "#22d3ee",
    biome: "Emerald Sanctuary",
    short: "AI & ML",
  },
  "physics-engineering": {
    color: "#f59e0b",
    accent: "#2f5bd3",
    biome: "Kinetic Highlands",
    short: "Physics",
  },
  mathematics: {
    color: "#8b5cf6",
    accent: "#e8b931",
    biome: "Golden Acropolis",
    short: "Math",
  },
  "italian-language": {
    color: "#d4673a",
    accent: "#1f9e9a",
    biome: "Terracotta Riviera",
    short: "Italiano",
  },
};

const LANDMARK_POS: [number, number, number] = [-0.6, 2.2, 0.4];

export function getMilestonePositions(count: number): [number, number, number][] {
  const n = Math.max(1, count);
  const step = n > 1 ? 150 / (n - 1) : 0;
  return Array.from({ length: n }, (_, i) => {
    const th = THREE.MathUtils.degToRad(165 - i * step);
    const r = i % 2 ? 7.9 : 9.0;
    return [Math.cos(th) * r, 1.0, Math.sin(th) * r];
  });
}

function Tier({
  r,
  h,
  y,
  x = 0,
  z = 0,
  seg = 9,
  grass = GRASS,
}: {
  r: number;
  h: number;
  y: number;
  x?: number;
  z?: number;
  seg?: number;
  grass?: string;
}) {
  return (
    <group position={[x, y, z]}>
      <mesh position-y={-h / 2} castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 0.93, h, seg]} />
        <meshStandardMaterial color={LIME} roughness={0.9} flatShading />
      </mesh>
      <mesh position-y={-h * 0.72}>
        <cylinderGeometry args={[r * 0.95, r * 0.9, h * 0.08, seg]} />
        <meshStandardMaterial color={LIME_DARK} roughness={1} flatShading />
      </mesh>
      <mesh position-y={0.06} receiveShadow>
        <cylinderGeometry args={[r + 0.08, r + 0.02, 0.22, seg]} />
        <meshStandardMaterial color={grass} roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { geo, base } = useMemo(() => {
    const g = new THREE.PlaneGeometry(110, 110, 72, 72);
    const b = Float32Array.from(g.attributes.position.array);
    return { geo: g, base: b };
  }, []);
  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const g = mesh.geometry;
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      p.setZ(
        i,
        Math.sin(x * 0.32 + t * 0.9) * 0.12 +
          Math.cos(y * 0.27 + t * 0.7) * 0.12,
      );
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
  });
  return (
    <mesh
      ref={meshRef}
      geometry={geo}
      rotation-x={-Math.PI / 2}
      position-y={-0.25}
      receiveShadow
    >
      <meshPhysicalMaterial
        color="#29c3c8"
        transparent
        opacity={0.84}
        roughness={0.1}
        metalness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.2}
      />
    </mesh>
  );
}

function Foam() {
  const rings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    rings.current?.children.forEach((m, i) => {
      const k = (clock.elapsedTime * 0.25 + i / 3) % 1;
      m.scale.setScalar(1 + k * 0.18);
      ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
        0.55 * (1 - k);
    });
  });
  return (
    <group ref={rings} position-y={-0.12}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[12.4, 12.75, 9]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function prng(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function Waterfall() {
  const fallRef = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#6fe0ee";
    g.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + prng(i * 5 + 1) * 0.6})`;
      g.fillRect(
        prng(i * 5 + 2) * 64,
        prng(i * 5 + 3) * 256,
        1 + prng(i * 5 + 4) * 4,
        20 + prng(i * 5 + 5) * 60,
      );
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useFrame((_, d) => {
    const mat = fallRef.current?.material as THREE.MeshStandardMaterial | undefined;
    if (mat?.map) mat.map.offset.y += d * 0.9;
  });
  return (
    <group>
      <mesh ref={fallRef} position={[4, 3.5, -0.95]} rotation-x={-0.3}>
        <planeGeometry args={[0.9, 2.75]} />
        <meshStandardMaterial
          map={tex}
          transparent
          opacity={0.92}
          emissive="#5fd8e8"
          emissiveIntensity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[4, 2.29, 0.15]}>
        <cylinderGeometry args={[1.15, 1.15, 0.06, 24]} />
        <meshStandardMaterial
          color="#4fe3e0"
          emissive="#3fd6d6"
          emissiveIntensity={0.9}
          transparent
          opacity={0.9}
          roughness={0.05}
        />
      </mesh>
      <mesh position={[4, 2.27, 0.15]}>
        <torusGeometry args={[1.2, 0.12, 6, 24]} />
        <meshStandardMaterial color="#d8d2c6" flatShading />
      </mesh>
      <Sparkles
        position={[4, 2.6, 0.1]}
        count={18}
        scale={[1.6, 0.8, 1.6]}
        size={3}
        speed={0.6}
        color="#bffaff"
      />
    </group>
  );
}

function Pine({ p, s = 1 }: { p: [number, number, number]; s?: number }) {
  return (
    <group position={p} scale={s}>
      <mesh position-y={0.25} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.5, 6]} />
        <meshStandardMaterial color="#7a5232" />
      </mesh>
      <mesh position-y={0.8} castShadow>
        <coneGeometry args={[0.5, 0.9, 7]} />
        <meshStandardMaterial color="#3f7a45" flatShading />
      </mesh>
      <mesh position-y={1.3} castShadow>
        <coneGeometry args={[0.36, 0.7, 7]} />
        <meshStandardMaterial color="#4f9150" flatShading />
      </mesh>
    </group>
  );
}

function Blossom({ p, s = 1 }: { p: [number, number, number]; s?: number }) {
  return (
    <group position={p} scale={s}>
      <mesh position-y={0.35} castShadow>
        <cylinderGeometry args={[0.07, 0.11, 0.7, 6]} />
        <meshStandardMaterial color="#7a5232" />
      </mesh>
      {[
        [0, 0.95, 0, 0.45],
        [0.3, 0.8, 0.1, 0.32],
        [-0.28, 0.82, -0.08, 0.3],
        [0.05, 1.2, -0.15, 0.3],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial
            color={i % 2 ? "#f7b6c8" : "#f39ab4"}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

function Bench({ p, r = 0 }: { p: [number, number, number]; r?: number }) {
  return (
    <group position={p} rotation-y={r}>
      <mesh position-y={0.28} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.3]} />
        <meshStandardMaterial color="#cfc6b6" />
      </mesh>
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.13, 0]} castShadow>
          <boxGeometry args={[0.1, 0.26, 0.26]} />
          <meshStandardMaterial color={STONE} />
        </mesh>
      ))}
    </group>
  );
}

function Clouds() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.02;
  });
  const clouds: [number, number, number, number][] = [
    [-14, 8, -10, 1.4],
    [15, 9, -6, 1.1],
    [8, 10, -16, 1.6],
    [-10, 7.5, 12, 0.9],
    [18, 7, 10, 1.2],
  ];
  return (
    <group ref={ref}>
      {clouds.map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]} scale={s}>
          {[
            [0, 0, 0, 1],
            [1, -0.2, 0.2, 0.75],
            [-1, -0.25, 0, 0.7],
            [0.4, 0.4, -0.2, 0.7],
          ].map(([cx, cy, cz, r], j) => (
            <mesh key={j} position={[cx, cy, cz]}>
              <icosahedronGeometry args={[r, 1]} />
              <meshStandardMaterial
                color="#ffffff"
                flatShading
                roughness={1}
                emissive="#fff3e0"
                emissiveIntensity={0.25}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Path({
  accent,
  positions,
}: {
  accent: string;
  positions: [number, number, number][];
}) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          [-10.4, 0, 0.6] as [number, number, number],
          ...positions,
          [10.4, 0, 0.6] as [number, number, number],
        ].map((p) => new THREE.Vector3(p[0], 0, p[2])),
      ),
    [positions],
  );
  const tube = useMemo(
    () => new THREE.TubeGeometry(curve, 160, 0.5, 6, false),
    [curve],
  );
  const pulse = useRef<THREE.Mesh>(null);
  const stones = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const p = curve.getPointAt(i / 70);
        return [
          p.x + Math.sin(i * 7.1) * 0.22,
          p.z + Math.cos(i * 3.7) * 0.22,
          0.12 + (i % 3) * 0.03,
        ] as const;
      }),
    [curve],
  );
  useFrame(({ clock }) => {
    if (!pulse.current) return;
    const t = 0.06 + ((clock.elapsedTime * 0.09) % 1) * 0.88;
    const p = curve.getPointAt(t);
    pulse.current.position.set(p.x, 1.22, p.z);
    pulse.current.scale.setScalar(0.9 + Math.sin(clock.elapsedTime * 8) * 0.15);
  });
  return (
    <group>
      <group position-y={1.0} scale={[1, 0.18, 1]}>
        <mesh geometry={tube} receiveShadow>
          <meshStandardMaterial color="#d8ccb4" roughness={0.95} flatShading />
        </mesh>
      </group>
      {stones.map(([x, z, r], i) => (
        <mesh key={i} position={[x, 1.08, z]} rotation-y={i}>
          <cylinderGeometry args={[r, r, 0.05, 6]} />
          <meshStandardMaterial color={i % 2 ? "#c2b59c" : "#b3a68e"} />
        </mesh>
      ))}
      <mesh ref={pulse}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
        <pointLight color={accent} intensity={4} distance={3} />
      </mesh>
    </group>
  );
}

function Node({
  i,
  position,
  lesson,
  status,
  color,
  accent,
  selected,
  showPin,
  onSelect,
}: {
  i: number;
  position: [number, number, number];
  lesson: Lesson;
  status: LessonStatus;
  color: string;
  accent: string;
  selected: boolean;
  showPin: boolean;
  onSelect: (id: string) => void;
}) {
  const spin = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const state =
    status === "completed"
      ? "completed"
      : status === "current"
        ? "active"
        : "locked";

  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime;
    if (spin.current) {
      spin.current.rotation.y += d * 1.6;
      spin.current.position.y = 1.35 + Math.sin(t * 2 + i) * 0.12;
    }
    if (beam.current)
      (beam.current.material as THREE.MeshBasicMaterial).opacity =
        0.22 + Math.sin(t * 3) * 0.1;
    if (ring.current)
      ring.current.scale.setScalar(1 + Math.sin(t * 4) * 0.05);
  });

  const top =
    state === "completed" ? GOLD : state === "active" ? accent : STONE;

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(lesson.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh position-y={0.2} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.9, 0.4, 8]} />
        <meshStandardMaterial
          color={state === "locked" ? "#bdb6aa" : LIME}
          roughness={0.8}
          flatShading
        />
      </mesh>
      <mesh position-y={0.42}>
        <cylinderGeometry args={[0.64, 0.64, 0.06, 32]} />
        <meshStandardMaterial
          color={top}
          metalness={state === "completed" ? 0.7 : 0.1}
          roughness={0.3}
          emissive={state === "active" ? accent : "#000000"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {state === "completed" && (
        <>
          <mesh position-y={0.46} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.75, 0.07, 10, 40]} />
            <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} />
          </mesh>
          <group ref={spin}>
            <mesh castShadow>
              <octahedronGeometry args={[0.3]} />
              <meshStandardMaterial
                color={GOLD}
                emissive={GOLD}
                emissiveIntensity={0.6}
                metalness={0.6}
                roughness={0.2}
                flatShading
              />
            </mesh>
            <mesh scale={0.55}>
              <octahedronGeometry args={[0.3]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
          </group>
        </>
      )}

      {state === "active" && (
        <>
          <mesh ref={beam} position-y={2.1}>
            <cylinderGeometry args={[0.38, 0.5, 3.4, 24, 1, true]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.25}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <group ref={spin}>
            <mesh castShadow scale={[1, 1.6, 1]}>
              <octahedronGeometry args={[0.3]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={1.3}
                toneMapped={false}
                flatShading
              />
            </mesh>
          </group>
          <pointLight
            position-y={1.4}
            color={accent}
            intensity={6}
            distance={4}
          />
        </>
      )}

      {state === "locked" && (
        <group position-y={0.72}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.34, 0.22]} />
            <meshStandardMaterial
              color="#6f6a62"
              metalness={0.4}
              roughness={0.5}
            />
          </mesh>
          <mesh position-y={0.17}>
            <torusGeometry args={[0.13, 0.04, 8, 16, Math.PI]} />
            <meshStandardMaterial
              color="#8e887d"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, -0.02, 0.115]}>
            <circleGeometry args={[0.04, 12]} />
            <meshBasicMaterial color="#2a2722" />
          </mesh>
        </group>
      )}

      {selected && (
        <mesh ref={ring} position-y={0.03} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.05, 1.18, 48]} />
          <meshBasicMaterial
            color={accent}
            toneMapped={false}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {(showPin || selected || state === "active") && (
        <Html
          position={[0, state === "active" ? 4.1 : 2.1, 0]}
          center
          distanceFactor={16}
          zIndexRange={[20, 0]}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(lesson.id);
            }}
            className={`map-pin ${selected ? "map-pin-selected" : ""}`}
            data-state={state}
          >
            {state === "active" ? (
              <span className="map-pin-tag">Up next</span>
            ) : null}
            <span className="map-pin-title">
              {i + 1}. {lesson.title}
            </span>
          </button>
        </Html>
      )}
    </group>
  );
}

function CameraRig({
  target,
  nonce,
}: {
  target: [number, number, number];
  nonce: number;
}) {
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const camera = useThree((s) => s.camera);
  const flying = useRef(true);
  const [tx, ty, tz] = target;
  const goal = useMemo(
    () => new THREE.Vector3(tx, ty, tz),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tx, ty, tz, nonce],
  );
  const camGoal = useMemo(() => {
    const dir = new THREE.Vector3(goal.x, 0, goal.z).normalize();
    if (!Number.isFinite(dir.x)) dir.set(0, 0, 1);
    return goal.clone().add(new THREE.Vector3(dir.x * 6, 7, dir.z * 6 + 7));
  }, [goal]);

  useEffect(() => {
    flying.current = true;
  }, [goal]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => {
      flying.current = false;
    };
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [controls]);

  useFrame((_, raw) => {
    if (!flying.current || !controls) return;
    const dt = Math.min(raw, 0.05);
    const k = 1 - Math.exp(-2.6 * dt);
    controls.target.lerp(goal, k);
    camera.position.lerp(camGoal, k);
    controls.update();
    if (camera.position.distanceTo(camGoal) < 0.03) flying.current = false;
  });
  return null;
}

export default function WorldCanvas({
  data,
  lessons,
  selectedId,
  onSelect,
  paused = false,
  showAllLabels = false,
  flyNonce = 0,
}: {
  data: LearningWorldData;
  lessons: Lesson[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  paused?: boolean;
  showAllLabels?: boolean;
  flyNonce?: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const active = useSceneActivity(container);
  const reducedMotion = useReducedMotionPreference();
  const completedLessons = useProgress((s) => s.completedLessons);
  const unlockedLessons = useProgress((s) => s.unlockedLessons);

  const theme = TRACK_THEMES[data.directionId] ?? TRACK_THEMES["ai-ml"];
  const positions = useMemo(
    () => getMilestonePositions(lessons.length),
    [lessons.length],
  );
  const selectedIndex = Math.max(
    0,
    lessons.findIndex((l) => l.id === selectedId),
  );
  const p = positions[selectedIndex] ?? positions[0] ?? [0, 1, 0];
  const target: [number, number, number] = [p[0] * 0.6, 1.2, p[2] * 0.6];

  return (
    <div
      ref={container}
      className="world-canvas"
      data-testid="learning-world-canvas"
    >
      <SceneBoundary
        fallback={
          <div className="world-unavailable" role="status">
            3D is unavailable. Choose “List” above to keep learning.
          </div>
        }
      >
        <Canvas
          shadows
          dpr={[1, 1.75]}
          frameloop={
            active && !paused ? (reducedMotion ? "demand" : "always") : "never"
          }
          camera={{ position: [0, 16, 24], fov: 42 }}
          gl={{ alpha: true, antialias: true }}
          fallback={
            <div className="world-unavailable">
              Interactive 3D campus. The lesson list provides text navigation.
            </div>
          }
        >
          <fog attach="fog" args={["#f6d7b0", 38, 95]} />
          <hemisphereLight args={["#fff1d6", "#5aa7a8", 0.7]} />
          <directionalLight
            position={[14, 18, 8]}
            intensity={2.4}
            color="#ffd9a3"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-16}
            shadow-camera-right={16}
            shadow-camera-top={16}
            shadow-camera-bottom={-16}
            shadow-bias={-0.0005}
          />
          <Environment resolution={64}>
            <Lightformer
              intensity={2}
              position={[0, 6, 0]}
              scale={[12, 12, 1]}
              rotation-x={Math.PI / 2}
              color="#fff4e0"
            />
            <Lightformer
              intensity={1.2}
              color="#9fe3e6"
              position={[-6, 2, -2]}
              rotation-y={Math.PI / 2}
              scale={[20, 2, 1]}
            />
            <Lightformer
              intensity={1.5}
              color="#ffc685"
              position={[6, 2, 2]}
              rotation-y={-Math.PI / 2}
              scale={[20, 2, 1]}
            />
          </Environment>

          <group>
            <mesh position-y={-4.6}>
              <cylinderGeometry args={[10.6, 2.2, 6.6, 9]} />
              <meshStandardMaterial
                color={LIME_DARK}
                flatShading
                roughness={1}
              />
            </mesh>
            <mesh position-y={-0.32} receiveShadow>
              <cylinderGeometry args={[12.3, 12.9, 0.6, 9]} />
              <meshStandardMaterial color={SAND} roughness={1} flatShading />
            </mesh>
            <Tier r={11} h={2.4} y={1} />
            <Tier r={5.6} h={1.3} y={2.2} grass={GRASS_2} seg={8} />
            <Tier r={2.3} h={2.6} y={4.8} x={4} z={-3} seg={7} />
            <mesh position={[4, 5.6, -3.3]} castShadow>
              <coneGeometry args={[1.7, 1.8, 7]} />
              <meshStandardMaterial color={LIME} flatShading />
            </mesh>
            <mesh position={[4, 6.3, -3.3]}>
              <coneGeometry args={[0.7, 0.6, 7]} />
              <meshStandardMaterial color="#fffaf0" flatShading />
            </mesh>
          </group>

          <Ocean />
          <Foam />
          <Waterfall />
          <Clouds />
          <Sparkles
            count={70}
            scale={[22, 5, 22]}
            position-y={3}
            size={4}
            speed={0.35}
            color="#ffd88a"
          />

          {(
            [
              [-5, 1, -8, 1.1],
              [-7.5, 1, -6, 0.9],
              [7.8, 1, -6.8, 1.2],
              [9.6, 1, -3, 0.8],
              [-9.8, 1, -2.8, 1],
              [2, 2.2, -4.6, 0.8],
              [-3.4, 2.2, -3.8, 0.9],
              [5.4, 4.8, -3.6, 0.6],
            ] as const
          ).map(([x, y, z, s], i) => (
            <Pine key={i} p={[x, y, z]} s={s} />
          ))}
          {(
            [
              [-2, 1, -9.6, 1],
              [3.6, 1, -9.3, 0.9],
              [-4.4, 2.2, 1.6, 0.7],
              [3.2, 2.2, 3.4, 0.75],
              [10.3, 1, 1.5, 0.7],
            ] as const
          ).map(([x, y, z, s], i) => (
            <Blossom key={i} p={[x, y, z]} s={s} />
          ))}
          <Bench p={[0, 1, 10.1]} />
          <Bench p={[-5.6, 1, 7.6]} r={0.6} />
          <Bench p={[1.5, 2.2, 4.4]} r={-0.2} />

          <group position={LANDMARK_POS}>
            <TrackLandmark
              directionId={data.directionId}
              color={theme.color}
              accent={theme.accent}
            />
          </group>

          <Path accent={theme.accent} positions={positions} />
          {lessons.map((lesson, i) => (
            <Node
              key={lesson.id}
              i={i}
              position={positions[i]}
              lesson={lesson}
              status={getLessonStatus(lesson, {
                completedLessons,
                unlockedLessons,
              })}
              color={theme.color}
              accent={theme.accent}
              selected={lesson.id === selectedId}
              showPin={showAllLabels}
              onSelect={onSelect}
            />
          ))}

          <OrbitControls
            makeDefault
            enablePan={false}
            minDistance={8}
            maxDistance={40}
            maxPolarAngle={Math.PI / 2.25}
            enableDamping
          />
          <CameraRig target={target} nonce={flyNonce} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
