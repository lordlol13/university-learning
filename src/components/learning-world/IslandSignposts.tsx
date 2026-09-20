"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [hovered, setHovered] = useState(false);
  const isPrev = direction === "prev";

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

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
      onPointerDown={(e) => {
        e.stopPropagation();
        handleNavigate();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      {/* Invisible generous click-target cylinder for easy clicking anywhere around the sign */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 2.2, 10]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Stone Ground Base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.44, 0.16, 12]} />
        <meshStandardMaterial color="#c2bea8" roughness={0.92} />
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

      {/* Main Wooden Post */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.1, 1.45, 12]} />
        <meshStandardMaterial
          color={hovered ? "#ab7e48" : "#8c6237"}
          roughness={0.88}
        />
      </mesh>

      {/* 3D Directional Wooden Signboard with Arrow Tip (Zero text overlay) */}
      <group position={[isPrev ? -0.2 : 0.2, 1.35, 0]}>
        {/* Main Board Plank */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.35, 0.44, 0.12]} />
          <meshStandardMaterial
            color={hovered ? "#fffbf0" : "#f5e8c9"}
            roughness={0.7}
          />
        </mesh>

        {/* Directional Pointed Arrow Tip */}
        <mesh
          position={[isPrev ? -0.76 : 0.76, 0, 0]}
          rotation={[0, 0, isPrev ? Math.PI / 2 : -Math.PI / 2]}
          castShadow
        >
          <coneGeometry args={[0.22, 0.26, 3]} />
          <meshStandardMaterial
            color={hovered ? "#fffbf0" : "#f5e8c9"}
            roughness={0.7}
          />
        </mesh>

        {/* Painted 3D Green Arrow Chevron */}
        <mesh
          position={[isPrev ? -0.42 : 0.42, 0, 0.068]}
          rotation={[0, 0, isPrev ? Math.PI / 2 : -Math.PI / 2]}
        >
          <coneGeometry args={[0.13, 0.18, 3]} />
          <meshStandardMaterial
            color={hovered ? "#389e22" : "#2b7719"}
            roughness={0.4}
          />
        </mesh>

        {/* Wooden Roof Cap */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[1.48, 0.07, 0.2]} />
          <meshStandardMaterial color="#7a552c" roughness={0.8} />
        </mesh>

        {/* Glowing Lantern / Emerald Gem on Top */}
        <mesh position={[0, 0.36, 0]} castShadow>
          <dodecahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial
            color={hovered ? "#9df069" : "#6fcf38"}
            emissive={hovered ? "#5cb825" : "#328c0b"}
            emissiveIntensity={hovered ? 2.2 : 0.9}
            toneMapped={false}
          />
        </mesh>
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
      {/* Previous Island Signpost on Left Side of Grass (Arrow points left toward previous) */}
      <IslandSignpost
        world={prevWorld}
        direction="prev"
        position={[-3.3, 0.28, 2.4]}
        rotation={[0, 0.25, 0]}
      />

      {/* Next Island Signpost on Right Side of Grass (Arrow points right toward next) */}
      <IslandSignpost
        world={nextWorld}
        direction="next"
        position={[3.5, 0.28, 0.6]}
        rotation={[0, -0.28, 0]}
      />
    </group>
  );
}
