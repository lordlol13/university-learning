import { storkGeometry, storkMaterials as m } from "./stork-materials";
import type { BoundStorkRig } from "./StorkRig";
import type { StorkPoseProps } from "./types";

export function StorkFace({
  rig,
  quality,
}: {
  rig: BoundStorkRig;
  quality: StorkPoseProps["quality"];
}) {
  const g = storkGeometry[quality],
    b = rig.bind;
  return (
    <>
      {([-1, 1] as const).map((side) => {
        const name = side === -1 ? "left" : "right";
        return (
          <group
            key={side}
            position={[side * 0.164, side === -1 ? 0.042 : 0.032, 0.270]}
            rotation={[0, side * 0.1, side * -0.018]}
          >
            <mesh
              geometry={g.sphere}
              material={m.white}
              scale={[0.175, 0.205, 0.075]}
            />
            <group name={`eye_${name}`} ref={b(`eye_${name}`)}>
              <mesh
                geometry={g.sphere}
                material={m.eye}
                position={[0, 0, 0.067]}
                scale={[0.088, 0.125, 0.025]}
              />
              <mesh
                geometry={g.detail}
                material={m.white}
                position={[-0.025, 0.045, 0.091]}
                scale={[0.024, 0.031, 0.008]}
              />
              {quality !== "low" && (
                <mesh
                  geometry={g.detail}
                  material={m.white}
                  position={[0.031, -0.028, 0.092]}
                  scale={[0.01, 0.012, 0.006]}
                />
              )}
            </group>
            <group
              name={`eyelid_${name}`}
              ref={b(`eyelid_${name}`)}
              rotation={[-1.48, 0, 0]}
            >
              <mesh
                geometry={g.lid}
                material={m.wing}
                scale={[0.183, 0.217, 0.088]}
              />
            </group>
            <group
              name={`brow_${name}`}
              ref={b(`brow_${name}`)}
              position={[0, 0.246, -0.025]}
            >
              <mesh
                geometry={g.detail}
                material={m.black}
                scale={[0.105, 0.018, 0.018]}
                rotation={[0, 0, side * 0.08]}
              />
            </group>
          </group>
        );
      })}
      <group
        ref={b("beak_upper")}
        name="beak_upper"
        position={[0, -0.087, 0.32]}
      >
        <mesh
          geometry={g.beak}
          material={m.orange}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1, 1.02, 0.72]}
          castShadow
        />
      </group>
      <group
        ref={b("beak_lower")}
        name="beak_lower"
        position={[0, -0.183, 0.32]}
      >
        <mesh
          geometry={g.beak}
          material={m.orange}
          rotation={[Math.PI / 2 - 0.093, 0, 0]}
          scale={[0.91, 0.98, 0.32]}
          castShadow
        />
        <mesh
          geometry={g.detail}
          material={m.beakLower}
          position={[0, 0.045, 0.27]}
          rotation={[-0.093, 0, 0]}
          scale={[0.095, 0.012, 0.22]}
        />
      </group>
      <group
        ref={b("cap")}
        name="cap"
        position={[0, 0.32, -0.005]}
        rotation={[0.045, 0.17, -0.11]}
      >
        <mesh
          geometry={g.sphere}
          material={m.black}
          position={[0, 0.09, 0]}
          scale={[0.34, 0.09, 0.31]}
          castShadow
        />
        <mesh
          geometry={g.box}
          material={m.black}
          position={[0, 0.145, 0]}
          scale={[1.02, 0.095, 0.88]}
          castShadow
        />
        <mesh
          geometry={g.detail}
          material={m.black}
          position={[0, 0.18, 0]}
          scale={[0.046, 0.025, 0.046]}
        />
        <mesh
          geometry={g.cylinder}
          material={m.gold}
          position={[0.22, 0.17, 0.11]}
          rotation={[Math.PI / 2, 0, -1.1]}
          scale={[0.011, 0.5, 0.011]}
        />
        <group
          ref={b("tassel_01")}
          name="tassel_01"
          position={[0.48, 0.16, 0.25]}
        >
          <mesh
            geometry={g.cylinder}
            material={m.gold}
            position={[0, -0.12, 0]}
            scale={[0.014, 0.24, 0.014]}
          />
          <group ref={b("tassel_02")} name="tassel_02" position={[0, -0.24, 0]}>
            <mesh
              geometry={g.cylinder}
              material={m.gold}
              position={[0, -0.065, 0]}
              scale={[0.036, 0.13, 0.036]}
              castShadow
            />
            <mesh
              geometry={g.detail}
              material={m.gold}
              scale={[0.037, 0.028, 0.037]}
            />
          </group>
        </group>
      </group>
    </>
  );
}
