"use client";

import { useRouter } from "next/navigation";
import { Html } from "@react-three/drei";
import { directions } from "@/data/curriculum";
import { learningWorlds } from "@/data/learning-world";
import type { Direction } from "@/types/curriculum";

interface IslandSignpostProps {
  world: Direction;
  direction: "prev" | "next";
  position: [number, number, number];
  rotation: [number, number, number];
}

function IslandSignpost({
  world,
  direction,
  position,
  rotation,
}: IslandSignpostProps) {
  const router = useRouter();
  const isPrev = direction === "prev";

  const handleNavigate = () => {
    router.push(`/path/${world.id}`);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        handleNavigate();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Stone Ground Base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.42, 0.16, 14]} />
        <meshStandardMaterial color="#bfbaa3" roughness={0.92} />
      </mesh>

      {/* Small Decorative Base Pebbles */}
      <mesh position={[0.22, 0.04, 0.14]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 0.08, 8]} />
        <meshStandardMaterial color="#9c9783" roughness={0.9} />
      </mesh>
      <mesh position={[-0.2, 0.04, -0.12]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.08, 8]} />
        <meshStandardMaterial color="#9c9783" roughness={0.9} />
      </mesh>

      {/* Main Wooden Post (Solid, static, no animation) */}
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.075, 0.095, 1.45, 10]} />
        <meshStandardMaterial color="#8c6237" roughness={0.88} />
      </mesh>

      {/* Decorative Wooden Frame / Board Rim */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[0.96, 0.76, 0.07]} />
        <meshStandardMaterial color="#7c552d" roughness={0.85} />
      </mesh>

      {/* 3D Signpost Plaque with pure visual "<" or ">" Link */}
      <Html
        position={[0, 1.35, 0.06]}
        center
        distanceFactor={12}
        zIndexRange={[25, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <button
          type="button"
          className={`island-sign-arrow ${isPrev ? "prev" : "next"}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNavigate();
          }}
          aria-label={
            isPrev
              ? `Previous island: ${world.title}`
              : `Next island: ${world.title}`
          }
          title={
            isPrev
              ? `Previous island: ${world.title}`
              : `Next island: ${world.title}`
          }
        >
          {isPrev ? "<" : ">"}
        </button>
      </Html>
    </group>
  );
}

export function IslandSignposts({
  currentDirectionId,
}: {
  currentDirectionId: string;
  reducedMotion?: boolean;
}) {
  const availableWorlds: Direction[] = directions.filter((d) =>
    learningWorlds.some((w) => w.directionId === d.id),
  );

  if (availableWorlds.length <= 1) return null;

  const currentIndex = availableWorlds.findIndex(
    (w) => w.id === currentDirectionId,
  );
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  const prevIndex =
    (activeIndex - 1 + availableWorlds.length) % availableWorlds.length;
  const nextIndex = (activeIndex + 1) % availableWorlds.length;

  const prevWorld = availableWorlds[prevIndex] ?? availableWorlds[0];
  const nextWorld = availableWorlds[nextIndex] ?? availableWorlds[0];

  return (
    <group name="island-signposts">
      {/* Previous Island Signpost on Left Side of Grass: Displays "<" */}
      <IslandSignpost
        world={prevWorld}
        direction="prev"
        position={[-3.6, 0.28, 4.3]}
        rotation={[0, 0.22, 0]}
      />

      {/* Next Island Signpost on Right Side of Grass: Displays ">" */}
      <IslandSignpost
        world={nextWorld}
        direction="next"
        position={[3.9, 0.28, -0.6]}
        rotation={[0, -0.32, 0]}
      />
    </group>
  );
}
