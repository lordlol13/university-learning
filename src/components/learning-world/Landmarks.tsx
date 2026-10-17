"use client";

import { useFrame, type ThreeElements } from "@react-three/fiber";
import type { ReactNode } from "react";
import { useRef } from "react";
import * as THREE from "three";

const MARBLE = "#f3ece0";
const GOLD = "#e0b04a";

function Spin({
  speed = 1,
  axis = "y",
  children,
  ...rest
}: {
  speed?: number;
  axis?: "x" | "y" | "z";
  children: ReactNode;
} & Omit<ThreeElements["group"], "children">) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation[axis] += d * speed;
  });
  return (
    <group ref={ref} {...rest}>
      {children}
    </group>
  );
}

function Float({
  amp = 0.15,
  speed = 1.5,
  children,
  y = 0,
}: {
  amp?: number;
  speed?: number;
  y?: number;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.position.y = y + Math.sin(clock.elapsedTime * speed) * amp;
  });
  return <group ref={ref}>{children}</group>;
}

function AI({ c, a }: { c: string; a: string }) {
  return (
    <group>
      <mesh position-y={0.15} castShadow receiveShadow>
        <cylinderGeometry args={[1.9, 2.05, 0.3, 12]} />
        <meshStandardMaterial color={MARBLE} roughness={0.4} />
      </mesh>
      <mesh position-y={0.3}>
        <sphereGeometry
          args={[1.45, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshPhysicalMaterial
          color={a}
          transparent
          opacity={0.28}
          roughness={0.05}
          clearcoat={1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const t = (i / 6) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(t) * 2.2, 0, Math.sin(t) * 2.2]}>
            <mesh position-y={1.1} castShadow>
              <boxGeometry args={[0.12, 2.2, 0.12]} />
              <meshStandardMaterial
                color={c}
                emissive={c}
                emissiveIntensity={0.6}
              />
            </mesh>
            {[0.6, 1.4, 2.2].map((y) => (
              <mesh key={y} position-y={y}>
                <sphereGeometry args={[0.1, 12, 12]} />
                <meshStandardMaterial
                  color={a}
                  emissive={a}
                  emissiveIntensity={1.4}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>
        );
      })}
      <Float y={2.5}>
        <Spin speed={0.8}>
          <mesh castShadow>
            <octahedronGeometry args={[0.6]} />
            <meshStandardMaterial
              color={c}
              emissive={c}
              emissiveIntensity={1.2}
              toneMapped={false}
              flatShading
            />
          </mesh>
          <mesh>
            <octahedronGeometry args={[0.85]} />
            <meshBasicMaterial color={a} wireframe transparent opacity={0.6} />
          </mesh>
        </Spin>
        <Spin speed={1.2} axis="z" rotation-x={1.2}>
          <mesh>
            <torusGeometry args={[1.15, 0.03, 8, 64]} />
            <meshBasicMaterial color={a} toneMapped={false} />
          </mesh>
        </Spin>
        <Spin speed={-0.9} axis="z" rotation-x={2} rotation-y={0.8}>
          <mesh>
            <torusGeometry args={[1.35, 0.025, 8, 64]} />
            <meshBasicMaterial color={c} toneMapped={false} />
          </mesh>
        </Spin>
      </Float>
    </group>
  );
}

function Physics({ c, a }: { c: string; a: string }) {
  const bob = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (bob.current)
      bob.current.rotation.z = Math.sin(clock.elapsedTime * 2.2) * 0.6;
  });
  return (
    <group>
      <mesh position-y={0.15} receiveShadow castShadow>
        <cylinderGeometry args={[2.1, 2.2, 0.3, 10]} />
        <meshStandardMaterial color="#e6dccb" roughness={0.6} />
      </mesh>
      <mesh position-y={2.2} castShadow>
        <cylinderGeometry args={[0.14, 0.3, 4.2, 12]} />
        <meshStandardMaterial color={MARBLE} roughness={0.3} />
      </mesh>
      <group position={[0, 4.3, 0.15]}>
        <mesh castShadow>
          <boxGeometry args={[0.35, 0.35, 0.7]} />
          <meshStandardMaterial color={a} metalness={0.4} roughness={0.3} />
        </mesh>
        <Spin speed={2.2} axis="z" position-z={0.4}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.16, 0.16, 0.2, 16]} />
            <meshStandardMaterial color={c} metalness={0.5} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation-z={(i * Math.PI * 2) / 3} castShadow>
              <boxGeometry args={[0.18, 2.4, 0.05]} />
              <meshStandardMaterial color="#fbf7ef" roughness={0.3} />
              <mesh position-y={1.1}>
                <boxGeometry args={[0.18, 0.2, 0.06]} />
                <meshStandardMaterial color={c} />
              </mesh>
            </mesh>
          ))}
        </Spin>
      </group>
      {/* pendulum arch */}
      <group position={[1.7, 0.3, 0.6]}>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 2.2, 8]} />
            <meshStandardMaterial
              color={GOLD}
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>
        ))}
        <mesh position-y={2.2} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.07, 0.07, 1.25, 8]} />
          <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.25} />
        </mesh>
        <group ref={bob} position-y={2.2}>
          <mesh position-y={-0.75}>
            <cylinderGeometry args={[0.012, 0.012, 1.5, 4]} />
            <meshStandardMaterial color="#5b4a2e" />
          </mesh>
          <mesh position-y={-1.55} castShadow>
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshStandardMaterial
              color={GOLD}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
        </group>
      </group>
      <Float y={1.4} amp={0.1}>
        <Spin speed={0.4} position={[-1.6, 0, 0.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.5, 0.5, 1, 3]} />
            <meshPhysicalMaterial
              color="#e8f4ff"
              transparent
              opacity={0.55}
              roughness={0}
              clearcoat={1}
              flatShading
            />
          </mesh>
        </Spin>
      </Float>
    </group>
  );
}

