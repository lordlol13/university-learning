"use client";
import { useRef, useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Check, LockKeyhole, Play, Star } from "lucide-react";
import { MathUtils, type Group, type Mesh } from "three";
import type { Lesson, LessonStatus } from "@/types/curriculum";
import type { Point3 } from "@/types/learning-world";

function PlatformSymbol({
  lesson,
  status,
}: {
  lesson: Lesson;
  status: LessonStatus;
}) {
  const color = status === "locked" ? "#e7ece8" : "#ffffff";
  if (status === "locked")
    return (
      <group position={[0, 0.65, 0]}>
        <mesh position={[0, 0.23, 0]}>
          <torusGeometry args={[0.21, 0.055, 8, 20, Math.PI]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.55, 0.4, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.07, 0.115]}>
          <circleGeometry args={[0.045, 12]} />
          <meshStandardMaterial color="#939f99" />
        </mesh>
      </group>
    );
  if (lesson.icon === "chart")
    return (
      <group position={[0, 0.63, 0]}>
        {[-1, 0, 1].map((x, i) => (
          <mesh key={x} position={[x * 0.24, i * 0.1, 0]} castShadow>
            <boxGeometry args={[0.18, 0.26 + i * 0.2, 0.22]} />
            <meshStandardMaterial
              color={["#92dcf7", "#fcda62", "#fa8979"][i]}
              roughness={0.35}
            />
          </mesh>
        ))}
      </group>
    );
  if (lesson.icon === "brain")
    return (
      <group position={[0, 0.86, 0]}>
        {[-1, 1].map((side) => (
          <group key={side}>
            {[0, 1, 2].map((i) => (
              <mesh
                key={i}
                position={[side * (i === 1 ? 0.18 : 0.13), (i - 1) * 0.18, 0]}
                scale={[0.19, 0.2, 0.15]}
                castShadow
              >
                <sphereGeometry args={[1, 14, 10]} />
                <meshStandardMaterial color="#f3fbff" roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0, -0.36, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.16, 8]} />
          <meshStandardMaterial color="#e0f4ff" />
        </mesh>
      </group>
    );
  if (lesson.icon === "matrix")
    return (
      <group position={[0, 0.79, 0]}>
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((y) => (
            <mesh
              key={`${x}${y}`}
              position={[x * 0.19, y * 0.19, 0]}
              castShadow
            >
              <boxGeometry args={[0.16, 0.25, 0.15]} />
              <meshStandardMaterial color={color} roughness={0.35} />
            </mesh>
          )),
        )}
      </group>
    );
  if (lesson.icon === "database")
    return (
      <group position={[0, 0.67, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * 0.17, 0]} castShadow>
            <cylinderGeometry args={[0.31, 0.31, 0.14, 24]} />
            <meshStandardMaterial
              color="#f3f9f6"
              metalness={0.12}
              roughness={0.28}
            />
          </mesh>
        ))}
      </group>
    );
  if (lesson.icon === "network")
    return (
      <group position={[0, 0.83, 0]}>
        {[-1, 0, 1].map((x, i) => (
          <group key={x}>
            <mesh position={[x * 0.33, i === 1 ? 0.25 : -0.12, 0]} castShadow>
              <sphereGeometry args={[0.13, 12, 8]} />
              <meshStandardMaterial color="#f3f9f6" roughness={0.3} />
            </mesh>
            {x !== 0 && (
              <mesh position={[x * 0.16, 0.06, 0]} rotation={[0, 0, x * 0.73]}>
                <cylinderGeometry args={[0.035, 0.035, 0.48, 8]} />
                <meshStandardMaterial color="#dcebdc" />
              </mesh>
            )}
          </group>
        ))}
      </group>
    );
  return (
    <group position={[0, 0.8, 0]}>
      {[-1, 1].flatMap((side) =>
        [-1, 1].map((half) => (
          <mesh
            key={`${side}${half}`}
            position={[side * 0.24, half * 0.11, 0]}
            rotation={[0, 0, side * half * -0.64]}
            castShadow
          >
            <boxGeometry args={[0.1, 0.35, 0.15]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
        )),
      )}
      <mesh rotation={[0, 0, -0.22]}>
        <boxGeometry args={[0.07, 0.49, 0.12]} />
        <meshStandardMaterial color="#ddf4b8" />
      </mesh>
    </group>
  );
}

