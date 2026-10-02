"use client";

import { useRef, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Check, LockKeyhole, Play, Star } from "lucide-react";
import { MathUtils, type Group, type Mesh } from "three";
import type { Lesson, LessonStatus } from "@/types/curriculum";
import type { Point3 } from "@/types/learning-world";

// ============================================================================
// 1. DISTINCT HIGH-FIDELITY SUBJECT 3D SYMBOLS
// ============================================================================

function PlatformSymbol({
  lesson,
  status,
}: {
  lesson: Lesson;
  status: LessonStatus;
}) {
  const isLocked = status === "locked";
  const symbolColor = isLocked ? "#94a3b8" : "#ffffff";
  const accentColor = isLocked ? "#64748b" : "#38bdf8";

  // Locked: Heavy carved padlock with prominent gleaming brass face & keyhole
  if (isLocked) {
    return (
      <group position={[0, 0.72, 0]} name="symbol-locked">
        {/* Heavy Polished Chrome Shackle Arch */}
        <mesh position={[0, 0.28, 0]}>
          <torusGeometry args={[0.22, 0.055, 12, 28, Math.PI]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.92} roughness={0.18} />
        </mesh>
        {/* Solid Brass Lock Body with Golden Luster */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.58, 0.46, 0.24]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#b45309"
            emissiveIntensity={0.25}
            roughness={0.25}
            metalness={0.85}
          />
        </mesh>
        {/* Dark Obsidian Base Rim */}
        <mesh position={[0, -0.16, 0]} castShadow>
          <boxGeometry args={[0.62, 0.06, 0.26]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Front Keyhole Escutcheon Plate */}
        <mesh position={[0, 0.06, 0.122]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.015, 20]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Front High-Contrast Keyhole Cutout */}
        <mesh position={[0, 0.085, 0.132]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        <mesh position={[0, 0.035, 0.132]}>
          <boxGeometry args={[0.035, 0.07, 0.005]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        {/* Back Keyhole Escutcheon Plate (Guarantees zero blank side) */}
        <mesh position={[0, 0.06, -0.122]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.015, 20]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.085, -0.132]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        <mesh position={[0, 0.035, -0.132]} rotation={[0, Math.PI, 0]}>
          <boxGeometry args={[0.035, 0.07, 0.005]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
      </group>
    );
  }

  // Analytics & Statistics: 3D Tiered Glass Chart Bars
  if (lesson.icon === "chart") {
    return (
      <group position={[0, 0.68, 0]} name="symbol-chart">
        {[-1, 0, 1].map((x, i) => (
          <mesh key={x} position={[x * 0.26, (i + 1) * 0.11, 0]} castShadow>
            <boxGeometry args={[0.2, 0.28 + i * 0.22, 0.2]} />
            <meshStandardMaterial
              color={["#38bdf8", "#fbbf24", "#f43f5e"][i]}
              roughness={0.25}
              metalness={0.3}
            />
          </mesh>
        ))}
      </group>
    );
  }

  // Brain & AI Neural Networks: Luminous Neural Lobes
  if (lesson.icon === "brain") {
    return (
      <group position={[0, 0.88, 0]} name="symbol-brain">
        {[-1, 1].map((side) => (
          <group key={side}>
            {[0, 1, 2].map((i) => (
              <mesh
                key={i}
                position={[side * (i === 1 ? 0.22 : 0.15), (i - 1) * 0.18, 0]}
                scale={[0.2, 0.22, 0.18]}
                castShadow
              >
                <sphereGeometry args={[1, 16, 12]} />
                <meshStandardMaterial
                  color="#e0f2fe"
                  emissive="#38bdf8"
                  emissiveIntensity={0.6}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>
        ))}
        {/* Brain stem */}
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.18, 8]} />
          <meshStandardMaterial color="#bae6fd" />
        </mesh>
      </group>
    );
  }

  // Linear Algebra & Matrix: Floating 3D Tensor Cube
  if (lesson.icon === "matrix") {
    return (
      <group position={[0, 0.82, 0]} name="symbol-matrix">
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((y) => (
            <mesh
              key={`${x}${y}`}
              position={[x * 0.2, y * 0.2, 0]}
              castShadow
            >
              <boxGeometry args={[0.18, 0.24, 0.16]} />
              <meshStandardMaterial
                color="#a855f7"
                emissive="#7e22ce"
                emissiveIntensity={0.6}
                roughness={0.3}
              />
            </mesh>
          )),
        )}
        {/* Core coordinate axes */}
        <mesh>
          <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  // Databases: Multi-tiered Magnetic Data Cylinders
  if (lesson.icon === "database") {
    return (
      <group position={[0, 0.72, 0]} name="symbol-database">
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.33, 0.33, 0.14, 24]} />
            <meshStandardMaterial
              color="#f8fafc"
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>
        ))}
        {/* Status read-head LED */}
        <mesh position={[0.28, 0.36, 0.18]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      </group>
    );
  }

  // Network & Graphs: Luminous Nodes with Connecting Rods
  if (lesson.icon === "network") {
    return (
      <group position={[0, 0.84, 0]} name="symbol-network">
        {[-1, 0, 1].map((x, i) => (
          <group key={x}>
            <mesh position={[x * 0.34, i === 1 ? 0.26 : -0.14, 0]} castShadow>
              <sphereGeometry args={[0.14, 14, 10]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.8}
                roughness={0.25}
              />
            </mesh>
            {x !== 0 && (
              <mesh position={[x * 0.17, 0.06, 0]} rotation={[0, 0, x * 0.75]}>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
                <meshStandardMaterial color="#bae6fd" roughness={0.3} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    );
  }

  // Default: Crossed Code Brackets / Vector Crest
  return (
    <group position={[0, 0.82, 0]} name="symbol-default">
      {[-1, 1].flatMap((side) =>
        [-1, 1].map((half) => (
          <mesh
            key={`${side}${half}`}
            position={[side * 0.25, half * 0.12, 0]}
            rotation={[0, 0, side * half * -0.65]}
            castShadow
          >
            <boxGeometry args={[0.1, 0.36, 0.16]} />
            <meshStandardMaterial color={symbolColor} roughness={0.3} />
          </mesh>
        )),
      )}
      <mesh rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.08, 0.52, 0.14]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// 2. LESSON PLATFORM PEDESTAL
// ============================================================================

export function LessonPlatform({
  lesson,
  status,
  position,
  selected,
  reducedMotion,
  showAllLabels = false,
  onSelect,
}: {
  lesson: Lesson;
  status: LessonStatus;
  index?: number;
  position: Point3;
  selected: boolean;
  reducedMotion: boolean;
  showAllLabels?: boolean;
  onSelect: (lessonId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const group = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const { gl } = useThree();

  useCursor(hovered, "pointer", "auto", gl.domElement);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += Math.min(delta, 0.05);
    if (group.current) {
      group.current.position.y = MathUtils.damp(
        group.current.position.y,
        position[1] + (hovered && !reducedMotion ? 0.12 : 0),
        9,
        Math.min(delta, 0.1),
      );
      const scale = MathUtils.damp(
        group.current.scale.x,
        hovered && !reducedMotion ? 1.04 : 1,
        9,
        Math.min(delta, 0.1),
      );
      group.current.scale.setScalar(scale);
    }
    if (ring.current && !reducedMotion) {
      ring.current.rotation.z = time.current * 0.35;
      ring.current.scale.setScalar(1 + Math.sin(time.current * 2.8) * 0.04);
    }
  });

  const isCurrent = status === "current";
  const isCompleted = status === "completed";
  const isLocked = status === "locked";

  const topColor = isCurrent ? "#38bdf8" : isCompleted ? "#22c55e" : "#94a3b8";
  const baseColor = isCurrent ? "#0284c7" : isCompleted ? "#15803d" : "#64748b";

  const hover = (value: boolean) => setHovered(value);
  const isExpanded = hovered || selected || showAllLabels;

  return (
    <group
      ref={group}
      position={position}
      name={`lesson-platform-${lesson.id}`}
      onPointerOver={(event) => {
        event.stopPropagation();
        hover(true);
      }}
      onPointerOut={() => hover(false)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(lesson.id);
      }}
    >
      {/* Tier 1: Wide Beveled Lower Stone Plinth */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.08, 1.2, 0.2, 48]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
      </mesh>

      {/* Tier 2: Sculpted Middle Dais */}
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.96, 1.06, 0.18, 48]} />
        <meshStandardMaterial color={baseColor} roughness={0.55} />
      </mesh>

      {/* Tier 3: Polished Upper Platform Disc */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.88, 0.95, 0.16, 48]} />
        <meshStandardMaterial
          color={topColor}
          roughness={0.28}
          metalness={0.12}
        />
      </mesh>

      {/* Glowing Runic / Energy Edge Ring */}
      <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.035, 8, 48]} />
        <meshStandardMaterial
          color={isLocked ? "#94a3b8" : isCurrent ? "#38bdf8" : "#86efac"}
          emissive={isLocked ? "#000000" : isCurrent ? "#0284c7" : "#22c55e"}
          emissiveIntensity={isLocked ? 0 : 0.8}
          roughness={0.25}
        />
      </mesh>

      {/* 3D Platform Symbol (Rotated & tilted UPWARDS to face camera line of sight) */}
      <group rotation={[0.32, Math.PI + 0.24, 0]}>
        <PlatformSymbol lesson={lesson} status={status} />
      </group>

      {/* Completed State: Laurel Medal Badge (Tilted up towards player, dual-sided with glowing checkmark) */}
      {isCompleted && (
        <group position={[-0.72, 0.6, -0.64]} rotation={[0.36, Math.PI + 0.25, 0]}>
          {/* Golden Outer Laurel Rim Disc */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.06, 24]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Emerald Green Center Inset on Front */}
          <mesh position={[0, 0, 0.032]}>
            <circleGeometry args={[0.22, 24]} />
            <meshStandardMaterial color="#16a34a" roughness={0.25} />
          </mesh>
          {/* Emerald Green Center Inset on Back */}
          <mesh position={[0, 0, -0.032]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.22, 24]} />
            <meshStandardMaterial color="#16a34a" roughness={0.25} />
          </mesh>
          {/* Front Glowing White Checkmark Bars */}
          <mesh position={[-0.06, -0.02, 0.045]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.05, 0.13, 0.02]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0.045, 0.03, 0.045]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.05, 0.24, 0.02]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
          {/* Back Glowing White Checkmark Bars */}
          <mesh position={[-0.06, -0.02, -0.045]} rotation={[0, Math.PI, Math.PI / 4]}>
            <boxGeometry args={[0.05, 0.13, 0.02]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0.045, 0.03, -0.045]} rotation={[0, Math.PI, -Math.PI / 4]}>
            <boxGeometry args={[0.05, 0.24, 0.02]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}

      {/* Current State: Pulsing Holo Energy Ring & Soft Light */}
      {isCurrent && (
        <>
          <mesh
            ref={ring}
            position={[0, 0.25, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[1.15, 0.055, 8, 64]} />
            <meshStandardMaterial
              color="#bae6fd"
              emissive="#38bdf8"
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            position={[0, 1.2, 0]}
            color="#38bdf8"
            intensity={2.2}
            distance={3.5}
            decay={2}
          />
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 1.12, 0.32, 0]}>
              <sphereGeometry args={[0.08, 10, 8]} />
              <meshBasicMaterial color="#e0f2fe" />
            </mesh>
          ))}
        </>
      )}

      {/* Smart Adaptive Step Pin vs Full Expanded Lesson Card (Prevents occluding adjacent steps) */}
      {isExpanded ? (
        <Html
          position={[0, 1.88, 0]}
          center
          zIndexRange={[30, 0]}
          style={{ pointerEvents: "auto" }}
        >
          <button
            className={`world-lesson-label ${status} ${selected ? "selected" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(lesson.id);
            }}
            onMouseEnter={() => hover(true)}
            onMouseLeave={() => hover(false)}
            aria-label={`${lesson.title}, ${
              isCurrent
                ? "start lesson"
                : isCompleted
                  ? "completed, review lesson"
                  : "locked, view prerequisites"
            }`}
          >
            {isCurrent && (
              <span className="world-here">YOU’RE HERE!</span>
            )}
            <strong>
              {lesson.title}
            </strong>
            <span className="world-label-meta">
              {isCompleted ? (
                <Check size={11} />
              ) : isLocked ? (
                <LockKeyhole size={11} />
              ) : (
                <Play size={10} fill="currentColor" />
              )}
              <span>
                {isCurrent
                  ? "Start lesson"
                  : isLocked
                    ? "Locked"
                    : "Completed"}
              </span>
              <span className="label-xp">
                <Star size={10} />
                {lesson.xp} XP
              </span>
            </span>
          </button>
        </Html>
      ) : (
        <Html
          position={[0, 1.45, 0]}
          center
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "auto" }}
        >
          <button
            className={`world-lesson-pin ${status} ${selected ? "selected" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(lesson.id);
            }}
            onMouseEnter={() => hover(true)}
            onMouseLeave={() => hover(false)}
            aria-label={`${lesson.title}, ${
              isCurrent ? "current lesson" : isCompleted ? "completed" : "locked"
            }`}
          >
            <span className="world-pin-icon">
              {isCompleted ? (
                <Check size={10} strokeWidth={2.5} />
              ) : isCurrent ? (
                <Play size={9} fill="currentColor" />
              ) : (
                <LockKeyhole size={9} />
              )}
            </span>
            <span className="world-pin-title">{lesson.title}</span>
            {isCurrent && (
              <span className="world-pin-current-tag">START</span>
            )}
          </button>
        </Html>
      )}
    </group>
  );
}
