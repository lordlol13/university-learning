"use client";

import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ExtrudeGeometry, Shape, type Group, type Mesh } from "three";
import type { LearningWorldData, Point3, TreeVariant } from "@/types/learning-world";
import { worldConfig } from "@/data/world-config";
import { PhysicsScenery } from "./PhysicsObjects";
import { AIScenery, ItalianScenery, MathScenery } from "./WorldScenery";

// ============================================================================
// 1. REDESIGNED HIGH-QUALITY TREE MODELS (6 DISTINCT SPECIES)
// ============================================================================

function Tree({
  position,
  scale,
  variant,
  reducedMotion,
}: {
  position: Point3;
  scale: number;
  variant: TreeVariant;
  reducedMotion: boolean;
}) {
  const treeRef = useRef<Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (treeRef.current && !reducedMotion) {
      time.current += Math.min(delta, 0.05);
      // Gentle natural wind sway
      treeRef.current.rotation.z =
        Math.sin(time.current * 1.4 + position[0] * 1.5) * 0.022;
      treeRef.current.rotation.x =
        Math.cos(time.current * 1.1 + position[2] * 1.5) * 0.018;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={scale} name={`tree-${variant}`}>
      {/* 1. Shoppers' Conifer / Alpine Pine */}
      {variant === "pine" && (
        <group>
          {/* Tapered Pine Trunk */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.16, 1.0, 8]} />
            <meshStandardMaterial color="#4a2e18" roughness={0.95} />
          </mesh>
          {/* 4 Cascading Serrated Needle Cones */}
          {[
            { y: 1.1, r: 0.92, h: 0.85, c: "#1b4d24" },
            { y: 1.6, r: 0.78, h: 0.8, c: "#22592c" },
            { y: 2.1, r: 0.6, h: 0.75, c: "#2e6f39" },
            { y: 2.6, r: 0.38, h: 0.65, c: "#3b8547" },
          ].map((tier, i) => (
            <mesh key={i} position={[0, tier.y, 0]} castShadow receiveShadow>
              <coneGeometry args={[tier.r, tier.h, 7]} />
              <meshStandardMaterial color={tier.c} roughness={0.88} />
            </mesh>
          ))}
        </group>
      )}

      {/* 2. Blooming Cherry / Apple Blossom Tree */}
      {variant === "cherry" && (
        <group>
          {/* Organic Curving Trunk */}
          <mesh position={[0, 0.65, 0]} rotation={[0.08, 0, 0.05]} castShadow>
            <cylinderGeometry args={[0.09, 0.15, 1.3, 8]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.9} />
          </mesh>
          {/* Multi-cluster Pastel Blossom Canopy */}
          {[
            { pos: [0, 1.7, 0], scale: [0.85, 0.8, 0.8], col: "#f472b6" },
            { pos: [-0.42, 1.5, 0.28], scale: [0.55, 0.55, 0.55], col: "#fbcfe8" },
            { pos: [0.38, 1.55, -0.25], scale: [0.58, 0.58, 0.55], col: "#f9a8d4" },
            { pos: [0.1, 2.05, 0.15], scale: [0.52, 0.5, 0.5], col: "#fce7f3" },
          ].map((cluster, i) => (
            <mesh
              key={i}
              position={cluster.pos as Point3}
              scale={cluster.scale as Point3}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial color={cluster.col} roughness={0.82} />
            </mesh>
          ))}
        </group>
      )}

      {/* 3. Mediterranean Tuscan Cypress */}
      {variant === "cypress" && (
        <group>
          {/* Slender base trunk */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.12, 0.7, 8]} />
            <meshStandardMaterial color="#4a3728" roughness={0.95} />
          </mesh>
          {/* Tall Columnar Conical Canopy */}
          <mesh position={[0, 1.65, 0]} scale={[0.38, 1.6, 0.38]} castShadow receiveShadow>
            <sphereGeometry args={[1, 14, 12]} />
            <meshStandardMaterial color="#164e29" roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.3, 0]} castShadow>
            <coneGeometry args={[0.32, 0.9, 10]} />
            <meshStandardMaterial color="#14532d" roughness={0.88} />
          </mesh>
        </group>
      )}

      {/* 4. White Paper Birch */}
      {variant === "birch" && (
        <group>
          {/* Slender White Bark Trunk */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.095, 1.6, 10]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Dark Bark Rings / Notches */}
          {[-0.3, 0.1, 0.45].map((y, i) => (
            <mesh key={i} position={[0, 0.8 + y, 0]}>
              <cylinderGeometry args={[0.072, 0.072, 0.04, 10]} />
              <meshStandardMaterial color="#334155" roughness={0.95} />
            </mesh>
          ))}
          {/* Fluttering Golden-Lime Foliage Canopy */}
          {[
            { pos: [0, 1.9, 0], scale: [0.65, 0.9, 0.62], col: "#84cc16" },
            { pos: [-0.25, 1.65, 0.2], scale: [0.42, 0.55, 0.4], col: "#a3e635" },
            { pos: [0.28, 1.7, -0.18], scale: [0.45, 0.58, 0.42], col: "#65a30d" },
          ].map((cluster, i) => (
            <mesh
              key={i}
              position={cluster.pos as Point3}
              scale={cluster.scale as Point3}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial color={cluster.col} roughness={0.85} />
            </mesh>
          ))}
        </group>
      )}

      {/* 5. Tall Upright Elm / Shade Tree */}
      {variant === "tall" && (
        <group>
          {/* Sturdy Trunk */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.14, 1.5, 8]} />
            <meshStandardMaterial color="#6b4c2e" roughness={0.95} />
          </mesh>
          {/* Ascending Tiered Canopy */}
          {[
            { y: 1.65, s: [0.72, 0.85, 0.7], col: "#3f7a28" },
            { y: 2.2, s: [0.55, 0.7, 0.55], col: "#4f9635" },
            { y: 2.65, s: [0.38, 0.45, 0.38], col: "#65a943" },
          ].map((t, i) => (
            <mesh
              key={i}
              position={[0, t.y, 0]}
              scale={t.s as Point3}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial color={t.col} roughness={0.85} />
            </mesh>
          ))}
        </group>
      )}

      {/* 6. Leafy Oak / Linden (round) */}
      {variant === "round" && (
        <group>
          {/* Flared Trunk with Branch Forks */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.17, 1.2, 8]} />
            <meshStandardMaterial color="#6b4c2e" roughness={0.95} />
          </mesh>
          {/* Main Leafy Canopy Cluster */}
          <mesh position={[0, 1.6, 0]} scale={[0.82, 0.9, 0.8]} castShadow receiveShadow>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#559932" roughness={0.85} />
          </mesh>
          {/* Secondary Organic Canopy Lobes */}
          <mesh position={[-0.38, 1.45, 0.28]} scale={[0.55, 0.62, 0.52]} castShadow>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#68b03e" roughness={0.88} />
          </mesh>
          <mesh position={[0.35, 1.52, -0.22]} scale={[0.5, 0.58, 0.48]} castShadow>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#7ec44f" roughness={0.88} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============================================================================
// 2. CAMPUS BUILDINGS (DISCIPLINE-SPECIFIC ARCHITECTURAL MASTERY)
// ============================================================================

function CampusBuilding({
  building,
  directionId,
}: {
  building: LearningWorldData["buildings"][number];
  directionId: string;
}) {
  const { position, scale, rotation, variant } = building;
  const isAnnex = variant === "annex";
  const effectiveRotation = rotation + Math.PI;

  // 1. AI & Tech Lab / Institute
  if (directionId === "ai-ml") {
    if (isAnnex) {
      return (
        <group position={position} scale={scale} rotation={[0, effectiveRotation, 0]} name="ai-research-annex">
          {/* Slate foundation */}
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 0.2, 1.6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          {/* Modern Research Wing Body */}
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.1, 1.2, 1.3]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Front Illuminated Glass Ribbon Window */}
          <mesh position={[0, 0.9, 0.66]}>
            <boxGeometry args={[1.8, 0.45, 0.05]} />
            <meshStandardMaterial
              color="#bae6fd"
              emissive="#38bdf8"
              emissiveIntensity={1.4}
              roughness={0.1}
              metalness={0.7}
              toneMapped={false}
            />
          </mesh>
          {/* Back Illuminated Glass Ribbon Window (ensures vibrancy from any angle) */}
          <mesh position={[0, 0.9, -0.66]}>
            <boxGeometry args={[1.8, 0.45, 0.05]} />
            <meshStandardMaterial
              color="#bae6fd"
              emissive="#38bdf8"
              emissiveIntensity={1.4}
              roughness={0.1}
              metalness={0.7}
              toneMapped={false}
            />
          </mesh>
          {/* Front Entrance Canopy & Door */}
          <group position={[0, 0.45, 0.68]}>
            <mesh castShadow>
              <boxGeometry args={[0.55, 0.7, 0.06]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.42, 0.12]} castShadow>
              <boxGeometry args={[0.75, 0.05, 0.3]} />
              <meshStandardMaterial color="#0284c7" roughness={0.2} />
            </mesh>
          </group>
          {/* Side Server Heat Sink Fins with Status LEDs */}
          <group position={[1.06, 0.7, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.8, 0.9]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            {[-0.2, 0, 0.2].map((y, i) => (
              <mesh key={i} position={[0.04, y, 0]}>
                <boxGeometry args={[0.02, 0.06, 0.6]} />
                <meshStandardMaterial
                  color={["#10b981", "#38bdf8", "#a855f7"][i]}
                  emissive={["#059669", "#0284c7", "#7e22ce"][i]}
                  emissiveIntensity={2.0}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>
          {/* Roof Solar Array */}
          <mesh position={[0, 1.45, 0]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[1.8, 0.08, 1.1]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.7} />
          </mesh>
        </group>
      );
    }

    return (
      <group position={position} scale={scale} rotation={[0, effectiveRotation, 0]} name="ai-tech-institute">
        {/* Dark Obsidian Foundation */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.3, 2.6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Welcoming Entrance Steps */}
        {[-0.05, -0.15].map((y, i) => (
          <mesh key={i} position={[0, 0.08 + i * 0.06, 1.4 + (1 - i) * 0.15]} receiveShadow>
            <boxGeometry args={[2.0 + i * 0.3, 0.08, 0.45]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
          </mesh>
        ))}
        {/* Main Tech Pavilion Body */}
        <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 1.7, 2.1]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* Tinted Glass Curtain Wall Facade with Warm Interior Luminescence */}
        <mesh position={[0, 1.05, 1.06]}>
          <boxGeometry args={[3.2, 1.2, 0.04]} />
          <meshStandardMaterial
            color="#bae6fd"
            emissive="#0284c7"
            emissiveIntensity={0.65}
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Modern Cantilever Entrance Canopy */}
        <mesh position={[0, 0.65, 1.4]} castShadow>
          <boxGeometry args={[1.6, 0.08, 0.8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} />
        </mesh>
        {/* Illuminated Entrance Brand Sign */}
        <mesh position={[0, 0.82, 1.42]}>
          <boxGeometry args={[1.2, 0.14, 0.02]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
        {/* Luminous Quantum Computing Geodesic Dome */}
        <group position={[0, 2.05, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.95, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial
              color="#0284c7"
              roughness={0.15}
              metalness={0.7}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Glowing Energy Halo Ring */}
          <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.98, 0.04, 8, 32]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={2.0}
              toneMapped={false}
            />
          </mesh>
        </group>
        {/* Exterior Server Array / Heat Sink Fin Tower */}
        <group position={[1.45, 1.2, -0.6]}>
          <mesh castShadow>
            <boxGeometry args={[0.65, 1.8, 0.85]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          {/* Status LED array */}
          {[-0.4, 0, 0.4].map((y, i) => (
            <mesh key={i} position={[0, y, 0.44]}>
              <boxGeometry args={[0.42, 0.06, 0.02]} />
              <meshStandardMaterial
                color={["#10b981", "#38bdf8", "#a855f7"][i]}
                emissive={["#059669", "#0284c7", "#7e22ce"][i]}
                emissiveIntensity={1.8}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
        {/* Rooftop Comms Mast */}
        <mesh position={[-1.3, 2.45, 0.4]}>
          <cylinderGeometry args={[0.025, 0.035, 1.2, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
      </group>
    );
  }

  // 2. Physics & Engineering Astronomical Observatory
  if (directionId === "physics-engineering") {
    if (isAnnex) {
      return (
        <group position={position} scale={scale} rotation={[0, effectiveRotation, 0]}>
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.5, 0.2, 1.5]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 1.1, 1.2]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
          </mesh>
          {/* Workshop garage door */}
          <mesh position={[0, 0.55, 0.61]}>
            <boxGeometry args={[1.2, 0.7, 0.04]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} />
          </mesh>
        </group>
      );
    }

    return (
      <group position={position} scale={scale} rotation={[0, effectiveRotation, 0]} name="physics-observatory">
        {/* Heavy Stone Foundation */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.3, 2.5, 0.3, 24]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.9} />
        </mesh>
        {/* Cylindrical Observatory Drum Tower */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.85, 1.95, 1.8, 24]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        {/* Arched Observation Windows around the Drum */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
          <group key={i} rotation={[0, angle, 0]} position={[0, 1.3, 0]}>
            <mesh position={[0, 0, 1.88]}>
              <boxGeometry args={[0.38, 0.55, 0.05]} />
              <meshStandardMaterial color="#0369a1" roughness={0.2} metalness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Hemispherical Observatory Dome */}
        <group position={[0, 2.1, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[1.8, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Dark Telescope Slit Aperture */}
          <mesh position={[0, 0.95, 1.25]} rotation={[-0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.55, 1.3, 0.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Peering Optical Telescope Barrel */}
          <mesh position={[0, 1.15, 1.45]} rotation={[-0.45, 0, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.22, 1.2, 12]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
        {/* Research Station Annex */}
        <group position={[2.1, 0.65, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.0, 1.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
          {/* Solar power array */}
          <mesh position={[0, 0.6, 0]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[1.1, 0.05, 1.1]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.7} />
          </mesh>
        </group>
      </group>
    );
  }

  // 3. Mathematics Geodesic Atrium & Logic Hall
  if (directionId === "mathematics") {
    if (isAnnex) {
      return (
        <group position={position} scale={scale} rotation={[0, effectiveRotation, 0]}>
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 0.2, 1.5]} />
            <meshStandardMaterial color="#d4c8b2" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.1, 1.1, 1.2]} />
            <meshStandardMaterial color="#ede4d2" roughness={0.85} />
          </mesh>
          {/* Classical geometric entrance portal */}
          <mesh position={[0, 0.6, 0.61]}>
            <boxGeometry args={[0.55, 0.8, 0.04]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      );
    }

    return (
      <group position={position} scale={scale} rotation={[0, effectiveRotation, 0]} name="math-geodesic-atrium">
        {/* Octagonal Classical Marble Podium */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.5, 2.7, 0.3, 8]} />
          <meshStandardMaterial color="#d4c8b2" roughness={0.85} />
        </mesh>
        {/* Octagonal Study Atrium Body */}
        <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.1, 2.3, 1.7, 8]} />
          <meshStandardMaterial color="#ede4d2" roughness={0.85} />
        </mesh>
        {/* Classical Fluted Pilasters at Octagonal Vertices */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 2.15, 1.15, Math.sin(angle) * 2.15]}
              castShadow
            >
              <cylinderGeometry args={[0.1, 0.14, 1.75, 10]} />
              <meshStandardMaterial color="#f5f0e4" roughness={0.75} />
            </mesh>
          );
        })}
        {/* Grand Geodesic Glass Dome */}
        <group position={[0, 2.05, 0]}>
          {/* Inner crystalline glass facets */}
          <mesh castShadow>
            <icosahedronGeometry args={[1.65, 1]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.65}
              roughness={0.15}
              metalness={0.5}
            />
          </mesh>
          {/* Golden Geodesic Wireframe Lattice */}
          <mesh>
            <icosahedronGeometry args={[1.68, 1]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.2} wireframe />
          </mesh>
          {/* Golden Spire Finial */}
          <mesh position={[0, 1.9, 0]} castShadow>
            <coneGeometry args={[0.08, 0.75, 8]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
        {/* Classical Grand Entrance Portal Facade */}
        <group position={[0, 0.85, 2.15]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.6, 1.4, 0.35]} />
            <meshStandardMaterial color="#ede4d2" roughness={0.8} />
          </mesh>
          {/* Pediment Gable */}
          <mesh position={[0, 0.95, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <coneGeometry args={[1.2, 0.6, 4]} />
            <meshStandardMaterial color="#d4c8b2" roughness={0.85} />
          </mesh>
          {/* Entrance Doorway */}
          <mesh position={[0, -0.1, 0.18]}>
            <boxGeometry args={[0.7, 1.0, 0.04]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Golden Geodesic Emblem */}
          <mesh position={[0, 0.65, 0.19]}>
            <circleGeometry args={[0.18, 16]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>
    );
  }

  // 4. Italian Renaissance Villa (directionId === "italian-language")
  if (isAnnex) {
    return (
      <group position={position} scale={scale} rotation={[0, effectiveRotation, 0]}>
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.2, 1.6]} />
          <meshStandardMaterial color="#d4c8b2" />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 1.1, 1.3]} />
          <meshStandardMaterial color="#fbf5e6" roughness={0.85} />
        </mesh>
        {/* Terracotta hip roof */}
        <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.5, 0.65, 4]} />
          <meshStandardMaterial color="#c2522b" roughness={0.85} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position} scale={scale} rotation={[0, effectiveRotation, 0]} name="italian-renaissance-villa">
      {/* Stone Foundation Plinth */}
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.28, 2.5]} />
        <meshStandardMaterial color="#d4c8b2" roughness={0.9} />
      </mesh>
      {/* Villa Central Palazzo Body */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.75, 2.0]} />
        <meshStandardMaterial color="#fbf5e6" roughness={0.85} />
      </mesh>
      {/* Terracotta Tile Hipped Roof */}
      <mesh position={[0, 2.3, 0]} rotation={[0, Math.PI / 4, 0]} scale={[2.6, 0.9, 1.6]} castShadow>
        <coneGeometry args={[1.3, 0.85, 4]} />
        <meshStandardMaterial color="#c2522b" roughness={0.85} />
      </mesh>
      {/* Portico with Rounded Arches on Front Loggia */}
      {[-0.9, 0, 0.9].map((x, i) => (
        <group key={i} position={[x, 0.8, 1.05]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <torusGeometry args={[0.34, 0.07, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#ede4d2" roughness={0.85} />
          </mesh>
          <mesh position={[-0.34, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.72, 8]} />
            <meshStandardMaterial color="#ede4d2" roughness={0.85} />
          </mesh>
          <mesh position={[0.34, -0.22, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.72, 8]} />
            <meshStandardMaterial color="#ede4d2" roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Symmetrical Renaissance Campanile / Clock Tower */}
      <group position={[1.4, 1.65, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 2.4, 1.05]} />
          <meshStandardMaterial color="#f7eed8" roughness={0.85} />
        </mesh>
        {/* Open Belfry */}
        <mesh position={[0, 1.95, 0]} castShadow>
          <boxGeometry args={[0.9, 0.7, 0.9]} />
          <meshStandardMaterial color="#d4c8b2" roughness={0.8} />
        </mesh>
        {/* Bronze Bell */}
        <mesh position={[0, 1.9, 0]}>
          <cylinderGeometry args={[0.12, 0.22, 0.3, 10]} />
          <meshStandardMaterial color="#a16207" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Terracotta Pyramid Belfry Roof */}
        <mesh position={[0, 2.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.82, 0.95, 4]} />
          <meshStandardMaterial color="#b94a2b" roughness={0.85} />
        </mesh>
        {/* Clock Face tilted slightly up towards player */}
        <mesh position={[0, 1.25, 0.54]} rotation={[-0.2, 0, 0]}>
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// 3. TRANQUIL NATURAL POND & WATER LILIES
// ============================================================================

function IslandPond({
  position = [-5.4, 0.28, -6.8],
  reducedMotion,
}: {
  position?: Point3;
  reducedMotion: boolean;
}) {
  const waterRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (waterRef.current && !reducedMotion) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 1.8) * 0.012;
      waterRef.current.scale.set(pulse, 1, pulse);
    }
  });

  return (
    <group position={position} name="island-tranquil-pond">
      {/* Natural River Pebble Border */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 14;
        const rad = 1.05 + Math.sin(i * 1.7) * 0.12;
        const x = Math.cos(angle) * rad;
        const z = Math.sin(angle) * rad;
        return (
          <mesh
            key={i}
            position={[x, 0.05, z]}
            rotation={[0.2, i, 0.15]}
            scale={[0.18, 0.12, 0.16]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={i % 2 ? "#94a3b8" : "#78716c"} roughness={0.9} />
          </mesh>
        );
      })}

      {/* Shimmering Pond Water Surface */}
      <mesh ref={waterRef} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.98, 24]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.12}
          metalness={0.15}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Floating Lily Pads */}
      {[
        [-0.35, 0.04, -0.2],
        [0.4, 0.04, 0.25],
        [-0.15, 0.04, 0.42],
      ].map(([lx, ly, lz], i) => (
        <group key={i} position={[lx, ly, lz]} rotation={[-Math.PI / 2, 0, i * 1.5]}>
          <circleGeometry args={[0.16, 16, 0, Math.PI * 1.85]} />
          <meshStandardMaterial color="#22c55e" roughness={0.85} side={2} />
        </group>
      ))}

      {/* Water Lily Blossom */}
      <group position={[-0.32, 0.07, -0.18]}>
        <mesh castShadow>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color="#fbcfe8" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <coneGeometry args={[0.035, 0.06, 6]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// 4. ANIMATED CLOUDS & LIVELY FIREFLIES
// ============================================================================

function Cloud({
  position,
  scale,
  reducedMotion,
}: {
  position: Point3;
  scale: number;
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (group.current && !reducedMotion) {
      time.current += Math.min(delta, 0.05);
      group.current.position.x =
        position[0] + Math.sin(time.current * 0.12 + position[2]) * 0.35;
    }
  });

  return (
    <group position={position} scale={scale} ref={group} name="drifting-cloud">
      {[
        [0, 0, 0, 0.85],
        [-0.75, -0.16, 0.05, 0.58],
        [0.72, -0.12, 0.02, 0.62],
        [0.2, 0.35, -0.1, 0.52],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[s, s * 0.76, s * 0.72]} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Fireflies({
  position,
  count = 4,
  reducedMotion,
}: {
  position: Point3;
  count?: number;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const materialsRef = useRef<(import("three").MeshStandardMaterial | null)[]>([]);

  useFrame(({ clock }) => {
    if (groupRef.current && !reducedMotion) {
      const t = clock.getElapsedTime();
      groupRef.current.children.forEach((child, i) => {
        const offset = i * 1.4;
        child.position.x = Math.sin(t * 1.5 + offset) * 0.45;
        child.position.y = 0.4 + Math.sin(t * 2.2 + offset) * 0.18;
        child.position.z = Math.cos(t * 1.3 + offset) * 0.45;

        const mat = materialsRef.current[i];
        if (mat) {
          const glow = (Math.sin(t * 3.5 + offset) + 1) * 0.5;
          mat.emissiveIntensity = 1.0 + glow * 2.2;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position} name="lively-fireflies">
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[(i - 1) * 0.25, 0.4, (i % 2) * 0.2]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            ref={(mat) => {
              materialsRef.current[i] = mat;
            }}
            color="#fef08a"
            emissive="#eab308"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Butterflies({
  position,
  count = 3,
  reducedMotion,
}: {
  position: Point3;
  count?: number;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const wingsRef = useRef<Group[]>([]);

  useFrame(({ clock }) => {
    if (groupRef.current && !reducedMotion) {
      const t = clock.getElapsedTime();
      groupRef.current.children.forEach((butterfly, i) => {
        const offset = i * 2.1;
        const flightRadiusX = 0.55 + (i % 2) * 0.2;
        const flightRadiusZ = 0.45 + ((i + 1) % 2) * 0.15;
        butterfly.position.x = Math.sin(t * 1.6 + offset) * flightRadiusX;
        butterfly.position.y = 0.45 + Math.sin(t * 3.2 + offset) * 0.14;
        butterfly.position.z = Math.cos(t * 1.4 + offset) * flightRadiusZ;
        butterfly.rotation.y = -(t * 1.5 + offset) + Math.PI / 2;
      });

      wingsRef.current.forEach((wingGroup, idx) => {
        if (wingGroup) {
          const side = idx % 2 === 0 ? 1 : -1;
          const flap = Math.sin(clock.getElapsedTime() * 18 + idx) * 0.65;
          wingGroup.rotation.z = side * 0.2 + flap * side;
        }
      });
    }
  });

  const butterflyColors = ["#38bdf8", "#f97316", "#a855f7", "#fbbf24"];

  return (
    <group ref={groupRef} position={position} name="lively-butterflies">
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} position={[(i - 1) * 0.3, 0.45, 0]}>
          {/* Slender thorax */}
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.012, 0.08, 6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {/* Left Wing Group (hinged at thorax) */}
          <group
            ref={(el) => {
              if (el) wingsRef.current[i * 2] = el;
            }}
            position={[-0.015, 0.01, 0]}
          >
            <mesh position={[-0.035, 0, 0]}>
              <boxGeometry args={[0.065, 0.005, 0.05]} />
              <meshStandardMaterial
                color={butterflyColors[i % butterflyColors.length]}
                roughness={0.4}
                side={2}
              />
            </mesh>
          </group>
          {/* Right Wing Group (hinged at thorax) */}
          <group
            ref={(el) => {
              if (el) wingsRef.current[i * 2 + 1] = el;
            }}
            position={[0.015, 0.01, 0]}
          >
            <mesh position={[0.035, 0, 0]}>
              <boxGeometry args={[0.065, 0.005, 0.05]} />
              <meshStandardMaterial
                color={butterflyColors[i % butterflyColors.length]}
                roughness={0.4}
                side={2}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

function CampusGardenBed({
  position,
  scale = 1.0,
  palette = 0,
}: {
  position: Point3;
  scale?: number;
  palette?: number;
}) {
  const flowerColors = [
    ["#f43f5e", "#fb7185", "#fecdd3"],
    ["#eab308", "#facc15", "#fef08a"],
    ["#38bdf8", "#60a5fa", "#bae6fd"],
    ["#a855f7", "#c084fc", "#e9d5ff"],
    ["#f97316", "#fb923c", "#fed7aa"],
  ][palette % 5];

  return (
    <group position={position} scale={scale} name="campus-garden-bed">
      {/* Curved River Stone Border Ring */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 10;
        const rad = 0.65 + Math.sin(i * 1.5) * 0.08;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * rad, 0.04, Math.sin(angle) * rad]}
            rotation={[0.1, i, 0.1]}
            scale={[0.14, 0.08, 0.12]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={i % 2 ? "#94a3b8" : "#cbd5e1"} roughness={0.9} />
          </mesh>
        );
      })}

      {/* Rich Soil Mound */}
      <mesh position={[0, 0.05, 0]} scale={[0.62, 0.12, 0.62]}>
        <sphereGeometry args={[1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#451a03" roughness={1} />
      </mesh>

      {/* Central Lush Shrub Mound */}
      <mesh position={[0, 0.22, 0]} scale={[0.42, 0.28, 0.42]} castShadow receiveShadow>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#65a30d" roughness={0.88} />
      </mesh>

      {/* Flanking Shrub Lobes */}
      <mesh position={[-0.22, 0.16, 0.14]} scale={[0.26, 0.2, 0.24]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
      </mesh>
      <mesh position={[0.24, 0.17, -0.16]} scale={[0.28, 0.22, 0.26]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#84cc16" roughness={0.85} />
      </mesh>

      {/* Clusters of Blossoming Flowers */}
      {[
        [-0.28, 0.24, -0.18, 0],
        [0.26, 0.25, 0.16, 1],
        [-0.05, 0.36, 0.22, 2],
        [0.18, 0.34, -0.2, 0],
        [-0.2, 0.28, 0.28, 1],
      ].map(([fx, fy, fz, cIdx], j) => (
        <group key={j} position={[fx, fy, fz]}>
          <mesh castShadow>
            <sphereGeometry args={[0.055, 6, 6]} />
            <meshStandardMaterial color={flowerColors[cIdx as number]} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============================================================================
// 5. CAMPUS AMENITIES: STREETLAMPS, STONE BENCHES, CLIFF FENCES
// ============================================================================

function ParkStreetlamp({ position = [0, 0.28, 0] }: { position?: Point3 }) {
  return (
    <group position={position} name="campus-streetlamp">
      {/* Stone base */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.16, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* Bronze post */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 1.6, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lantern housing */}
      <mesh position={[0, 1.82, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.08, 0.22, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Glowing Warm Light Core */}
      <mesh position={[0, 1.82, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#fde047"
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>
      {/* Roof cap */}
      <mesh position={[0, 1.96, 0]} castShadow>
        <coneGeometry args={[0.18, 0.12, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
    </group>
  );
}

function StoneCampusBench({
  position = [0, 0.28, 0],
  rotation = 0,
}: {
  position?: Point3;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation + Math.PI, 0]} name="campus-bench">
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.16, 0]} castShadow>
          <boxGeometry args={[0.14, 0.32, 0.35]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.85} />
        </mesh>
      ))}
      {/* Polished bench seat slab */}
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[1.4, 0.07, 0.42]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
      </mesh>
    </group>
  );
}

function CliffsideFence({
  position = [0, 0.28, 0],
  rotation = 0,
}: {
  position?: Point3;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation + Math.PI, 0]} name="cliffside-fence">
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 0.6, 6]} />
          <meshStandardMaterial color="#785338" roughness={0.9} />
        </mesh>
      ))}
      {/* Top & bottom rails */}
      {[0.22, 0.46].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 1.35, 6]} />
          <meshStandardMaterial color="#8c6237" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================================
// 6. MAIN ENVIRONMENT COMPONENT
// ============================================================================

export const Environment = memo(function Environment({
  data,
  reducedMotion,
}: {
  data: LearningWorldData;
  reducedMotion: boolean;
}) {
  // Multi-layered extruded terrain
  const terrain = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-4, -9.6);
    shape.bezierCurveTo(-7.7, -8.7, -6.4, -3.5, -6.4, 0);
    shape.bezierCurveTo(-7, 4.7, -5.6, 9.7, -1.1, 10.1);
    shape.bezierCurveTo(4, 10.8, 6.1, 8.4, 6.2, 3.5);
    shape.bezierCurveTo(6.7, -2, 6.3, -8.9, 3.5, -9.7);
    shape.bezierCurveTo(1, -10.6, -1.7, -10.1, -4, -9.6);
    return new ExtrudeGeometry(shape, {
      depth: 0.45,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.24,
      bevelThickness: 0.19,
      curveSegments: 16,
    });
  }, []);

  return (
    <group name="university-environment">
      {/* Lighting Rig */}
      <ambientLight intensity={0.65} color="#fffdf5" />
      <hemisphereLight args={["#e8f3ff", "#7cae58", 0.65]} />
      <directionalLight
        position={[-8, 16, 9]}
        intensity={2.5}
        color="#fff2d6"
        castShadow
        shadow-mapSize={[worldConfig.shadowSize, worldConfig.shadowSize]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-normalBias={0.035}
        shadow-bias={-0.0002}
        shadow-radius={3}
      />
      <directionalLight
        position={[7, 8, -8]}
        intensity={0.5}
        color="#d1e7ff"
      />

      {/* Layer 1: Lush Grass Island Surface (Expanded Island Scale) */}
      <mesh
        geometry={terrain}
        position={[0, -0.36, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.28, 1.28, 1]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#64a638" roughness={0.94} />
      </mesh>

      {/* Layer 2: Coastal Sand Shelf Lip */}
      <mesh
        geometry={terrain}
        position={[0, -0.46, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.28 * 1.045, 1.28 * 1.035, 1.1]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#ebd8ab" roughness={0.96} />
      </mesh>

      {/* Layer 3: Stylized Bedrock Strata (Upper Cliff Rock) */}
      <mesh
        geometry={terrain}
        position={[0, -0.95, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.28 * 1.025, 1.28 * 1.017, 1.45]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#b8a780" roughness={1} />
      </mesh>

      {/* Layer 4: Deep Bedrock Strata (Darker Cliff Base) */}
      <mesh
        geometry={terrain}
        position={[0, -1.45, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.28 * 1.04, 1.28 * 1.03, 1.8]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#78664e" roughness={1} />
      </mesh>

      {/* Deep Ocean Water Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.19, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={worldConfig.background}
          emissive={worldConfig.background}
          emissiveIntensity={0.22}
          roughness={1}
        />
      </mesh>

      {/* Tranquil Island Pond in Serene Cove */}
      <IslandPond position={[-5.2, 0.28, -7.0]} reducedMotion={reducedMotion} />

      {/* Rich Tree Forest Distributions */}
      {data.trees.map((tree, i) => (
        <Tree
          key={`tree-${i}`}
          position={tree.position}
          scale={tree.scale}
          variant={tree.variant}
          reducedMotion={reducedMotion}
        />
      ))}

      {/* Discipline-Specific Campus Buildings */}
      {data.buildings.map((building, i) => (
        <CampusBuilding
          key={`building-${i}`}
          building={building}
          directionId={data.directionId}
        />
      ))}

      {/* Thematic Scenery per Island */}
      {data.directionId === "ai-ml" && <AIScenery />}
      {data.directionId === "physics-engineering" && <PhysicsScenery />}
      {data.directionId === "mathematics" && <MathScenery />}
      {data.directionId === "italian-language" && <ItalianScenery />}

      {/* Curated Botanical Garden Beds & Flower Plazas */}
      {[
        { pos: [-3.4, 0.28, 2.7], pal: 0 },
        { pos: [3.1, 0.28, 2.8], pal: 1 },
        { pos: [2.5, 0.28, 0.5], pal: 2 },
        { pos: [-5.8, 0.28, -3.8], pal: 3 },
      ].map((bed, idx) => (
        <CampusGardenBed
          key={`garden-bed-${idx}`}
          position={bed.pos as Point3}
          palette={bed.pal}
          scale={0.95}
        />
      ))}

      {/* Lively Animated Butterflies Flitting Over Campus Gardens */}
      <Butterflies position={[-3.4, 0.45, 2.7]} count={3} reducedMotion={reducedMotion} />
      <Butterflies position={[3.1, 0.45, 2.8]} count={3} reducedMotion={reducedMotion} />

      {/* Decorative Mossy Rocks */}
      {[
        [-5.8, 0.28, -5.2],
        [5.5, 0.26, -3.4],
        [3.8, 0.28, -8.4],
        [4.2, 0.24, 7.2],
      ].map((p, i) => (
        <group key={`rock-${i}`} position={p as Point3}>
          <mesh
            rotation={[0.2, i * 1.2, 0.1]}
            scale={[0.48, 0.32, 0.4]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.95} />
          </mesh>
          {/* Moss Cap */}
          <mesh position={[0, 0.22, 0]} scale={[0.38, 0.1, 0.32]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#65a30d" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Stepping Stones leading to courtyard promenade */}
      {[
        [-2.2, 0.28, 4.8],
        [-2.5, 0.28, 4.8],
        [-2.8, 0.28, 4.8],
      ].map((pos, i) => (
        <mesh key={`step-${i}`} position={pos as Point3} rotation={[-Math.PI / 2, 0, i * 0.4]} receiveShadow>
          <circleGeometry args={[0.18, 10]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>
      ))}

      {/* Lively Fireflies near Nature Areas */}
      <Fireflies position={[-5.2, 0.28, -7.0]} count={4} reducedMotion={reducedMotion} />
      <Fireflies position={[2.5, 0.28, 0.5]} count={3} reducedMotion={reducedMotion} />

      {/* Campus Streetlamps */}
      <ParkStreetlamp position={[-2.6, 0.28, -3.8]} />
      <ParkStreetlamp position={[3.2, 0.28, 1.2]} />

      {/* Stone Campus Benches */}
      <StoneCampusBench position={[5.5, 0.28, -0.8]} rotation={-0.4} />
      <StoneCampusBench position={[-5.7, 0.28, 0.0]} rotation={0.35} />

      {/* Cliffside Wooden Fences along Island Edge */}
      <CliffsideFence position={[-6.0, 0.28, -1.2]} rotation={0.15} />
      <CliffsideFence position={[5.7, 0.28, 1.4]} rotation={-0.2} />

      {/* Atmospheric Drifting Clouds */}
      <Cloud
        position={[-5.7, 3.8, -5.5]}
        scale={1.25}
        reducedMotion={reducedMotion}
      />
      <Cloud
        position={[5.5, 4.4, 1.4]}
        scale={1.15}
        reducedMotion={reducedMotion}
      />
      <Cloud
        position={[-4.5, 2.6, 8.8]}
        scale={0.88}
        reducedMotion={reducedMotion}
      />
    </group>
  );
});