export function LessonPlatform({
  lesson,
  status,
  index,
  position,
  selected,
  reducedMotion,
  onSelect,
}: {
  lesson: Lesson;
  status: LessonStatus;
  index: number;
  position: Point3;
  selected: boolean;
  reducedMotion: boolean;
  onSelect: (lessonId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const group = useRef<Group>(null),
    ring = useRef<Mesh>(null);
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
        hovered && !reducedMotion ? 1.035 : 1,
        9,
        Math.min(delta, 0.1),
      );
      group.current.scale.setScalar(scale);
    }
    if (ring.current && !reducedMotion) {
      ring.current.rotation.z = time.current * 0.32;
      ring.current.scale.setScalar(1 + Math.sin(time.current * 2.5) * 0.035);
    }
  });
  const topColor =
    status === "current"
      ? "#37a4f3"
      : status === "completed"
        ? "#6dc53f"
        : "#aeb9ad";
  const baseColor =
    status === "current"
      ? "#417db0"
      : status === "completed"
        ? "#539e31"
        : "#8e9b90";
  const hover = (value: boolean) => setHovered(value);
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
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.93, 1.02, 0.25, 48]} />
        <meshStandardMaterial color={baseColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.39, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.86, 0.93, 0.22, 48]} />
        <meshStandardMaterial
          color={topColor}
          roughness={0.3}
          metalness={0.08}
        />
      </mesh>
      <mesh position={[0, 0.515, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.033, 6, 48]} />
        <meshStandardMaterial
          color={status === "locked" ? "#cad3c7" : "#b9ed94"}
          roughness={0.28}
        />
      </mesh>
      <group rotation={[0, 0.24, 0]}>
        <PlatformSymbol lesson={lesson} status={status} />
      </group>
      {status === "completed" && (
        <group position={[0.69, 0.57, 0.63]} rotation={[-0.4, 0.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.24, 16, 12]} />
            <meshStandardMaterial color="#fffdf0" />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial color="#54b530" />
          </mesh>
          <mesh position={[-0.06, -0.02, 0.251]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.06, 0.13, 0.035]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh
            position={[0.045, 0.025, 0.249]}
            rotation={[0, 0, -Math.PI / 4]}
          >
            <boxGeometry args={[0.06, 0.24, 0.035]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
      )}
      {status === "current" && (
        <>
          <mesh
            ref={ring}
            position={[0, 0.22, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[1.1, 0.05, 8, 64]} />
            <meshStandardMaterial
              color="#b7edff"
              emissive="#69caff"
              emissiveIntensity={1.7}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            position={[0, 1.1, 0]}
            color="#7ed5ff"
            intensity={1.8}
            distance={3}
            decay={2}
          />
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 1.07, 0.28, 0]}>
              <sphereGeometry args={[0.075, 10, 8]} />
              <meshBasicMaterial color="#e6faff" />
            </mesh>
          ))}
        </>
      )}
      <Html
        position={[1.48, 0.73, 0.02]}
        zIndexRange={[12, 0]}
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
          aria-label={`${index + 1}. ${lesson.title}, ${status === "current" ? "start lesson" : status === "completed" ? "completed, review lesson" : "locked, view prerequisites"}`}
        >
          {status === "current" && (
            <span className="world-here">YOU’RE HERE!</span>
          )}
          <strong>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {lesson.title}
          </strong>
          <span className="world-label-meta">
            {status === "completed" ? (
              <Check size={11} />
            ) : status === "locked" ? (
              <LockKeyhole size={11} />
            ) : (
              <Play size={10} fill="currentColor" />
            )}
            <span>
              {status === "current"
                ? "Start lesson"
                : status === "locked"
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
    </group>
  );
}
