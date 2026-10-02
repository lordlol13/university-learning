"use client";

import { useEffect, useState } from "react";
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

      {/* 3D Directional Wooden Signboard with Arrow Tip (Always crisp and clearly front-facing) */}
      <group position={[isPrev ? -0.2 : 0.2, 1.35, 0]}>
        {/* Main Board Plank */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.38, 0.46, 0.12]} />
          <meshStandardMaterial
            color={hovered ? "#fffbf0" : "#f5e8c9"}
            roughness={0.65}
          />
        </mesh>

        {/* High-Contrast Plaque Inset on Front */}
        <mesh position={[0, 0, 0.063]}>
          <boxGeometry args={[1.24, 0.36, 0.012]} />
          <meshStandardMaterial
            color={hovered ? "#0f172a" : "#1e293b"}
            roughness={0.4}
          />
        </mesh>

        {/* High-Contrast Plaque Inset on Back (Guarantees zero blank side) */}
        <mesh position={[0, 0, -0.063]}>
          <boxGeometry args={[1.24, 0.36, 0.012]} />
          <meshStandardMaterial
            color={hovered ? "#0f172a" : "#1e293b"}
            roughness={0.4}
          />
        </mesh>

        {/* Directional Pointed Arrow Tip */}
        <mesh
          position={[isPrev ? -0.78 : 0.78, 0, 0]}
          rotation={[0, 0, isPrev ? Math.PI / 2 : -Math.PI / 2]}
          castShadow
        >
          <coneGeometry args={[0.24, 0.28, 4]} />
          <meshStandardMaterial
            color={hovered ? "#ffffff" : "#f5e8c9"}
            roughness={0.65}
          />
        </mesh>

        {/* Bold Glowing 3D Directional Chevron on Front */}
        <group position={[isPrev ? -0.42 : 0.42, 0, 0.076]}>
          <mesh
            rotation={[0, 0, isPrev ? Math.PI / 4 : -Math.PI / 4]}
            position={[0, 0.06, 0]}
          >
            <boxGeometry args={[0.045, 0.16, 0.024]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#22c55e"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          <mesh
            rotation={[0, 0, isPrev ? -Math.PI / 4 : Math.PI / 4]}
            position={[0, -0.06, 0]}
          >
            <boxGeometry args={[0.045, 0.16, 0.024]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#22c55e"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Matching Glowing 3D Directional Chevron on Back */}
        <group position={[isPrev ? -0.42 : 0.42, 0, -0.076]}>
          <mesh
            rotation={[0, 0, isPrev ? Math.PI / 4 : -Math.PI / 4]}
            position={[0, 0.06, 0]}
          >
            <boxGeometry args={[0.045, 0.16, 0.024]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#22c55e"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          <mesh
            rotation={[0, 0, isPrev ? -Math.PI / 4 : Math.PI / 4]}
            position={[0, -0.06, 0]}
          >
            <boxGeometry args={[0.045, 0.16, 0.024]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#22c55e"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Wooden Roof Cap */}
        <mesh position={[0, 0.27, 0]} castShadow>
          <boxGeometry args={[1.52, 0.08, 0.18]} />
          <meshStandardMaterial color="#7a552c" roughness={0.8} />
        </mesh>

        {/* Glowing Lantern / Emerald Gem on Top */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <dodecahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial
            color={hovered ? "#a3e635" : "#4ade80"}
            emissive={hovered ? "#84cc16" : "#22c55e"}
            emissiveIntensity={hovered ? 2.6 : 1.6}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Prominent Always-Readable Floating Campus Sign Badge */}
      <Html
        position={[0, 2.05, 0]}
        center
        zIndexRange={[25, 0]}
        style={{
          pointerEvents: "none",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          transform: hovered ? "scale(1.08)" : "scale(1)",
        }}
      >
        <div
          style={{
            background: hovered
              ? "rgba(15, 23, 42, 0.96)"
              : "rgba(15, 23, 42, 0.88)",
            color: "#ffffff",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: hovered
              ? "0 6px 18px rgba(0,0,0,0.45)"
              : "0 3px 10px rgba(0,0,0,0.3)",
            border: hovered
              ? "1px solid rgba(74, 222, 128, 0.6)"
              : "1px solid rgba(255,255,255,0.22)",
            letterSpacing: "-0.2px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          {isPrev && <span style={{ color: "#4ade80", fontSize: "10px" }}>◀</span>}
          <span>{world.title}</span>
          {!isPrev && <span style={{ color: "#4ade80", fontSize: "10px" }}>▶</span>}
        </div>
      </Html>
    </group>
  );
}

export function IslandSignposts(_props?: {
  currentDirectionId?: string;
  reducedMotion?: boolean;
}) {
  return null;
}

export default IslandSignposts;

