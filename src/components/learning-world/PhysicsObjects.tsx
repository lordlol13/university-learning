"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

/**
 * 1. Aerodynamic Research Wind Turbine:
 * Features a tapered mast, aerodynamic nacelle with aviation beacon,
 * and 3 smooth rotating rotor blades.
 */
export function WindTurbine({
  position = [4.8, 0.28, -6.0],
  scale = 0.95,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const rotorRef = useRef<Group>(null);
  const beaconRef = useRef<Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z += delta * 1.75;
    }
    if (beaconRef.current) {
      // Gentle pulsing warning beacon
      const pulse = (Math.sin(clock.getElapsedTime() * 3.5) + 1) * 0.5;
      const mat = beaconRef.current.material as import("three").MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 0.4 + pulse * 1.8;
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0.12, Math.PI, 0]} name="physics-wind-turbine">
      {/* Octagonal Concrete Foundation */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.82, 0.2, 8]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.12, 8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>

      {/* Tapered White Mast */}
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.22, 3.8, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.15} />
      </mesh>

      {/* Aerodynamic Nacelle */}
      <group position={[0, 4.0, 0]}>
        <mesh position={[0, 0.08, -0.22]} castShadow>
          <boxGeometry args={[0.34, 0.32, 0.85]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Tail fin */}
        <mesh position={[0, 0.32, -0.52]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 0.35, 0.3]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} />
        </mesh>
        {/* Aviation warning beacon */}
        <mesh ref={beaconRef} position={[0, 0.32, -0.2]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>

        {/* Rotor Hub & 3 Aerodynamic Blades */}
        <group position={[0, 0.08, 0.26]}>
          {/* Nose cone */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <coneGeometry args={[0.14, 0.28, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.3} />
          </mesh>

          {/* Rotating Blades Assembly */}
          <group ref={rotorRef}>
            {[0, 1, 2].map((i) => {
              const angle = (i * 2 * Math.PI) / 3;
              return (
                <group key={i} rotation={[0, 0, angle]}>
                  {/* Blade root */}
                  <mesh position={[0, 0.35, 0]} castShadow>
                    <cylinderGeometry args={[0.03, 0.045, 0.45, 8]} />
                    <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
                  </mesh>
                  {/* Aerodynamic blade wing */}
                  <mesh position={[0, 1.35, 0]} rotation={[0, 0.15, 0]} castShadow>
                    <boxGeometry args={[0.13, 1.7, 0.024]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
                  </mesh>
                  {/* High-visibility red blade tip */}
                  <mesh position={[0, 2.3, 0]} rotation={[0, 0.15, 0]}>
                    <boxGeometry args={[0.1, 0.28, 0.025]} />
                    <meshStandardMaterial color="#ef4444" roughness={0.4} />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * 2. Harmonic Oscillator / Laboratory Pendulum:
 * Upright gallows with calibrated angle scale and a suspended brass bob
 * swinging smoothly according to harmonic motion.
 */
export function HarmonicPendulum({
  position = [-4.5, 0.28, -3.2],
  scale = 0.95,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const armRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (armRef.current) {
      // Harmonic oscillation: theta(t) = A * cos(omega * t)
      const t = clock.getElapsedTime() * 2.6;
      armRef.current.rotation.z = Math.sin(t) * 0.42;
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0.22, Math.PI, 0]} name="physics-harmonic-pendulum">
      {/* Stone & Mahogany Base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.05, 0.2, 16]} />
        <meshStandardMaterial color="#c5b79d" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.85, 0.1, 16]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>

      {/* Calibrated Protractor Arc markings on base */}
      <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.62, 32, 1, Math.PI * 0.15, Math.PI * 0.7]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Polished Brass A-Frame Gallows */}
      {[-0.45, 0.45].map((x, i) => (
        <group key={i} position={[x, 0.25, 0]}>
          <mesh position={[0, 1.05, 0]} castShadow>
            <cylinderGeometry args={[0.038, 0.05, 2.1, 12]} />
            <meshStandardMaterial color="#d97706" roughness={0.25} metalness={0.8} />
          </mesh>
          <mesh position={[0, 2.15, 0]} castShadow>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Top Crossbar with Pivot Hub */}
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.05, 12]} />
        <meshStandardMaterial color="#d97706" roughness={0.25} metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.35, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.16, 12]} />
        <meshStandardMaterial color="#b45309" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Swinging Pendulum Arm */}
      <group ref={armRef} position={[0, 2.35, 0]}>
        {/* Suspension Rod */}
        <mesh position={[0, -0.85, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 1.7, 8]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Polished Brass Spherical Bob */}
        <mesh position={[0, -1.75, 0]} castShadow>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.15} metalness={0.9} />
        </mesh>
        {/* Bob bottom pointer */}
        <mesh position={[0, -1.96, 0]} castShadow>
          <coneGeometry args={[0.035, 0.12, 12]} />
          <meshStandardMaterial color="#b45309" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 3. Optical Glass Prism with Dispersed Rainbow Spectrum:
 * High-precision triangular prism on a brass plinth, showing a white incident beam
 * refracting into a dispersed fan of spectral colors (Red to Violet).
 */
export function OpticalPrism({
  position = [4.5, 0.28, 3.6],
  scale = 0.95,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const spectrumColors = [
    "#ef4444", // Red
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
  ];

  return (
    <group position={position} scale={scale} rotation={[0.24, Math.PI, 0]} name="physics-optical-prism">
      {/* Heavy Plinth */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.85, 0.98, 0.24, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.68, 0.76, 0.1, 16]} />
        <meshStandardMaterial color="#d97706" roughness={0.3} metalness={0.75} />
      </mesh>

      {/* Incident Light Collimator / Laser Source */}
      <group position={[-0.85, 0.65, 0]} rotation={[0, 0, -0.15]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.35, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.05, 0.065, 0.06, 12]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Incident White Light Beam */}
        <mesh position={[0.42, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.016, 0.016, 0.72, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Triangular Optical Glass Prism */}
      <group position={[0, 0.68, 0]}>
        <mesh rotation={[0, Math.PI / 6, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.65, 3]} />
          <meshStandardMaterial
            color="#e0f2fe"
            transparent
            opacity={0.75}
            roughness={0.08}
            metalness={0.15}
          />
        </mesh>
        {/* Glass core refraction highlight */}
        <mesh rotation={[0, Math.PI / 6, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.6, 3]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            roughness={0.05}
          />
        </mesh>
      </group>

      {/* Dispersed Spectral Rainbow Ray Fan */}
      <group position={[0.22, 0.62, 0]}>
        {spectrumColors.map((color, idx) => {
          const spread = (idx - 3) * 0.09;
          const angle = spread + 0.12;
          return (
            <group key={color} rotation={[0, angle, 0]}>
              <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.018, 1.25, 6]} />
                <meshBasicMaterial color={color} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/**
 * 4. Meteorological Weather Station & Radar Dish:
 * Elevated sensor platform with a rotating parabolic radar dish,
 * spinning 3-cup anemometer, and photovoltaic power panel.
 */
export function WeatherStationRadar({
  position = [-4.3, 0.28, 5.0],
  scale = 0.92,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const radarRef = useRef<Group>(null);
  const anemometerRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (radarRef.current) {
      radarRef.current.rotation.y += delta * 0.85;
    }
    if (anemometerRef.current) {
      anemometerRef.current.rotation.y += delta * 4.2;
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0.15, Math.PI, 0]} name="physics-weather-station">
      {/* Concrete Foundation & Equipment Housing */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.24, 1.4]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.65, 0.8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>

      {/* Weather Station Tower Mast */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 1.5, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Platform Deck */}
      <mesh position={[0, 2.35, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.08, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Rotating Parabolic Radar Dish */}
      <group ref={radarRef} position={[0, 2.8, 0]}>
        {/* Elevation gimbal bracket */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {/* Dish assembly tilted upward 24 degrees */}
        <group position={[0, 0.32, 0]} rotation={[0.42, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.48, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.25}
              metalness={0.3}
              side={2}
            />
          </mesh>
          {/* Feed horn support struts & sensor head */}
          <mesh position={[0, 0, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.42, 6]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.58]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Spinning Anemometer Wind Cups on Annex Mast */}
      <group position={[0.48, 2.45, 0.35]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <group ref={anemometerRef} position={[0, 0.6, 0]}>
          {[0, 1, 2].map((i) => {
            const rot = (i * 2 * Math.PI) / 3;
            return (
              <group key={i} rotation={[0, rot, 0]}>
                <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.24, 6]} />
                  <meshStandardMaterial color="#94a3b8" />
                </mesh>
                <mesh position={[0.24, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <sphereGeometry args={[0.05, 8, 8, 0, Math.PI]} />
                  <meshStandardMaterial color="#e11d48" roughness={0.3} side={2} />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>

      {/* Photovoltaic Solar Power Panel (Angled upward toward sun and camera) */}
      <group position={[-0.45, 1.05, 0.38]} rotation={[0.45, 0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.42, 0.04]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <boxGeometry args={[0.52, 0.39, 0.01]} />
          <meshStandardMaterial color="#0284c7" roughness={0.15} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 5. 3D Vector Coordinate Gimbal:
 * Basis vectors i (red), j (green), k (blue) on a pedestal demonstrating
 * 3D Cartesian coordinates & Right-Hand Rule.
 */
export function VectorGimbal({
  position = [-1.2, 0.28, -2.4],
  scale = 0.9,
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
    <group position={position} scale={scale} rotation={[0.25, Math.PI, 0]} name="physics-vector-gimbal">
      {/* Stone Pedestal */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.85, 0.4, 16]} />
        <meshStandardMaterial color="#c2b59b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.62, 0.14, 16]} />
        <meshStandardMaterial color="#8c7d67" roughness={0.8} />
      </mesh>

      {/* Rotating Coordinate Gimbal */}
      <group ref={gimbalRef} position={[0, 1.1, 0]}>
        {/* Center Pivot Sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* X-axis: i (Red) */}
        <group rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.038, 0.038, 1.0, 12]} />
            <meshStandardMaterial color="#e04d4d" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.08, 0]} castShadow>
            <coneGeometry args={[0.11, 0.24, 12]} />
            <meshStandardMaterial color="#ff2d2d" roughness={0.3} />
          </mesh>
        </group>

        {/* Y-axis: j (Green) */}
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.038, 0.038, 1.0, 12]} />
            <meshStandardMaterial color="#38a169" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.08, 0]} castShadow>
            <coneGeometry args={[0.11, 0.24, 12]} />
            <meshStandardMaterial color="#2f855a" roughness={0.3} />
          </mesh>
        </group>

        {/* Z-axis: k (Blue) */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.038, 0.038, 1.0, 12]} />
            <meshStandardMaterial color="#3182ce" roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.08, 0]} castShadow>
            <coneGeometry args={[0.11, 0.24, 12]} />
            <meshStandardMaterial color="#2b6cb0" roughness={0.3} />
          </mesh>
        </group>

        {/* Orbital Unit Magnitude Ring */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.92, 0.015, 12, 36]} />
          <meshStandardMaterial color="#ecc94b" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Composite PhysicsScenery Component:
 * Perfectly spaced, high-quality physics apparatus models.
 */
export function PhysicsScenery() {
  return (
    <group name="physics-scenery">
      {/* 1. Aerodynamic Wind Turbine on the open eastern ridge */}
      <WindTurbine position={[4.8, 0.28, -5.6]} scale={0.85} />

      {/* 2. Harmonic Pendulum in the mechanics terrace */}
      <HarmonicPendulum position={[-4.4, 0.28, -2.4]} scale={0.85} />

      {/* 3. Optical Glass Prism with dispersed spectrum ray */}
      <OpticalPrism position={[4.5, 0.28, 3.8]} scale={0.8} />

      {/* 4. Meteorological Radar & Weather Station */}
      <WeatherStationRadar position={[-4.4, 0.28, 5.4]} scale={0.9} />

      {/* 5. Vector Coordinate Gimbal near center-west clear zone */}
      <VectorGimbal position={[-1.2, 0.28, -2.4]} scale={0.8} />
    </group>
  );
}