function Mathematics({ c, a }: { c: string; a: string }) {
  return (
    <group>
      {[0, 1].map((i) => (
        <mesh
          key={i}
          position-y={0.12 + i * 0.22}
          receiveShadow
          castShadow
        >
          <cylinderGeometry
            args={[2.3 - i * 0.3, 2.35 - i * 0.3, 0.22, 16]}
          />
          <meshStandardMaterial color={MARBLE} roughness={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const t = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(t) * 1.65, 1.35, Math.sin(t) * 1.65]}
            castShadow
          >
            <cylinderGeometry args={[0.13, 0.15, 1.8, 10]} />
            <meshStandardMaterial color={MARBLE} roughness={0.4} />
          </mesh>
        );
      })}
      <mesh position-y={2.32} castShadow>
        <cylinderGeometry args={[1.95, 1.95, 0.16, 32, 1, true]} />
        <meshStandardMaterial color={MARBLE} side={THREE.DoubleSide} />
      </mesh>
      <Float y={1.5} amp={0.12}>
        <Spin speed={0.6}>
          <mesh castShadow>
            <torusKnotGeometry args={[0.5, 0.15, 160, 20, 2, 3]} />
            <meshStandardMaterial
              color={GOLD}
              metalness={0.9}
              roughness={0.18}
            />
          </mesh>
        </Spin>
      </Float>
      <Spin speed={0.35}>
        <Float y={3.3} amp={0.2} speed={1.1}>
          <mesh position-x={1.4}>
            <icosahedronGeometry args={[0.35]} />
            <meshStandardMaterial
              color={c}
              emissive={c}
              emissiveIntensity={0.5}
              flatShading
            />
          </mesh>
          <mesh position-x={-1.4}>
            <octahedronGeometry args={[0.32]} />
            <meshStandardMaterial
              color={a}
              metalness={0.7}
              roughness={0.2}
              flatShading
            />
          </mesh>
          <mesh position-z={1.4}>
            <dodecahedronGeometry args={[0.28]} />
            <meshStandardMaterial color={c} flatShading />
          </mesh>
        </Float>
      </Spin>
    </group>
  );
}

function Italian({ c, a }: { c: string; a: string }) {
  return (
    <group>
      <mesh position-y={0.12} receiveShadow castShadow>
        <cylinderGeometry args={[2.2, 2.3, 0.24, 20]} />
        <meshStandardMaterial color="#efe2cc" roughness={0.7} />
      </mesh>
      <mesh position-y={0.95} castShadow receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 1.5, 24]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position-y={1.7} castShadow>
        <sphereGeometry
          args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial color="#b4532c" roughness={0.6} />
      </mesh>
      <mesh position-y={3.0} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 8]} />
        <meshStandardMaterial color={MARBLE} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const t = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(t) * 1.6, 0.9, Math.sin(t) * 1.6]}
            castShadow
          >
            <cylinderGeometry args={[0.08, 0.1, 1.35, 8]} />
            <meshStandardMaterial color={MARBLE} />
          </mesh>
        );
      })}
      <mesh position-y={1.65}>
        <torusGeometry args={[1.6, 0.1, 6, 48]} />
        <meshStandardMaterial color={MARBLE} />
      </mesh>
      {[-2.6, 2.6].map((x) => (
        <group key={x} position={[x, 0, -0.6]}>
          <mesh position-y={1.3} castShadow>
            <coneGeometry args={[0.32, 2.4, 8]} />
            <meshStandardMaterial color="#2f5d3a" flatShading />
          </mesh>
        </group>
      ))}
      {/* tiered piazza fountain */}
      <group position={[0, 0.24, 2.6]}>
        {[
          [0.85, 0.25, 0.12],
          [0.45, 0.2, 0.55],
          [0.22, 0.15, 0.9],
        ].map(([r, h, y], i) => (
          <group key={i} position-y={y}>
            <mesh castShadow>
              <cylinderGeometry args={[r, r * 0.85, h, 20]} />
              <meshStandardMaterial color={MARBLE} />
            </mesh>
            <mesh position-y={h / 2 + 0.01}>
              <cylinderGeometry args={[r * 0.86, r * 0.86, 0.02, 20]} />
              <meshStandardMaterial
                color={a}
                emissive={a}
                emissiveIntensity={0.4}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        ))}
        <mesh position-y={0.6}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
          <meshStandardMaterial color={MARBLE} />
        </mesh>
      </group>
    </group>
  );
}

/** Scales up from zero each time the track changes (keyed by the parent). */
function Appear({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const v = useRef(0);
  const s = useRef(0.01);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    v.current += (1 - s.current) * 90 * dt;
    v.current *= Math.exp(-11 * dt);
    s.current += v.current * dt;
    ref.current?.scale.setScalar(Math.max(0.01, s.current));
  });
  return <group ref={ref}>{children}</group>;
}

export function TrackLandmark({
  directionId,
  color,
  accent,
}: {
  directionId: string;
  color: string;
  accent: string;
}) {
  const props = { c: color, a: accent };
  return (
    <Appear key={directionId}>
      {directionId === "ai-ml" && <AI {...props} />}
      {directionId === "physics-engineering" && <Physics {...props} />}
      {directionId === "mathematics" && <Mathematics {...props} />}
      {directionId === "italian-language" && <Italian {...props} />}
    </Appear>
  );
}
