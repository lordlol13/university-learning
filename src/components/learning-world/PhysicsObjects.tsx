"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * 1. 3D Vector Coordinate Gimbal:
 * Orthogonal basis vectors i (red), j (green), k (blue) on a pedestal,
 * rotating smoothly to demonstrate 3D Cartesian coordinates & the Right-Hand Rule.
 */
export function VectorGimbal({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const gimbalRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (gimbalRef.current) {
      gimbalRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Stone Pedestal */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.75, 0.9, 0.5, 16]} />
        <meshStandardMaterial color="#c2b59b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.15, 16]} />
        <meshStandardMaterial color="#8c7d67" roughness={0.8} />
      </mesh>

      {/* Rotating Coordinate Gimbal */}
      <group ref={gimbalRef} position={[0, 1.2, 0]}>
        {/* Center Pivot Sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* X-axis: i (Red) */}
        <group rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.0, 12]} />
            <meshStandardMaterial color="#e04d4d" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.08, 0]} castShadow>
            <coneGeometry args={[0.12, 0.26, 12]} />
            <meshStandardMaterial color="#ff2d2d" roughness={0.3} />
          </mesh>
        </group>

        {/* Y-axis: j (Green) */}
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.0, 12]} />
            <meshStandardMaterial color="#38a169" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.08, 0]} castShadow>
            <coneGeometry args={[0.12, 0.26, 12]} />
            <meshStandardMaterial color="#2f855a" roughness={0.3} />
          </mesh>
        </group>

        {/* Z-axis: k (Blue) */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 1.0, 12]} />
            <meshStandardMaterial color="#3182ce" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.08, 0]} castShadow>
            <coneGeometry args={[0.12, 0.26, 12]} />
            <meshStandardMaterial color="#2b6cb0" roughness={0.3} />
          </mesh>
        </group>

        {/* Orbital Unit Magnitude Ring */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.95, 0.015, 12, 36]} />
          <meshStandardMaterial color="#ecc94b" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 2. Newton's Cradle / Harmonic Pendulum:
 * Suspended metal spheres oscillating with momentum conservation.
 */
export function NewtonsCradle({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const leftBobRef = useRef<Group>(null);
  const rightBobRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 4.5;
    const cycle = Math.sin(t);

    if (leftBobRef.current && rightBobRef.current) {
      if (cycle > 0) {
        leftBobRef.current.rotation.z = cycle * 0.48;
        rightBobRef.current.rotation.z = 0;
      } else {
        leftBobRef.current.rotation.z = 0;
        rightBobRef.current.rotation.z = cycle * 0.48;
      }
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Wooden / Mahogany Base */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.24, 0.9]} />
        <meshStandardMaterial color="#4a2c11" roughness={0.7} />
      </mesh>

      {/* Chrome Arch Pillars */}
      {[-0.6, 0.6].map((x, i) => (
        <group key={i} position={[x, 0.24, 0]}>
          {/* Front & Back vertical posts */}
          <mesh position={[0, 0.65, -0.38]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.3, 10]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.65, 0.38]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.3, 10]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Top rail */}
          <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.8, 10]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* 5 Suspended Spheres */}
      {/* Left-most swinging bob */}
      <group ref={leftBobRef} position={[-0.32, 1.54, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.9, 6]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.9, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>

      {/* Middle static bobs */}
      {[-0.16, 0, 0.16].map((x, i) => (
        <group key={i} position={[x, 1.54, 0]}>
          <mesh position={[0, -0.45, 0]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.9, 6]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.9, 0]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Right-most swinging bob */}
      <group ref={rightBobRef} position={[0.32, 1.54, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.9, 6]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.9, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 3. Inclined Plane with Mass Block & Force Vectors:
 * The quintessential mechanics experiment showing Normal Force & Gravity vectors.
 */
export function InclinedPlane({
  position = [0, 0, 0],
  scale = 1,
  rotation = 0,
}: {
  position?: [number, number, number];
  scale?: number;
  rotation?: number;
}) {
  const theta = Math.PI / 6; // 30-degree incline

  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Stone Platform Base */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[2.2, 0.2, 1.4]} />
        <meshStandardMaterial color="#c2b59b" roughness={0.85} />
      </mesh>

      {/* Incline Wedge */}
      <group position={[-0.4, 0.2, 0]}>
        {/* Angled Ramp surface */}
        <mesh position={[0.5, 0.35, 0]} rotation={[0, 0, -theta]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.12, 1.0]} />
          <meshStandardMaterial color="#d4b483" roughness={0.7} />
        </mesh>

        {/* Support block under the ramp */}
        <mesh position={[1.1, 0.35, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.95]} />
          <meshStandardMaterial color="#a78b67" roughness={0.8} />
        </mesh>

        {/* Mass Block on Incline */}
        <group position={[0.4, 0.6, 0]} rotation={[0, 0, -theta]}>
          <mesh position={[0, 0.16, 0]} castShadow>
            <boxGeometry args={[0.34, 0.32, 0.34]} />
            <meshStandardMaterial color="#4b5563" roughness={0.6} metalness={0.3} />
          </mesh>

          {/* Normal Force Vector (perpendicular to surface, cyan/blue) */}
          <group position={[0, 0.32, 0]}>
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.56, 8]} />
              <meshStandardMaterial color="#0ea5e9" />
            </mesh>
            <mesh position={[0, 0.62, 0]}>
              <coneGeometry args={[0.07, 0.16, 8]} />
              <meshStandardMaterial color="#0284c7" />
            </mesh>
          </group>

          {/* Gravity Vector (straight downward in world frame) */}
          <group rotation={[0, 0, theta]}>
            <mesh position={[0, -0.28, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.56, 8]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, -0.62, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.07, 0.16, 8]} />
              <meshStandardMaterial color="#dc2626" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * 4. Water Equivalency Measurement Station:
 * 1 dm³ Metric Cube & Calibrated Beaker representing the 1 dm³ = 1 L = 1 kg macro bridge.
 */
