"use client";
import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ExtrudeGeometry, Shape, type Group } from "three";
import type { LearningWorldData, Point3 } from "@/types/learning-world";
import { worldConfig } from "@/data/world-config";
import { PhysicsScenery } from "./PhysicsObjects";
import { ItalianScenery, MathScenery } from "./WorldScenery";

function Tree({
  position,
  scale,
  variant,
}: LearningWorldData["trees"][number]) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.17, 1.25, 8]} />
        <meshStandardMaterial color="#937452" roughness={0.95} />
      </mesh>
      <mesh
        position={[0, 1.58, 0]}
        scale={variant === "tall" ? [0.61, 1.23, 0.64] : [0.8, 0.89, 0.77]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial
          color={variant === "tall" ? "#4f9635" : "#70b842"}
          roughness={0.83}
        />
      </mesh>
      {variant === "round" && (
        <mesh
          position={[-0.33, 1.42, 0.28]}
          scale={[0.5, 0.61, 0.51]}
          castShadow
        >
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#8ec850" roughness={0.88} />
        </mesh>
      )}
    </group>
  );
}
function UniversityBuilding({
  position,
  scale,
  rotation,
}: LearningWorldData["buildings"][number]) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.7, 0.24, 2.15]} />
        <meshStandardMaterial color="#d7cbb0" />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.25, 1.8, 1.6]} />
        <meshStandardMaterial color="#f2e7cc" roughness={0.85} />
      </mesh>
      <mesh
        position={[0, 2.02, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[2.4, 1, 1.3]}
        castShadow
      >
        <coneGeometry args={[1, 0.64, 4]} />
        <meshStandardMaterial color="#7e9b94" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.7, 0.5]} castShadow>
        <boxGeometry args={[0.9, 2.4, 1.05]} />
        <meshStandardMaterial color="#ecdfbf" />
      </mesh>
      <mesh position={[0, 2.96, 0.5]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.76, 0.75, 4]} />
        <meshStandardMaterial color="#79998c" />
      </mesh>
      <mesh position={[0, 2.17, 1.04]}>
        <circleGeometry args={[0.21, 24]} />
        <meshStandardMaterial color="#f9f4e6" />
      </mesh>
      <mesh position={[0, 2.22, 1.055]}>
        <boxGeometry args={[0.02, 0.12, 0.013]} />
        <meshStandardMaterial color="#607770" />
      </mesh>
      <mesh position={[0.045, 2.17, 1.06]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.1, 0.02, 0.015]} />
        <meshStandardMaterial color="#607770" />
      </mesh>
      {[-1.2, -0.75, 0.75, 1.2].flatMap((x) =>
        [0.82, 1.48].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0.806]}>
            <boxGeometry args={[0.23, 0.36, 0.03]} />
            <meshStandardMaterial color="#91b3b7" roughness={0.35} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.65, 1.037]}>
        <boxGeometry args={[0.38, 0.88, 0.035]} />
        <meshStandardMaterial color="#8eaa9c" />
      </mesh>
      <mesh position={[0, 3.58, 0.5]}>
        <cylinderGeometry args={[0.025, 0.025, 0.72, 8]} />
        <meshStandardMaterial color="#dccb99" />
      </mesh>
      <mesh position={[0.25, 3.8, 0.5]}>
        <boxGeometry args={[0.46, 0.29, 0.028]} />
        <meshStandardMaterial color="#6da64b" />
      </mesh>
    </group>
  );
}
function Cloud({
  position,
  scale,
  reducedMotion,
}: {
  position: Point3;
  scale: number;
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null),
    time = useRef(0);
  useFrame((_, delta) => {
    if (group.current && !reducedMotion) {
      time.current += Math.min(delta, 0.05);
      group.current.position.x =
        position[0] + Math.sin(time.current * 0.14 + position[2]) * 0.22;
    }
  });
  return (
    <group position={position} scale={scale} ref={group}>
      {[
        [0, 0, 0, 0.72],
        [-0.65, -0.16, 0, 0.48],
        [0.6, -0.13, 0.03, 0.51],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[s, s * 0.78, s * 0.74]}>
          <sphereGeometry args={[1, 16, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export const Environment = memo(function Environment({
  data,
  reducedMotion,
}: {
  data: LearningWorldData;
  reducedMotion: boolean;
}) {
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
      <ambientLight intensity={0.6} color="#fffdf5" />
      <hemisphereLight args={["#e8f3ff", "#7cae58", 0.6]} />
      <directionalLight
        position={[-8, 16, 9]}
        intensity={2.4}
        color="#fff2d6"
        castShadow
        shadow-mapSize={[worldConfig.shadowSize, worldConfig.shadowSize]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-normalBias={0.035}
        shadow-bias={-0.0002}
        shadow-radius={3}
      />
      <directionalLight
        position={[7, 8, -8]}
        intensity={0.45}
        color="#d1e7ff"
      />
      <mesh
        geometry={terrain}
        position={[0, -0.36, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#78b94b" roughness={0.96} />
      </mesh>
      <mesh
        geometry={terrain}
        position={[0, -0.95, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.025, 1.017, 1.45]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#c6b890" roughness={1} />
      </mesh>
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
      {data.trees.map((tree, i) => (
        <Tree key={i} {...tree} />
      ))}
      {data.buildings.map((building, i) => (
        <UniversityBuilding key={i} {...building} />
      ))}
      {data.directionId === "physics-engineering" && <PhysicsScenery />}
      {data.directionId === "mathematics" && <MathScenery />}
      {data.directionId === "italian-language" && <ItalianScenery />}
      {data.trees.flatMap((tree, i) =>
        [0, 1].map((j) => (
          <mesh
            key={`${i}-${j}`}
            position={[
              tree.position[0] + (j ? 0.58 : -0.57),
              0.39,
              tree.position[2] + 0.55,
            ]}
            scale={[0.38, 0.27 + j * 0.15, 0.35]}
            castShadow
          >
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial
              color={i % 2 ? "#789d50" : "#a5c56c"}
              roughness={0.95}
            />
          </mesh>
        )),
      )}
      {[
        [-4.9, 0.28, 4.2],
        [3.9, 0.26, -3.4],
        [-2.8, 0.3, -8.6],
        [4.65, 0.24, 7.5],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as Point3}
          rotation={[0.2, i, 0.1]}
          scale={[0.46, 0.29, 0.38]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#b6b9a6" roughness={1} />
        </mesh>
      ))}
      <Cloud
        position={[-5.7, 3.7, -5.5]}
        scale={1.2}
        reducedMotion={reducedMotion}
      />
      <Cloud
        position={[5.5, 4.4, 1.4]}
        scale={1.15}
        reducedMotion={reducedMotion}
      />
      <Cloud
        position={[-4.5, 2.4, 8.8]}
        scale={0.8}
        reducedMotion={reducedMotion}
      />
    </group>
  );
});
