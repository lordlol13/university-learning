"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCursor } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { directions } from "@/data/curriculum";
import { learningWorlds } from "@/data/learning-world";
import type { Direction } from "@/types/curriculum";

interface IslandSignpostProps {
  world: Direction;
  direction: "prev" | "next";
  position: [number, number, number];
  rotation: [number, number, number];
}

/**
 * Clean 3D "<" or ">" Symbol
 */
function ArrowSymbol3D({
  isPrev,
  hovered,
  onClick,
}: {
  isPrev: boolean;
  hovered: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const armLength = 0.36;
  const armThickness = 0.08;
  const armDepth = 0.055;
  const angle = 0.68; // ~39 degrees

  // Offset along the arms from apex (0, 0)
  // For "<" (isPrev): apex is on the left (-X), arms go up-right and down-right (+X)
  // For ">" (!isPrev): apex is on the right (+X), arms go up-left and down-left (-X)
  const dx = Math.cos(angle) * (armLength * 0.5) * (isPrev ? 1 : -1);
  const dy = Math.sin(angle) * (armLength * 0.5);

  const rotTop = isPrev ? angle : -angle;
  const rotBottom = isPrev ? -angle : angle;

  const color = hovered ? "#ffffff" : "#2e7d1e";
  const emissive = hovered ? "#4ade80" : "#0d3b07";

  return (
    <group position={[isPrev ? -0.06 : 0.06, 0, 0]}>
      {/* Top Arm of "<" or ">" */}
      <mesh
        position={[dx, dy, 0]}
        rotation={[0, 0, rotTop]}
        castShadow
        onClick={onClick}
      >
        <boxGeometry args={[armLength, armThickness, armDepth]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={hovered ? 0.9 : 0.25}
          roughness={0.35}
        />
      </mesh>
      {/* Bottom Arm of "<" or ">" */}
      <mesh
        position={[dx, -dy, 0]}
        rotation={[0, 0, rotBottom]}
        castShadow
        onClick={onClick}
      >
        <boxGeometry args={[armLength, armThickness, armDepth]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={hovered ? 0.9 : 0.25}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function IslandSignpost({
  world,
  direction,
  position,
  rotation,
}: IslandSignpostProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const isPrev = direction === "prev";

  useCursor(hovered);

  const handleNavigate = () => {
    router.push(`/path/${world.id}`);
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/path/${world.id}`);
    }
  };

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        handleNavigate();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        handleNavigate();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.08 : 1}
    >
      {/* Invisible Collision / Click Box with opacity: 0 for Raycasting */}
      <mesh
        position={[0, 1.0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          handleNavigate();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          handleNavigate();
        }}
      >
        <boxGeometry args={[1.8, 2.4, 1.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

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

      {/* Main Wooden Post (Solid, static) */}
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.075, 0.095, 1.45, 10]} />
        <meshStandardMaterial
          color={hovered ? "#ba8b52" : "#916a3a"}
          roughness={0.88}
        />
      </mesh>

      {/* Decorative Wooden Frame / Board Rim */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[0.92, 0.72, 0.07]} />
        <meshStandardMaterial color="#7c552d" roughness={0.85} />
      </mesh>

      {/* Main Wooden Board Plaque */}
      <mesh
        position={[0, 1.35, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          handleNavigate();
        }}
      >
        <boxGeometry args={[0.85, 0.65, 0.1]} />
        <meshStandardMaterial
          color={hovered ? "#fff6de" : "#f5e8c9"}
          roughness={0.75}
        />
      </mesh>

      {/* 3D "<" or ">" Symbol on Front Face */}
      <group position={[0, 1.35, 0.055]}>
        <ArrowSymbol3D
          isPrev={isPrev}
          hovered={hovered}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate();
          }}
        />
      </group>

      {/* 3D "<" or ">" Symbol on Back Face */}
      <group position={[0, 1.35, -0.055]} rotation={[0, Math.PI, 0]}>
        <ArrowSymbol3D
          isPrev={!isPrev}
          hovered={hovered}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate();
          }}
        />
      </group>
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