export function WaterEquivalencyStation({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Lab Station Table */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.4, 1.1]} />
        <meshStandardMaterial color="#78716c" roughness={0.7} />
      </mesh>

      {/* 1 dm³ Metric Cube (Translucent Blue Glass / Water) */}
      <group position={[-0.45, 0.72, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.65, 0.65]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.7}
            roughness={0.15}
            metalness={0.1}
          />
        </mesh>
        {/* Solid Brass Frame on Cube Edges */}
        <mesh>
          <boxGeometry args={[0.66, 0.66, 0.66]} />
          <meshStandardMaterial color="#f59e0b" wireframe />
        </mesh>
      </group>

      {/* Calibrated Beaker / Cylinder (1 Liter) */}
      <group position={[0.45, 0.4, 0]}>
        {/* Glass Cylinder */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.9, 16, 1, true]} />
          <meshStandardMaterial
            color="#e0f2fe"
            transparent
            opacity={0.45}
            roughness={0.1}
          />
        </mesh>
        {/* Liquid level */}
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.72, 16]} />
          <meshStandardMaterial
            color="#0284c7"
            transparent
            opacity={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Base of beaker */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.24, 0.25, 0.04, 16]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 5. Analytical Balance Scale:
 * Classic dual-pan brass scale demonstrating invariant mass vs gravitational weight.
 */
export function BalanceScale({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const beamRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (beamRef.current) {
      beamRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.06;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Heavy Plinth */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.24, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Central Brass Pillar */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 1.2, 12]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Tilting Balance Beam */}
      <group ref={beamRef} position={[0, 1.42, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 12]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Left Pan */}
        <group position={[-0.65, 0, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.64, 6]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0, -0.65, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.05, 0.08, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* 1 kg Brass Calibration Weight */}
          <mesh position={[0, -0.56, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.16, 12]} />
            <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* Right Pan */}
        <group position={[0.65, 0, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.64, 6]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0, -0.65, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.05, 0.08, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Newton Force Weights */}
          <mesh position={[0, -0.57, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.14, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * Composite PhysicsScenery Component:
 * Places all 5 special physics objects along the Physics & Engineering Island.
 */
export function PhysicsScenery() {
  return (
    <group name="physics-scenery">
      {/* 1. Vector Gimbal - prominent position near the road loop center */}
      <VectorGimbal position={[-0.8, 0.28, -2.4]} scale={0.95} />

      {/* 2. Newton's Cradle - mechanics lab terrace */}
      <NewtonsCradle position={[3.2, 0.28, -4.8]} scale={0.9} />

      {/* 3. Inclined Plane with Force Vectors */}
      <InclinedPlane position={[-3.8, 0.28, 0.4]} scale={0.88} rotation={0.3} />

      {/* 4. Water Equivalency Station (1 dm³ = 1 L = 1 kg) */}
      <WaterEquivalencyStation position={[3.8, 0.28, 3.8]} scale={0.85} />

      {/* 5. Analytical Balance Scale */}
      <BalanceScale position={[-2.9, 0.28, 5.2]} scale={0.88} />
    </group>
  );
}
