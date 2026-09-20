"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { directions } from "@/data/curriculum";
import { learningWorlds } from "@/data/learning-world";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import type { Direction } from "@/types/curriculum";
import type { Group } from "three";

interface IslandSignpostProps {
  world: Direction;
  direction: "prev" | "next";
  position: [number, number, number];
  rotation: [number, number, number];
  reducedMotion?: boolean;
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
  const isPrev = direction === "prev";

  useCursor(hovered);

  useFrame((state) => {
    if (!reducedMotion && groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle bobbing animation to draw attention
      const bob = Math.sin(t * 2 + (isPrev ? 0 : Math.PI)) * 0.04;
      groupRef.current.position.y = position[1] + bob;
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
      scale={hovered ? 1.08 : 1}
    >
      {/* Stone Ground Base */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.44, 0.16, 12]} />
        <meshStandardMaterial color="#c2bea8" roughness={0.92} />
      </mesh>

      {/* Main Wooden Post */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.075, 0.095, 1.45, 10]} />
        <meshStandardMaterial
          color={hovered ? "#b88a52" : "#987242"}
          roughness={0.88}
        />
      </mesh>

      {/* Signboard Backing */}
      <group position={[isPrev ? -0.2 : 0.2, 1.35, 0]}>
        {/* Main Board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.35, 0.44, 0.12]} />
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
          <coneGeometry args={[0.22, 0.26, 3]} />
          <meshStandardMaterial
            color={hovered ? "#fff6de" : "#f5e8c9"}
            roughness={0.7}
          />
        </mesh>

        {/* Contrasting Painted Arrow Chevron in 3D */}
        <mesh
          position={[isPrev ? -0.45 : 0.45, 0, 0.068]}
          rotation={[0, 0, isPrev ? Math.PI / 2 : -Math.PI / 2]}
        >
          <coneGeometry args={[0.13, 0.18, 3]} />
          <meshStandardMaterial
            color={hovered ? "#2b681c" : "#3b8026"}
            roughness={0.5}
          />
        </mesh>

        {/* Decorative Roof / Cap */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[1.48, 0.07, 0.2]} />
          <meshStandardMaterial color="#7a552c" roughness={0.8} />
        </mesh>

        {/* Small Lantern / Gem on Top */}
        <mesh position={[0, 0.36, 0]} castShadow>
          <dodecahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial
            color={hovered ? "#ffe478" : "#89d65a"}
            emissive={hovered ? "#e0b020" : "#45961d"}
            emissiveIntensity={hovered ? 1.8 : 0.7}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Floating Interactive 3D HTML Label */}
      <Html
        position={[0, 1.88, 0]}
        center
        distanceFactor={13}
        zIndexRange={[25, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <button
          type="button"
          className={`world-3d-sign-btn ${isPrev ? "is-prev" : "is-next"} ${hovered ? "is-hovered" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={`${isPrev ? "Go to previous island" : "Go to next island"}: ${world.title}`}
        >
          <div className="sign-eyebrow">
            {isPrev ? (
              <>
                <ChevronLeft size={13} strokeWidth={3} />
                <span>PREVIOUS ISLAND</span>
              </>
            ) : (
              <>
                <span>NEXT ISLAND</span>
                <ChevronRight size={13} strokeWidth={3} />
              </>
            )}
          </div>
          <div className="sign-title-row">
            {isPrev && <CurriculumIcon name={world.icon} size={15} />}
            <strong className="sign-title">{world.shortTitle}</strong>
            {!isPrev && <CurriculumIcon name={world.icon} size={15} />}
          </div>
          <span className="sign-click-hint">Click to travel ✈</span>
        </button>
      </Html>
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
