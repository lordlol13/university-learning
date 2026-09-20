"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

/**
 * Procedural 3D Scenery for the Mathematics & Logic World:
 * - SineWaveRibbon: Undulating continuous sinusoidal surface
 * - GoldenSpiral: 3D Logarithmic Fibonacci spiral ribbon
 * - FloatingPolyhedra: Wireframe and solid geometric platonic solids (Icosahedron & Octahedron)
 */

function SineWaveRibbon({ position = [-3.8, 1.2, 0.5] }: { position?: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * 1.5;
      meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Function axis base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>
      {/* 3D Wave ribbon steps */}
      {Array.from({ length: 24 }).map((_, i) => {
        const x = (i - 12) * 0.13;
        const y = Math.sin(i * 0.4) * 0.45;
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, Math.cos(i * 0.4) * 0.35]}>
            <boxGeometry args={[0.11, 0.05, 0.45]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function GoldenSpiral({ position = [3.6, 1.4, -4.5] }: { position?: [number, number, number] }) {
  const groupRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
    }
  });

  const points = useMemo(() => {
    const pts = [];
    const a = 0.08;
    const b = 0.14;
    for (let theta = 0; theta < Math.PI * 4; theta += 0.3) {
      const r = a * Math.exp(b * theta);
      pts.push({
        x: r * Math.cos(theta),
        y: (theta / (Math.PI * 4)) * 1.2,
        z: r * Math.sin(theta),
        scale: 0.05 + (theta / 15) * 0.09,
      });
    }
    return pts;
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Pedestal */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.4, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {/* Fibonacci spiral nodes */}
      {points.map((p, i) => (
        <mesh key={i} position={[p.x, p.y - 0.2, p.z]}>
          <sphereGeometry args={[p.scale, 8, 8]} />
          <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingPolyhedra({ position = [-2.8, 2.2, 5.2] }: { position?: [number, number, number] }) {
  const icoRef = useRef<Mesh>(null);
  const octRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (icoRef.current) {
      icoRef.current.rotation.x = t * 0.5;
      icoRef.current.rotation.y = t * 0.7;
      icoRef.current.position.y = 1.1 + Math.sin(t * 1.2) * 0.15;
    }
    if (octRef.current) {
      octRef.current.rotation.x = -t * 0.6;
      octRef.current.rotation.z = t * 0.4;
      octRef.current.position.y = 0.4 + Math.cos(t * 1.1) * 0.12;
    }
  });

  return (
    <group position={position}>
      {/* Stone pedestal */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.9, 0.35, 0.9]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>
      {/* Floating rotating Icosahedron */}
      <mesh ref={icoRef} position={[0, 1.1, 0]}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.4} wireframe />
      </mesh>
      {/* Floating rotating Octahedron */}
      <mesh ref={octRef} position={[0.55, 0.4, 0.3]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

export function MathScenery() {
  return (
    <group name="math-scenery">
      <SineWaveRibbon position={[-3.8, 1.1, 0.2]} />
      <GoldenSpiral position={[3.6, 1.2, -4.5]} />
      <FloatingPolyhedra position={[-3.2, 1.4, 4.8]} />
    </group>
  );
}

/**
 * Procedural 3D Scenery for the Italian Language & Culture World:
 * - RomanArches: Classic Roman stone triumphal arcade & aqueduct portal
 * - CampanileTower: Italian Piazza clock and bell tower with terracotta tiled roof
 * - TerracottaPlanters: Mediterranean terracotta planters and cypress aesthetic
 */

function RomanArches({ position = [3.8, 0.8, -3.8], rotation = 0.3 }: { position?: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={0.85}>
      {/* Stone base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[4.2, 0.22, 1.1]} />
        <meshStandardMaterial color="#d4c5ab" roughness={0.9} />
      </mesh>
      {/* 3 Columns */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 1.15, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 1.9, 12]} />
          <meshStandardMaterial color="#ede4d0" roughness={0.85} />
        </mesh>
      ))}
      {/* Entablature beam */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[4.3, 0.35, 1.2]} />
        <meshStandardMaterial color="#ded2bd" roughness={0.85} />
      </mesh>
      {/* Attic frieze with Italian decorative strip */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[3.8, 0.28, 0.9]} />
        <meshStandardMaterial color="#cbb89d" roughness={0.9} />
      </mesh>
      {/* Dual Arches over bays */}
      {[-0.75, 0.75].map((x, i) => (
        <mesh key={i} position={[x, 1.85, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.55, 0.12, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#ede4d0" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function CampanileTower({ position = [-4.3, 1.8, -4.2] }: { position?: [number, number, number] }) {
  return (
    <group position={position} scale={0.9}>
      {/* Tower base */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.4, 2.2, 1.4]} />
        <meshStandardMaterial color="#d9cbaf" roughness={0.88} />
      </mesh>
      {/* Tower upper body */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[1.25, 1.6, 1.25]} />
        <meshStandardMaterial color="#e5d9c2" roughness={0.85} />
      </mesh>
      {/* Belfry with open arches */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[1.1, 0.8, 1.1]} />
        <meshStandardMaterial color="#c8b598" roughness={0.8} />
      </mesh>
      {/* Bronze bell inside */}
      <mesh position={[0, 3.15, 0]}>
        <cylinderGeometry args={[0.16, 0.28, 0.35, 12]} />
        <meshStandardMaterial color="#a16207" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Terracotta pyramid roof */}
      <mesh position={[0, 4.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.05, 1.2, 4]} />
        <meshStandardMaterial color="#b94a2b" roughness={0.85} />
      </mesh>
      {/* Clock face on front */}
      <mesh position={[0, 2.3, 0.64]}>
        <circleGeometry args={[0.26, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
    </group>
  );
}

function PiazzaPlanters({ position = [-3.4, 0.4, 2.5] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Terracotta Pot */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.32, 0.2, 0.55, 12]} />
        <meshStandardMaterial color="#c25e36" roughness={0.9} />
      </mesh>
      {/* Olive / Citrus foliage */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.42, 10, 8]} />
        <meshStandardMaterial color="#55753b" roughness={0.85} />
      </mesh>
    </group>
  );
}

export function ItalianScenery() {
  return (
    <group name="italian-scenery">
      <RomanArches position={[3.8, 0.6, -3.8]} rotation={-0.2} />
      <CampanileTower position={[-4.5, 0.8, -4.6]} />
      <PiazzaPlanters position={[-3.4, 0.3, 3.2]} />
      <PiazzaPlanters position={[3.6, 0.3, 4.1]} />
    </group>
  );
}
