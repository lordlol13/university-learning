"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, type Mesh } from "three";
import type { Point3 } from "@/types/learning-world";

/**
 * Procedural Mountain Mounds, Rolling Knolls, and Alpine Summits:
 * Creates realistic, varied elevation and topography across the enlarged islands.
 */
export function MountainMounds() {
  /* ── Central Mountain Peak ── */
  const centralPeak = useMemo(
    () => ({
      position: [0.5, 0.3, -6.5] as Point3,
      // Wide grassy base, tall rocky mid, snow cap
      baseSc: [4.2, 2.8, 4.2] as [number, number, number],
      midSc: [2.8, 3.8, 2.8] as [number, number, number],
      capSc: [1.2, 1.6, 1.2] as [number, number, number],
    }),
    [],
  );

  /* ── Rocky cliff ridges around the island perimeter ── */
  const cliffs = useMemo(
    () => [
      // West coast cliffs
      { pos: [-7.8, 0.1, -4.0] as Point3, sc: [1.8, 2.2, 2.5], rot: 0.4 },
      { pos: [-8.0, 0.1, 1.0] as Point3, sc: [1.6, 1.8, 2.2], rot: 0.7 },
      { pos: [-7.0, 0.1, 5.5] as Point3, sc: [1.5, 1.6, 2.0], rot: 0.2 },
      // East coast cliffs
      { pos: [7.5, 0.1, -3.0] as Point3, sc: [1.7, 2.0, 2.3], rot: -0.5 },
      { pos: [7.8, 0.1, 2.5] as Point3, sc: [1.5, 1.9, 2.0], rot: -0.3 },
      { pos: [7.0, 0.1, 7.0] as Point3, sc: [1.4, 1.5, 1.8], rot: -0.8 },
      // North headlands
      { pos: [-3.5, 0.1, -10.5] as Point3, sc: [2.0, 2.0, 1.8], rot: 0.1 },
      { pos: [3.5, 0.1, -10.0] as Point3, sc: [1.8, 1.8, 1.6], rot: -0.2 },
      // South coast
      { pos: [-3.5, 0.1, 11.0] as Point3, sc: [1.6, 1.4, 1.8], rot: 0.5 },
      { pos: [3.0, 0.1, 11.5] as Point3, sc: [1.5, 1.3, 1.6], rot: -0.4 },
    ],
    [],
  );

  /* ── Interior grassy knolls creating elevation terraces ── */
  const rollingKnolls = useMemo(
    () => [
      // Mid-island plateau mounds
      { position: [-3.2, 0.25, -3.0] as Point3, scale: [2.2, 1.2, 2.0], color: "#6ca83f" },
      { position: [3.5, 0.25, -2.5] as Point3, scale: [2.0, 1.0, 1.8], color: "#74b344" },
      { position: [-2.0, 0.25, 2.5] as Point3, scale: [1.8, 0.8, 1.6], color: "#669f3a" },
      { position: [2.5, 0.25, 3.0] as Point3, scale: [1.6, 0.7, 1.5], color: "#76b547" },
      // Lower elevation mounds toward south beach
      { position: [-1.5, 0.2, 7.0] as Point3, scale: [2.0, 0.5, 1.8], color: "#6da940" },
      { position: [2.0, 0.2, 8.0] as Point3, scale: [1.8, 0.45, 1.6], color: "#6da83f" },
      // Shoulder mounds flanking the central peak
      { position: [-2.5, 0.3, -7.5] as Point3, scale: [2.5, 1.8, 2.2], color: "#5a9638" },
      { position: [3.0, 0.3, -7.0] as Point3, scale: [2.2, 1.5, 2.0], color: "#68a641" },
    ],
    [],
  );

  return (
    <group name="mountain-mounds">
      {/* ── Grand Central Mountain ── */}
      <group position={centralPeak.position}>
        {/* Wide grassy base slope */}
        <mesh position={[0, centralPeak.baseSc[1] * 0.42, 0]} scale={centralPeak.baseSc} castShadow receiveShadow>
          <coneGeometry args={[1, 1, 8]} />
          <meshStandardMaterial color="#5a9638" roughness={0.95} flatShading />
        </mesh>
        {/* Rocky mid-section */}
        <mesh position={[0, centralPeak.baseSc[1] * 0.65 + centralPeak.midSc[1] * 0.35, 0]} scale={centralPeak.midSc} castShadow receiveShadow>
          <coneGeometry args={[1, 1, 7]} />
          <meshStandardMaterial color="#5e6b64" roughness={0.88} flatShading />
        </mesh>
        {/* Snow / ice peak cap */}
        <mesh position={[0, centralPeak.baseSc[1] * 0.65 + centralPeak.midSc[1] * 0.7 + centralPeak.capSc[1] * 0.3, 0]} scale={centralPeak.capSc} castShadow>
          <coneGeometry args={[1, 1, 6]} />
          <meshStandardMaterial color="#e8f0ed" roughness={0.78} flatShading />
        </mesh>
      </group>

      {/* ── Perimeter Rocky Cliffs ── */}
      {cliffs.map((c, i) => (
        <group key={`cliff-${i}`} position={c.pos as Point3} rotation={[0, c.rot, 0]}>
          {/* Main cliff face — angular rock */}
          <mesh position={[0, c.sc[1] * 0.4, 0]} scale={c.sc as [number, number, number]} castShadow receiveShadow>
            <coneGeometry args={[1, 1, 5]} />
            <meshStandardMaterial color="#4a5568" roughness={0.92} flatShading />
          </mesh>
          {/* Grassy cliff-top cap */}
          <mesh position={[0, c.sc[1] * 0.25, 0]} scale={[c.sc[0] * 1.15, c.sc[1] * 0.5, c.sc[2] * 1.15]} castShadow receiveShadow>
            <coneGeometry args={[1, 1, 5]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#5a9638" : "#68a641"} roughness={0.95} flatShading />
          </mesh>
        </group>
      ))}

      {/* ── Interior Grassy Elevation Knolls ── */}
      {rollingKnolls.map((k, i) => (
        <mesh key={`knoll-${i}`} position={k.position} scale={k.scale as [number, number, number]} castShadow receiveShadow>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={k.color} roughness={0.94} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Multi-tiered clouds concentrated at the ends and bottom cliff drops of the island:
 * Creates the majestic fantasy of a floating campus perched above the sky.
 */
export function IslandClouds({ reducedMotion }: { reducedMotion?: boolean }) {
  const cloudGroup = useRef<Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (cloudGroup.current && !reducedMotion) {
      time.current += Math.min(delta, 0.05);
      cloudGroup.current.position.x = Math.sin(time.current * 0.12) * 0.28;
      cloudGroup.current.position.z = Math.cos(time.current * 0.08) * 0.22;
    }
  });

  const cloudFormations = useMemo(
    () => [
      // Mountain Peak Wisps — wrapping around the central summit
      { pos: [-1.5, 5.2, -7.0] as Point3, scale: 1.6 },
      { pos: [2.2, 4.8, -6.8] as Point3, scale: 1.4 },
      { pos: [0.5, 5.8, -7.5] as Point3, scale: 1.2 },
      { pos: [-2.5, 4.4, -5.8] as Point3, scale: 1.3 },
      { pos: [3.0, 4.6, -5.5] as Point3, scale: 1.1 },

      // Mid-altitude drifting clouds over the island
      { pos: [-5.0, 3.5, -2.0] as Point3, scale: 1.5 },
      { pos: [5.5, 3.8, 0.5] as Point3, scale: 1.4 },
      { pos: [-3.0, 3.2, 4.0] as Point3, scale: 1.2 },

      // Low horizon clouds at ocean level edges
      { pos: [-10.0, 1.5, -5.0] as Point3, scale: 2.0 },
      { pos: [10.0, 1.2, 3.0] as Point3, scale: 1.8 },
      { pos: [0.0, 1.4, 14.0] as Point3, scale: 1.6 },
    ],
    [],
  );

  return (
    <group ref={cloudGroup} name="island-end-clouds">
      {cloudFormations.map((c, idx) => (
        <group key={`cloud-cluster-${idx}`} position={c.pos} scale={c.scale}>
          {[
            [0, 0, 0, 0.78],
            [-0.65, -0.12, 0.1, 0.52],
            [0.62, -0.15, -0.05, 0.55],
            [0.18, 0.28, 0.05, 0.44],
            [-0.22, 0.22, -0.1, 0.46],
          ].map(([x, y, z, s], j) => (
            <mesh key={j} position={[x, y, z]} scale={[s, s * 0.76, s * 0.78]}>
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.96}
                opacity={0.95}
                transparent
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/**
 * Animated Cascading Waterdrops & Floating Luminous Dewdrops:
 * 1. Cliffside spring with animated falling water droplets cascading off the island into the sky.
 * 2. Floating dewdrops gently bobbing near the island greenery.
 */
export function WaterDrops({ reducedMotion }: { reducedMotion?: boolean }) {
  // Animated falling water droplets
  const dropRefs = useRef<(Mesh | null)[]>([]);
  // Floating dewdrops
  const dewRefs = useRef<(Mesh | null)[]>([]);

  // 12 cascading falling drops
  const drops = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        initY: 0.1 - (i * 0.18),
        speed: 1.8 + (i % 5) * 0.25,
        offset: [
          -6.8 + (Math.sin(i * 1.5) * 0.22),
          1.8 + (Math.cos(i * 1.2) * 0.28),
        ] as [number, number],
        scale: 0.05 + (i % 3) * 0.02,
      })),
    [],
  );

  // 10 floating dewdrops around the campus
  const dewdrops = useMemo(
    () => [
      { pos: [-4.2, 1.2, -3.2] as Point3, s: 0.08, phase: 0 },
      { pos: [-5.6, 1.5, 0.8] as Point3, s: 0.11, phase: 1.2 },
      { pos: [4.8, 1.4, -4.2] as Point3, s: 0.09, phase: 2.1 },
      { pos: [5.2, 1.1, 2.5] as Point3, s: 0.1, phase: 3.4 },
      { pos: [-3.8, 1.3, 6.2] as Point3, s: 0.07, phase: 4.5 },
      { pos: [3.9, 1.2, 5.8] as Point3, s: 0.08, phase: 0.8 },
      { pos: [-6.4, 0.9, -6.5] as Point3, s: 0.12, phase: 2.6 },
      { pos: [6.1, 1.0, -1.2] as Point3, s: 0.09, phase: 1.9 },
    ],
    [],
  );

  useFrame(({ clock }, delta) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();

    // Animate falling drops off the cliff
    dropRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.y -= delta * drops[i].speed;
      // Loop back to top cliff height when fallen below cliff
      if (mesh.position.y < -3.2) {
        mesh.position.y = 0.2;
      }
    });

    // Bobbing floating dewdrops
    dewRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const initial = dewdrops[i].pos[1];
      mesh.position.y = initial + Math.sin(t * 2.2 + dewdrops[i].phase) * 0.12;
    });
  });

  return (
    <group name="water-features">
      {/* 1. Mountain Waterfall — cascading from central peak cliff face */}
      <group position={[1.5, 0.3, -3.5]}>
        {/* Cliff ledge where water springs from */}
        <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.3, 0.8]} />
          <meshStandardMaterial color="#5e6b64" roughness={0.92} />
        </mesh>
        {/* Pool at waterfall base */}
        <mesh position={[0, 0.05, 0.6]} receiveShadow>
          <cylinderGeometry args={[1.2, 1.4, 0.15, 20]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.12}
            metalness={0.25}
            transparent
            opacity={0.82}
          />
        </mesh>
        {/* Pool stone rim */}
        <mesh position={[0, 0.02, 0.6]} receiveShadow>
          <cylinderGeometry args={[1.4, 1.55, 0.12, 20]} />
          <meshStandardMaterial color="#7a857a" roughness={0.88} />
        </mesh>
        {/* Main waterfall stream — tall vertical water column */}
        <mesh position={[0, 1.4, 0.3]}>
          <cylinderGeometry args={[0.18, 0.35, 2.6, 10]} />
          <meshStandardMaterial
            color="#7dd3fc"
            transparent
            opacity={0.65}
            roughness={0.08}
            metalness={0.15}
          />
        </mesh>
        {/* Secondary thinner stream */}
        <mesh position={[0.3, 1.5, 0.25]}>
          <cylinderGeometry args={[0.08, 0.15, 2.3, 8]} />
          <meshStandardMaterial
            color="#bae6fd"
            transparent
            opacity={0.5}
            roughness={0.1}
          />
        </mesh>
        {/* Mist at waterfall base */}
        {[-0.4, 0, 0.4].map((dx, i) => (
          <mesh key={`mist-${i}`} position={[dx, 0.4, 0.6]} scale={[0.6, 0.35, 0.5]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.25}
              roughness={1}
            />
          </mesh>
        ))}

        {/* Wooden Bridge spanning the pool outflow */}
        <group position={[0, 0.22, 1.6]}>
          {/* Bridge deck planks */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.08, 0.7]} />
            <meshStandardMaterial color="#8b6237" roughness={0.85} />
          </mesh>
          {/* Railing posts */}
          {[-0.95, -0.35, 0.35, 0.95].map((x, i) => (
            <mesh key={`post-${i}`} position={[x, 0.28, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
              <meshStandardMaterial color="#6d4c2a" roughness={0.9} />
            </mesh>
          ))}
          {/* Railing beams */}
          {[-1, 1].map((side) => (
            <mesh key={`rail-${side}`} position={[0, 0.42, side * 0.28]}>
              <boxGeometry args={[2.1, 0.04, 0.04]} />
              <meshStandardMaterial color="#7a5c35" roughness={0.85} />
            </mesh>
          ))}
          {/* Support posts underneath into water */}
          {[-0.8, 0.8].map((x, i) => (
            <mesh key={`support-${i}`} position={[x, -0.15, 0]}>
              <cylinderGeometry args={[0.05, 0.06, 0.35, 6]} />
              <meshStandardMaterial color="#5a4020" roughness={0.92} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 2. Cascading Falling Water Droplets */}
      {drops.map((d, i) => (
        <mesh
          key={`falling-drop-${i}`}
          ref={(el) => {
            dropRefs.current[i] = el;
          }}
          position={[d.offset[0], d.initY, d.offset[1]]}
          scale={[d.scale, d.scale * 1.5, d.scale]}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.88}
          />
        </mesh>
      ))}

      {/* 3. Floating Luminous Dewdrops */}
      {dewdrops.map((dew, i) => (
        <group
          key={`dewdrop-${i}`}
          ref={(el) => {
            dewRefs.current[i] = el as unknown as Mesh;
          }}
          position={dew.pos}
        >
          <mesh scale={dew.s}>
            <sphereGeometry args={[1, 14, 12]} />
            <meshStandardMaterial
              color="#e0f2fe"
              emissive="#38bdf8"
              emissiveIntensity={0.8}
              roughness={0.08}
              metalness={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Subtle glow spark halo */}
          <pointLight color="#7dd3fc" intensity={0.4} distance={1.2} decay={2} />
        </group>
      ))}
    </group>
  );
}

/**
 * AI & Machine Learning Didactic Landmark:
 * Glowing Synaptic Neural Cluster & Data Core Monolith.
 */
export function AILandmark({ position = [-4.6, 0.28, -2.6] }: { position?: Point3 }) {
  const coreRef = useRef<Mesh>(null);
  const ringRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.6;
      coreRef.current.rotation.x = Math.sin(t * 0.4) * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.8;
    }
  });

  return (
    <group position={position} name="ai-landmark">
      {/* Hexagonal Platform Base */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.1, 1.25, 0.24, 6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.05, 6]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.8} />
      </mesh>

      {/* Floating Holographic AI Data Core */}
      <mesh ref={coreRef} position={[0, 1.25, 0]} castShadow>
        <octahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0369a1"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Rotating Cyber Ring */}
      <group ref={ringRef} position={[0, 1.25, 0]}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.82, 0.02, 8, 32]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* 3 Synaptic Node Pillars */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((rad, i) => (
        <group key={i} position={[Math.cos(rad) * 0.72, 0.24, Math.sin(rad) * 0.72]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Physics & Engineering Kinetic Wind Turbine:
 * Smoothly rotating 3-blade wind power turbine demonstrating kinetic aerodynamics.
 */
export function KineticTurbine({ position = [-4.6, 0.28, -6.8] }: { position?: Point3 }) {
  const bladesRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += delta * 2.2;
    }
  });

  return (
    <group position={position} name="kinetic-turbine">
      {/* Stone Foundation */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.55, 0.2, 12]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>
      {/* Sleek Aerodynamic Tower */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.14, 2.8, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Nacelle housing */}
      <mesh position={[0, 2.9, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.42, 8, 12]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
      </mesh>
      {/* Rotating 3-blade hub */}
      <group ref={bladesRef} position={[0, 2.9, 0.34]}>
        <mesh>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0, 0.65, 0]} castShadow>
              <boxGeometry args={[0.08, 1.25, 0.015]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/**
 * Italian Piazza Marble Fountain:
 * Classical fountain with bubbling water, stone rims, and splash effects.
 */
export function ItalianFountain({ position = [-4.6, 0.28, -1.2] }: { position?: Point3 }) {
  return (
    <group position={position} name="italian-fountain">
      {/* Lower Basin Wall */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.36, 20]} />
        <meshStandardMaterial color="#dcd3bd" roughness={0.88} />
      </mesh>
      {/* Clear Water Reservoir */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.14, 20]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.85}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>
      {/* Central Classical Pedestal */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.35, 0.72, 12]} />
        <meshStandardMaterial color="#ede5d2" roughness={0.8} />
      </mesh>
      {/* Upper Water Tier */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.42, 0.18, 16]} />
        <meshStandardMaterial color="#ded5be" roughness={0.8} />
      </mesh>
      {/* Spout Finial */}
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Wildflower Blossom Clusters:
 * Sprinkles cheerful red, gold, purple, and white blossoms on the grass for high vitality.
 */
export function FlowerPatches() {
  const patches = useMemo(
    () => [
      { pos: [-3.8, 0.35, -5.2] as Point3, col: "#f43f5e" },
      { pos: [3.8, 0.35, -5.8] as Point3, col: "#fbbf24" },
      { pos: [-4.2, 0.35, 3.5] as Point3, col: "#a855f7" },
      { pos: [4.4, 0.35, 4.6] as Point3, col: "#38bdf8" },
      { pos: [-2.5, 0.35, 7.8] as Point3, col: "#fb7185" },
      { pos: [3.2, 0.35, 8.4] as Point3, col: "#fde047" },
    ],
    [],
  );

  return (
    <group name="wildflowers">
      {patches.map((p, i) => (
        <group key={`patch-${i}`} position={p.pos}>
          {[-0.18, 0, 0.18].flatMap((dx) =>
            [-0.14, 0.14].map((dz, j) => (
              <mesh key={`${dx}-${dz}`} position={[dx + (j * 0.05), 0.04, dz]} scale={0.065}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color={p.col} roughness={0.6} />
              </mesh>
            )),
          )}
        </group>
      ))}
    </group>
  );
}
