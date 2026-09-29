"use client";
import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ExtrudeGeometry, Shape, type Group } from "three";
import type { LearningWorldData, Point3 } from "@/types/learning-world";
import { worldConfig } from "@/data/world-config";
import { PhysicsScenery } from "./PhysicsObjects";
import { ItalianScenery, MathScenery } from "./WorldScenery";
import {
  AILandmark,
  FlowerPatches,
  IslandClouds,
  ItalianFountain,
  KineticTurbine,
  MountainMounds,
  WaterDrops,
} from "./IslandSceneryElements";

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
    // Enlarged, organically contoured island terrain (~28% broader surface area)
    const shape = new Shape();
    shape.moveTo(-5.2, -12.4);
    shape.bezierCurveTo(-10.2, -11.4, -8.6, -4.4, -8.4, 0);
    shape.bezierCurveTo(-9.2, 5.8, -7.6, 12.6, -1.6, 13.1);
    shape.bezierCurveTo(5.4, 13.8, 8.8, 10.8, 9.1, 4.4);
    shape.bezierCurveTo(9.6, -2.4, 8.8, -11.5, 4.8, -12.6);
    shape.bezierCurveTo(1.4, -13.4, -2.4, -13.0, -5.2, -12.4);
    return new ExtrudeGeometry(shape, {
      depth: 0.52,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.32,
      bevelThickness: 0.22,
      curveSegments: 22,
    });
  }, []);

  return (
    <group name="university-environment">
      <ambientLight intensity={0.65} color="#fffdf5" />
      <hemisphereLight args={["#e8f3ff", "#1a6eb5", 0.65]} />
      <directionalLight
        position={[-9, 18, 10]}
        intensity={2.5}
        color="#fff2d6"
        castShadow
        shadow-mapSize={[worldConfig.shadowSize, worldConfig.shadowSize]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-normalBias={0.035}
        shadow-bias={-0.0002}
        shadow-radius={3}
      />
      <directionalLight
        position={[8, 9, -9]}
        intensity={0.5}
        color="#d1e7ff"
      />

      {/* Layer 1: Lush Grassy Top Island Surface */}
      <mesh
        geometry={terrain}
        position={[0, 0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#6fb644" roughness={0.93} />
      </mesh>

      {/* Layer 2: Earthen Subsurface Soil & Sand Shelf */}
      <mesh
        geometry={terrain}
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.022, 1.018, 1.55]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#c2b289" roughness={1} />
      </mesh>

      {/* Layer 3: Rocky Cliff Base descending into ocean */}
      <mesh
        geometry={terrain}
        position={[0, -0.65, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[0.96, 0.94, 2.9]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#5a6570" roughness={1} />
      </mesh>

      {/* Deep Blue Ocean Surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.12, 0]}
        receiveShadow
      >
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial
          color="#1a6eb5"
          emissive="#0d4f8a"
          emissiveIntensity={0.18}
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {/* Shallow Turquoise Shore Rim */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.08, 0]}
      >
        <ringGeometry args={[8.5, 11.5, 48]} />
        <meshStandardMaterial
          color="#38a8d0"
          transparent
          opacity={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Shoreline Foam / Wave Froth Ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, 0]}
      >
        <ringGeometry args={[7.8, 8.8, 48]} />
        <meshStandardMaterial
          color="#daf0f7"
          transparent
          opacity={0.45}
          roughness={0.9}
        />
      </mesh>

      {/* Mountain Mounds & Alpine Peaks */}
      <MountainMounds />

      {/* Clouds Clustered at Island Ends (North & South extremities) */}
      <IslandClouds reducedMotion={reducedMotion} />

      {/* Animated Cascading Waterdrops & Floating Dewdrops */}
      <WaterDrops reducedMotion={reducedMotion} />

      {/* Cheerful Wildflower Blossom Clusters */}
      <FlowerPatches />

      {/* Island Trees */}
      {data.trees.map((tree, i) => (
        <Tree key={i} {...tree} />
      ))}

      {/* Campus Buildings */}
      {data.buildings.map((building, i) => (
        <UniversityBuilding key={i} {...building} />
      ))}

      {/* Discipline-Specific Lively & Didactic Scenery */}
      {data.directionId === "ai-ml" && <AILandmark />}
      {data.directionId === "physics-engineering" && (
        <>
          <KineticTurbine />
          <PhysicsScenery />
        </>
      )}
      {data.directionId === "mathematics" && <MathScenery />}
      {data.directionId === "italian-language" && (
        <>
          <ItalianFountain />
          <ItalianScenery />
        </>
      )}

      {/* Bush & Shrub Foliage Clusters */}
      {data.trees.flatMap((tree, i) =>
        [0, 1].map((j) => (
          <mesh
            key={`${i}-${j}`}
            position={[
              tree.position[0] + (j ? 0.6 : -0.58),
              0.39,
              tree.position[2] + 0.55,
            ]}
            scale={[0.42, 0.28 + j * 0.16, 0.38]}
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

      {/* Natural Ground Stones and Boulders */}
      {[
        [-5.4, 0.28, 4.4],
        [4.8, 0.26, -3.8],
        [-3.2, 0.3, -9.2],
        [5.4, 0.24, 8.2],
        [-6.5, 0.26, -2.2],
        [6.2, 0.25, 3.4],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as Point3}
          rotation={[0.2, i, 0.1]}
          scale={[0.5, 0.32, 0.42]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#b6b9a6" roughness={1} />
        </mesh>
      ))}

      {/* Mid-altitude Floating Island Drift Clouds */}
      <Cloud
        position={[-6.2, 4.2, -6.2]}
        scale={1.3}
        reducedMotion={reducedMotion}
      />
      <Cloud
        position={[6.2, 4.6, 1.8]}
        scale={1.25}
        reducedMotion={reducedMotion}
      />
      <Cloud
        position={[-5.2, 3.2, 9.4]}
        scale={1.0}
        reducedMotion={reducedMotion}
      />
    </group>
  );
});
