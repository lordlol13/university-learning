"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, type Group, type Mesh } from "three";

// ============================================================================
// MATHEMATICS & LOGIC WORLD SCENERY
// ============================================================================

/**
 * 1. Floating Polyhedra Plinth:
 * Demonstrates Platonic & Kepler solids (Icosahedron, Dodecahedron, and Stella Octangula)
 * bobbing and rotating smoothly on independent axes.
 */
export function GeometricSolids({
  position = [-4.3, 0.28, 4.8],
  scale = 0.92,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const icoRef = useRef<Group>(null);
  const dodecaRef = useRef<Mesh>(null);
  const stellaRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (icoRef.current) {
      icoRef.current.rotation.x = t * 0.45;
      icoRef.current.rotation.y = t * 0.65;
      icoRef.current.position.y = 1.35 + Math.sin(t * 1.5) * 0.08;
    }
    if (dodecaRef.current) {
      dodecaRef.current.rotation.y = -t * 0.55;
      dodecaRef.current.rotation.z = t * 0.35;
      dodecaRef.current.position.y = 0.75 + Math.cos(t * 1.3) * 0.06;
    }
    if (stellaRef.current) {
      stellaRef.current.rotation.x = t * 0.5;
      stellaRef.current.rotation.z = -t * 0.6;
      stellaRef.current.position.y = 0.82 + Math.sin(t * 1.7) * 0.07;
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0.22, Math.PI, 0]} name="math-geometric-solids">
      {/* Stepped Octagonal Marble Plinth */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.1, 0.2, 8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.88, 0.12, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>

      {/* Mathematical Compass & Ruler Ring Inlay */}
      <mesh position={[0, 0.285, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.72, 32]} />
        <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Central Floating Icosahedron (Amethyst Crystal & Golden Cage) */}
      <group ref={icoRef} position={[0, 1.35, 0]}>
        {/* Solid inner facet */}
        <mesh castShadow>
          <icosahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.75}
            roughness={0.15}
            metalness={0.4}
          />
        </mesh>
        {/* Wireframe outer shell */}
        <mesh>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} wireframe />
        </mesh>
      </group>

      {/* Golden Dodecahedron */}
      <mesh
        ref={dodecaRef}
        position={[-0.52, 0.75, 0.35]}
        castShadow
      >
        <dodecahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial
          color="#f59e0b"
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* Stella Octangula (Two Interpenetrating Tetrahedra) */}
      <group ref={stellaRef} position={[0.55, 0.82, -0.3]}>
        {/* Tetrahedron 1 */}
        <mesh castShadow>
          <tetrahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.2} metalness={0.6} />
        </mesh>
        {/* Tetrahedron 2 (Inverted & Rotated) */}
        <mesh rotation={[Math.PI, Math.PI / 4, 0]} castShadow>
          <tetrahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 2. Möbius Strip Loop with Traveling Energy Pulse:
 * Parametric continuous one-sided ribbon with a traveling luminous pulse.
 */
