"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { directions } from "@/data/curriculum";
import { learningWorlds } from "@/data/learning-world";
import type { Direction } from "@/types/curriculum";
import type { Group } from "three";

interface IslandSignpostProps {
  world: Direction;
  direction: "prev" | "next";
  position: [number, number, number];
  rotation: [number, number, number];
  reducedMotion?: boolean;
}

/**
 * 3D Chevron Arrow mesh (< or >)
 */
function Arrow3DChevron({
  isPrev,
  position,
  hovered,
}: {
  isPrev: boolean;
  position: [number, number, number];
  hovered: boolean;
}) {
  const armLength = 0.22;
  const armThickness = 0.055;
  const armDepth = 0.04;
  const angle = 0.65; // ~37 degrees

  // Offset along the arms from the chevron vertex
  const dx = Math.cos(angle) * (armLength * 0.5) * (isPrev ? 1 : -1);
  const dy = Math.sin(angle) * (armLength * 0.5);

  const rotTop = isPrev ? angle : -angle;
  const rotBottom = isPrev ? -angle : angle;

  const color = hovered ? "#39e75f" : "#2f851d";
  const emissive = hovered ? "#1f7a14" : "#0d3b07";

  return (
    <group position={position}>
      {/* Top Arm */}
      <mesh position={[dx, dy, 0]} rotation={[0, 0, rotTop]} castShadow>
        <boxGeometry args={[armLength, armThickness, armDepth]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={hovered ? 1.0 : 0.25}
          roughness={0.4}
        />
      </mesh>
      {/* Bottom Arm */}
      <mesh position={[dx, -dy, 0]} rotation={[0, 0, rotBottom]} castShadow>
        <boxGeometry args={[armLength, armThickness, armDepth]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={hovered ? 1.0 : 0.25}
          roughness={0.4}
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
  reducedMotion = false,
}: IslandSignpostProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<Group>(null);
  const arrowFloatRef = useRef<Group>(null);
  const isPrev = direction === "prev";

  useCursor(hovered);

  useFrame((state) => {
    if (!reducedMotion) {
      const t = state.clock.getElapsedTime();
      // Gentle bobbing animation for the whole post to attract attention
      if (groupRef.current) {
        const bob = Math.sin(t * 2 + (isPrev ? 0 : Math.PI)) * 0.035;
        groupRef.current.position.y = position[1] + bob;
      }
      // Gentle forward/backward pulse for the floating arrow indicator on top
      if (arrowFloatRef.current) {
        const pulse = Math.sin(t * 3.5) * 0.05;
        arrowFloatRef.current.position.x = isPrev ? -pulse : pulse;
      }
    }
  });

  const handleClick = () => {
    router.push(`/path/${world.id}`);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.12 : 1}
    >
      {/* Stone Ground Base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.46, 0.16, 14]} />
        <meshStandardMaterial color="#bfbaa3" roughness={0.92} />
      </mesh>

      {/* Decorative base pebbles */}
      <mesh position={[0.26, 0.04, 0.18]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 0.08, 8]} />
        <meshStandardMaterial color="#9c9783" roughness={0.9} />
      </mesh>
      <mesh position={[-0.24, 0.04, -0.15]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 0.08, 8]} />
        <meshStandardMaterial color="#9c9783" roughness={0.9} />
      </mesh>

      {/* Main Wooden Post */}
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.1, 1.45, 10]} />
        <meshStandardMaterial
          color={hovered ? "#ba8b52" : "#916a3a"}
          roughness={0.88}
        />
      </mesh>

      {/* Signboard Backing & Arrow Body */}
      <group position={[isPrev ? -0.25 : 0.25, 1.35, 0]}>
        {/* Main Board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.44, 0.13]} />
          <meshStandardMaterial
            color={hovered ? "#fff6de" : "#f5e8c9"}
            roughness={0.7}
          />
        </mesh>

        {/* Directional Pointed Arrow Tip */}
        <mesh
          position={[isPrev ? -0.76 : 0.76, 0, 0]}
          rotation={[0, 0, isPrev ? Math.PI / 2 : -Math.PI / 2]}
          castShadow
        >
          <coneGeometry args={[0.22, 0.28, 4]} />
          <meshStandardMaterial
            color={hovered ? "#fff6de" : "#f5e8c9"}
            roughness={0.7}
          />
        </mesh>

        {/* 3D Painted Double Arrow Chevrons on Front Face */}
        <Arrow3DChevron
          isPrev={isPrev}
          position={[isPrev ? -0.32 : 0.32, 0, 0.072]}
          hovered={hovered}
        />
        <Arrow3DChevron
          isPrev={isPrev}
          position={[isPrev ? 0.12 : -0.12, 0, 0.072]}
          hovered={hovered}
        />

        {/* 3D Painted Double Arrow Chevrons on Back Face */}
        <group rotation={[0, Math.PI, 0]}>
          <Arrow3DChevron
            isPrev={!isPrev}
            position={[!isPrev ? -0.32 : 0.32, 0, 0.072]}
            hovered={hovered}
          />
          <Arrow3DChevron
            isPrev={!isPrev}
            position={[!isPrev ? 0.12 : -0.12, 0, 0.072]}
            hovered={hovered}
          />
        </group>

        {/* Decorative Wooden Roof / Cap */}
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[1.44, 0.07, 0.2]} />
          <meshStandardMaterial color="#7a552c" roughness={0.8} />
        </mesh>
      </group>

      {/* Floating 3D Directional Arrow Indicator Above Post */}
      <group
        ref={arrowFloatRef}
        position={[0, 1.82, 0]}
        rotation={[0, 0, isPrev ? Math.PI : 0]}
      >
        {/* Floating Arrow Shaft */}
        <mesh position={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.24, 0.08, 0.08]} />
          <meshStandardMaterial
            color={hovered ? "#ffe77a" : "#8ee356"}
            emissive={hovered ? "#ffbe1a" : "#45961d"}
            emissiveIntensity={hovered ? 1.8 : 0.8}
            toneMapped={false}
          />
        </mesh>
        {/* Floating Arrow Cone Tip */}
        <mesh position={[0.11, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <coneGeometry args={[0.13, 0.22, 4]} />
          <meshStandardMaterial
            color={hovered ? "#ffe77a" : "#8ee356"}
            emissive={hovered ? "#ffbe1a" : "#45961d"}
            emissiveIntensity={hovered ? 1.8 : 0.8}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

export function IslandSignposts({
  currentDirectionId,
  reducedMotion = false,
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
      {/* Previous Island Signpost on Left Side of Grass */}
      <IslandSignpost
        world={prevWorld}
        direction="prev"
        position={[-3.6, 0.28, 4.3]}
        rotation={[0, 0.22, 0]}
        reducedMotion={reducedMotion}
      />

      {/* Next Island Signpost on Right Side of Grass */}
      <IslandSignpost
        world={nextWorld}
        direction="next"
        position={[3.9, 0.28, -0.6]}
        rotation={[0, -0.32, 0]}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