export function MobiusLoop({
  position = [-4.5, 0.28, -3.2],
  scale = 0.95,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const pulseRef = useRef<Mesh>(null);
  const ringGroupRef = useRef<Group>(null);

  // Generate parametric Möbius geometry
  const mobiusGeometry = useMemo(() => {
    const segments = 64;
    const radius = 0.75;
    const width = 0.24;

    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const u = (i / segments) * Math.PI * 2;
      const vHalf = u / 2;

      // Inner and outer edges of the ribbon
      for (const edge of [-1, 1]) {
        const w = (edge * width) / 2;
        const x = (radius + w * Math.cos(vHalf)) * Math.cos(u);
        const y = w * Math.sin(vHalf);
        const z = (radius + w * Math.cos(vHalf)) * Math.sin(u);
        vertices.push(x, y, z);
      }
    }

    for (let i = 0; i < segments; i++) {
      const i0 = i * 2;
      const i1 = i * 2 + 1;
      const i2 = (i + 1) * 2;
      const i3 = (i + 1) * 2 + 1;

      indices.push(i0, i1, i2);
      indices.push(i1, i3, i2);
      indices.push(i2, i1, i0);
      indices.push(i2, i3, i1);
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.y = t * 0.25;
    }
    if (pulseRef.current) {
      // Pulse traverses the single continuous surface (period 4*pi)
      const u = t * 1.5;
      const vHalf = u / 2;
      const radius = 0.75;
      const w = 0.05 * Math.sin(t * 3);
      const x = (radius + w * Math.cos(vHalf)) * Math.cos(u);
      const y = w * Math.sin(vHalf);
      const z = (radius + w * Math.cos(vHalf)) * Math.sin(u);
      pulseRef.current.position.set(x, y, z);
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0.2, Math.PI, 0]} name="math-mobius-loop">
      {/* Stone Pedestal */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.82, 0.24, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.16, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Floating Rotating Möbius Strip */}
      <group position={[0, 1.25, 0]}>
        <group ref={ringGroupRef}>
          <mesh geometry={mobiusGeometry} castShadow>
            <meshStandardMaterial
              color="#06b6d4"
              roughness={0.25}
              metalness={0.7}
              side={2}
            />
          </mesh>
          {/* Luminous Energy Pulse tracing the Möbius loop */}
          <mesh ref={pulseRef}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * 3. Archimedean Spiral Promenade:
 * r = a + b * theta. Stepped carved limestone tiles spiraling outward,
 * with golden nodes and miniature cypress topiaries.
 */
export function ArchimedeanSpiralPromenade({
  position = [4.6, 0.28, -5.4],
  scale = 0.9,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    }
  });

  const spiralNodes = useMemo(() => {
    const nodes = [];
    const a = 0.18;
    const b = 0.11;
    for (let theta = 0; theta < Math.PI * 4.2; theta += 0.36) {
      const r = a + b * theta;
      nodes.push({
        x: r * Math.cos(theta),
        y: 0.06 + (theta / (Math.PI * 4.2)) * 0.45,
        z: r * Math.sin(theta),
        rot: -theta,
      });
    }
    return nodes;
  }, []);

  return (
    <group position={position} scale={scale} rotation={[0, Math.PI, 0]} name="math-spiral-promenade">
      {/* Raised Terraced Circular Base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.65, 0.2, 24]} />
        <meshStandardMaterial color="#d4c5ab" roughness={0.88} />
      </mesh>

      {/* Rotating Archimedean Spiral Tiles & Golden Spheres */}
      <group ref={groupRef} position={[0, 0.2, 0]}>
        {spiralNodes.map((n, i) => (
          <group key={i} position={[n.x, n.y, n.z]} rotation={[0, n.rot, 0]}>
            {/* Stepped stone paver */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.18, 0.08, 0.14]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.65} />
            </mesh>
            {/* Glowing Golden node */}
            <mesh position={[0, 0.08, 0]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshStandardMaterial
                color="#eab308"
                emissive="#ca8a04"
                emissiveIntensity={0.8}
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/**
 * 4. Harmonic Sine Wave Ribbon Steps:
 * Demonstrates y = sin(x) harmonic motion with cascading steps.
 */
export function SineWaveRibbon({
  position = [4.5, 0.28, 3.6],
  scale = 0.9,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const ribbonRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (ribbonRef.current) {
      ribbonRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.12;
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0, Math.PI, 0]} name="math-sine-wave">
      {/* Stone Pedestal */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.92, 0.2, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
      </mesh>

      <group ref={ribbonRef} position={[0, 0.65, 0]}>
        {/* Mathematical coordinate axis */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.5} />
        </mesh>

        {/* Sinusoidal Wave Steps */}
        {Array.from({ length: 20 }).map((_, i) => {
          const x = (i - 10) * 0.11;
          const y = Math.sin(i * 0.42) * 0.38;
          return (
            <mesh
              key={i}
              position={[x, y, 0]}
              rotation={[0, 0, Math.cos(i * 0.42) * 0.35]}
              castShadow
            >
              <boxGeometry args={[0.09, 0.04, 0.38]} />
              <meshStandardMaterial
                color="#3b82f6"
                roughness={0.3}
                metalness={0.3}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export function MathScenery() {
  return (
    <group name="math-scenery">
      <GeometricSolids position={[-4.4, 0.28, 5.4]} scale={0.95} />
      <MobiusLoop position={[-4.4, 0.28, -2.4]} scale={0.85} />
      <ArchimedeanSpiralPromenade position={[4.8, 0.28, -5.4]} scale={0.9} />
      <SineWaveRibbon position={[4.5, 0.28, 3.8]} scale={0.8} />
    </group>
  );
}

// ============================================================================
// ITALIAN LANGUAGE & CULTURE WORLD SCENERY
// ============================================================================

/**
 * 1. Renaissance Tiered Fountain:
 * Carved Italian marble basin, central pedestal with 4 lion head spouts,
 * upper chalice, and shimmering turquoise water with ripple animation.
 */
export function RenaissanceFountain({
  position = [-4.3, 0.28, 4.2],
  scale = 0.95,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const waterRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.015;
      waterRef.current.scale.set(pulse, 1, pulse);
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0.18, Math.PI, 0]} name="italian-renaissance-fountain">
      {/* Octagonal Stepped Outer Basin */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.45, 0.24, 8]} />
        <meshStandardMaterial color="#d4c8b2" roughness={0.85} />
      </mesh>
      {/* Basin Lip */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <torusGeometry args={[1.25, 0.1, 8, 8]} />
        <meshStandardMaterial color="#ede4d2" roughness={0.8} />
      </mesh>

      {/* Shimmering Lower Water Surface */}
      <mesh ref={waterRef} position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.18, 24]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.12}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Central Fluted Pedestal Column */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.38, 0.75, 16]} />
        <meshStandardMaterial color="#ede4d2" roughness={0.85} />
      </mesh>

      {/* 4 Lion Head Water Spouts */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2;
        return (
          <group key={i} rotation={[0, angle, 0]} position={[0, 0.72, 0]}>
            <mesh position={[0.28, 0, 0]} castShadow>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#c2b59d" roughness={0.9} />
            </mesh>
            {/* Water stream arching into the basin */}
            <mesh position={[0.52, -0.22, 0]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.015, 0.02, 0.48, 6]} />
              <meshStandardMaterial
                color="#bae6fd"
                transparent
                opacity={0.7}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
      })}

      {/* Upper Scalloped Marble Basin */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.25, 0.25, 16]} />
        <meshStandardMaterial color="#ede4d2" roughness={0.8} />
      </mesh>
      {/* Upper water pool */}
      <mesh position={[0, 1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.56, 16]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.88} />
      </mesh>

      {/* Top Fountain Finial with Bubbling Jet */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color="#fcd34d" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <coneGeometry args={[0.05, 0.28, 8]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/**
 * 2. Classical Roman Marble Colonnade:
 * 4 fluted Corinthian-style columns, rounded triumphal arches,
 * and decorative entablature frieze.
 */
export function MarbleColonnade({
  position = [4.6, 0.28, -5.4],
  rotation = -0.2,
  scale = 0.88,
}: {
  position?: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  return (
    <group
      position={position}
      rotation={[0, rotation + Math.PI, 0]}
      scale={scale}
      name="italian-marble-colonnade"
    >
      {/* Stepped Stone Base Podium */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.2, 1.2]} />
        <meshStandardMaterial color="#d4c8b2" roughness={0.9} />
      </mesh>

      {/* 4 Fluted Marble Columns */}
      {[-1.6, -0.53, 0.53, 1.6].map((x, i) => (
        <group key={i} position={[x, 0.2, 0]}>
          {/* Column Base Plinth */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.2, 12]} />
            <meshStandardMaterial color="#ede4d2" roughness={0.85} />
          </mesh>
          {/* Column Shaft */}
          <mesh position={[0, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.17, 0.2, 1.9, 16]} />
            <meshStandardMaterial color="#f5f0e4" roughness={0.8} />
          </mesh>
          {/* Capital with carved volute bands */}
          <mesh position={[0, 2.15, 0]} castShadow>
            <boxGeometry args={[0.42, 0.16, 0.42]} />
            <meshStandardMaterial color="#ede4d2" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* 3 Classical Semicircular Arches */}
      {[-1.06, 0, 1.06].map((x, i) => (
        <mesh key={i} position={[x, 2.3, 0]} castShadow>
          <torusGeometry args={[0.53, 0.11, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#ede4d2" roughness={0.85} />
        </mesh>
      ))}

      {/* Classical Architrave & Entablature Beam */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <boxGeometry args={[4.5, 0.32, 1.15]} />
        <meshStandardMaterial color="#ede4d2" roughness={0.85} />
      </mesh>
      {/* Decorative Attic Frieze */}
      <mesh position={[0, 3.18, 0]} castShadow>
        <boxGeometry args={[4.1, 0.24, 0.9]} />
        <meshStandardMaterial color="#d8cbaf" roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * 3. Tuscan Terracotta Urns & Miniature Lemon Trees:
 * Handcrafted clay amphorae with flowering bougainvillea and ripe lemon citrus.
 */
export function TerracottaUrns({
  position = [4.5, 0.28, 3.6],
  scale = 0.9,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0.16, Math.PI, 0]} name="italian-terracotta-urns">
      {/* Stone Paved Base */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.12, 16]} />
        <meshStandardMaterial color="#d4c8b2" roughness={0.9} />
      </mesh>

      {/* Central Large Urn with Miniature Citrus Tree */}
      <group position={[0, 0.12, 0]}>
        {/* Amphora Belly & Rim */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.34, 16, 12]} />
          <meshStandardMaterial color="#c25e36" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.2, 0.22, 16]} />
          <meshStandardMaterial color="#b9542f" roughness={0.85} />
        </mesh>
        {/* Tree Trunk */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
          <meshStandardMaterial color="#785338" />
        </mesh>
        {/* Citrus Foliage Canopy */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <sphereGeometry args={[0.48, 12, 10]} />
          <meshStandardMaterial color="#3f6212" roughness={0.88} />
        </mesh>
        {/* Bright Yellow Lemons */}
        {[
          [0.28, 1.15, 0.25],
          [-0.26, 1.35, 0.2],
          [0.1, 1.4, -0.35],
          [-0.3, 1.15, -0.2],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Flanking Pair of Smaller Flowering Urns */}
      {[-0.55, 0.55].map((x, i) => (
        <group key={i} position={[x, 0.12, i ? 0.2 : -0.2]}>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.14, 0.38, 12]} />
            <meshStandardMaterial color="#c25e36" roughness={0.85} />
          </mesh>
          {/* Lush Floral Mound */}
          <mesh position={[0, 0.48, 0]} castShadow>
            <sphereGeometry args={[0.26, 10, 8]} />
            <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
          </mesh>
          {/* Crimson / Magenta Flowers */}
          {[-0.14, 0, 0.14].map((fx, fi) => (
            <mesh key={fi} position={[fx, 0.62, (fi % 2) * 0.1]}>
              <sphereGeometry args={[0.055, 6, 6]} />
              <meshStandardMaterial color="#e11d48" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/**
 * 4. Scenic Stone Balustrade Overlook:
 * Renaissance molded balusters along the cliff rim with stone bench.
 */
export function StoneBalustrades({
  position = [-4.6, 0.28, -3.4],
  rotation = 0.35,
  scale = 0.9,
}: {
  position?: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  return (
    <group
      position={position}
      rotation={[0, rotation + Math.PI, 0]}
      scale={scale}
      name="italian-stone-balustrades"
    >
      {/* Stone Paved Terrace */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.16, 1.4]} />
        <meshStandardMaterial color="#d4c8b2" roughness={0.9} />
      </mesh>

      {/* Railing Base Plinth */}
      <mesh position={[0, 0.22, -0.55]} castShadow>
        <boxGeometry args={[3.2, 0.12, 0.22]} />
        <meshStandardMaterial color="#ede4d2" roughness={0.85} />
      </mesh>

      {/* Row of Molded Balusters */}
      {Array.from({ length: 9 }).map((_, i) => {
        const x = (i - 4) * 0.35;
        return (
          <mesh key={i} position={[x, 0.52, -0.55]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.48, 8]} />
            <meshStandardMaterial color="#f5f0e4" roughness={0.8} />
          </mesh>
        );
      })}

      {/* Handrail Cap */}
      <mesh position={[0, 0.8, -0.55]} castShadow>
        <boxGeometry args={[3.3, 0.1, 0.26]} />
        <meshStandardMaterial color="#ede4d2" roughness={0.85} />
      </mesh>

      {/* End Pillars with Classical Finial Spheres */}
      {[-1.6, 1.6].map((x, i) => (
        <group key={i} position={[x, 0.52, -0.55]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.75, 0.3]} />
            <meshStandardMaterial color="#d8cbaf" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <sphereGeometry args={[0.13, 12, 12]} />
            <meshStandardMaterial color="#f5f0e4" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Scenic Stone Bench */}
      <group position={[0, 0.16, 0.2]}>
        <mesh position={[-0.7, 0.16, 0]} castShadow>
          <boxGeometry args={[0.18, 0.32, 0.4]} />
          <meshStandardMaterial color="#d8cbaf" roughness={0.85} />
        </mesh>
        <mesh position={[0.7, 0.16, 0]} castShadow>
          <boxGeometry args={[0.18, 0.32, 0.4]} />
          <meshStandardMaterial color="#d8cbaf" roughness={0.85} />
        </mesh>
        {/* Bench seat slab */}
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[1.8, 0.08, 0.48]} />
          <meshStandardMaterial color="#ede4d2" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

export function ItalianScenery() {
  return (
    <group name="italian-scenery">
      <RenaissanceFountain position={[-4.4, 0.28, 5.4]} scale={1.2} />
      <MarbleColonnade position={[4.8, 0.28, -5.4]} rotation={-0.2} scale={0.82} />
      <TerracottaUrns position={[4.5, 0.28, 3.8]} scale={0.85} />
      <StoneBalustrades position={[-4.6, 0.28, -2.3]} rotation={0.25} scale={0.85} />
    </group>
  );
}

// ============================================================================
// AI & MACHINE LEARNING WORLD SCENERY
// ============================================================================

/**
 * 1. Neural Lattice:
 * Floating 3D neural network layers with glowing synaptic connections
 * and pulsing weight signals.
 */
export function NeuralLattice({
  position = [-4.5, 0.28, -3.2],
  scale = 0.95,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.35;
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0.2, Math.PI, 0]} name="ai-neural-lattice">
      {/* Obsidian Tech Pedestal */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.75, 0.88, 0.24, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.08, 8]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* Rotating Neural Core */}
      <group ref={groupRef} position={[0, 1.25, 0]}>
        {/* Layer 1 (Input: 3 nodes) */}
        {[-0.35, 0, 0.35].map((y, i) => (
          <mesh key={`in-${i}`} position={[-0.45, y, 0]} castShadow>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Layer 2 (Hidden: 4 nodes) */}
        {[-0.45, -0.15, 0.15, 0.45].map((y, i) => (
          <mesh key={`hid-${i}`} position={[0, y, 0]} castShadow>
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#7e22ce"
              emissiveIntensity={1.5}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Layer 3 (Output: 2 nodes) */}
        {[-0.22, 0.22].map((y, i) => (
          <mesh key={`out-${i}`} position={[0.45, y, 0]} castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Synapse Connection Beams */}
        {[-0.35, 0, 0.35].map((yIn, i) =>
          [-0.45, -0.15, 0.15, 0.45].map((yHid, j) => (
            <mesh
              key={`syn1-${i}-${j}`}
              position={[-0.225, (yIn + yHid) / 2, 0]}
              rotation={[0, 0, Math.atan2(yHid - yIn, 0.45)]}
            >
              <cylinderGeometry
                args={[
                  0.008,
                  0.008,
                  Math.hypot(0.45, yHid - yIn),
                  6,
                ]}
              />
              <meshBasicMaterial color="#6366f1" transparent opacity={0.65} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}

/**
 * 2. Quantum Computing Monolith:
 * Futuristic crystalline data tower with rotating magnetic containment rings.
 */
export function QuantumCore({
  position = [4.6, 0.28, -5.4],
  scale = 0.9,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.8;
      ring1Ref.current.rotation.y = t * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.7;
      ring2Ref.current.rotation.z = t * 0.6;
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0.18, Math.PI, 0]} name="ai-quantum-core">
      {/* Foundation plinth */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.92, 0.24, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Central Cryogenic Column */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 1.4, 16]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Rotating Superconducting Containment Rings */}
      <group position={[0, 1.05, 0]}>
        <mesh ref={ring1Ref}>
          <torusGeometry args={[0.52, 0.025, 8, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={ring2Ref}>
          <torusGeometry args={[0.62, 0.025, 8, 32]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#7e22ce"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 3. Modern AI Campus Overlook & Cyber Bench:
 * Sleek steel and glass bench overlooking the scenic bay.
 */
export function TechOverlook({
  position = [-4.3, 0.28, 4.8],
  scale = 0.9,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0.18, Math.PI, 0]} name="ai-tech-overlook">
      {/* Paved Tech Terrace */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.25, 0.16, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {/* Sleek Ergonomic Cyber Bench */}
      <group position={[0, 0.16, 0]}>
        {/* Metal legs */}
        {[-0.6, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 0.18, 0]} castShadow>
            <boxGeometry args={[0.08, 0.36, 0.42]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Bench seat */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[1.5, 0.06, 0.44]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Glowing cyber accent stripe */}
        <mesh position={[0, 0.385, 0]}>
          <boxGeometry args={[1.4, 0.015, 0.05]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

export function AIScenery() {
  return (
    <group name="ai-scenery">
      <NeuralLattice position={[-4.4, 0.28, -2.4]} scale={0.8} />
      <QuantumCore position={[4.8, 0.28, -5.4]} scale={0.8} />
      <TechOverlook position={[-4.4, 0.28, 5.4]} scale={1.0} />
    </group>
  );
}
