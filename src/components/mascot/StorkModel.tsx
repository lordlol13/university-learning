import { storkDesign } from "./stork-config";
import { storkGeometry, storkMaterials as m } from "./stork-materials";
import { StorkSurface } from "./StorkSurface";
import { StorkFace } from "./StorkFace";
import type { BoundStorkRig } from "./StorkRig";
import type { StorkPoseProps } from "./types";

/** Logical joints are stable attachment points for a future Blender skeleton. +Z is forward, feet are at Y=0. */
export function StorkModel({
  rig,
  quality,
  backpack = true,
}: {
  rig: BoundStorkRig;
  quality: StorkPoseProps["quality"];
  backpack?: boolean;
}) {
  const g = storkGeometry[quality],
    b = rig.bind;
  return (
    <group ref={b("root")} name="root" dispose={null}>
      {(["L", "R"] as const).map((side, i) => (
        <group
          key={side}
          ref={b(`leg_${side}_upper`)}
          name={`leg_${side}_upper`}
          position={[(i ? 1 : -1) * 0.18, storkDesign.hipHeight, i ? -0.035 : 0.105]}
          rotation={[0, i ? -0.1 : 0.15, i ? 0.035 : -0.035]}
        >
          <mesh
            geometry={g.shin}
            material={m.orange}
            position={[0, -0.22, 0]}
            scale={[0.060, 0.46, 0.057]}
            castShadow
          />
          <group
            ref={b(`leg_${side}_lower`)}
            name={`leg_${side}_lower`}
            position={[0, -0.45, 0]}
          >
            <mesh
              geometry={g.detail}
              material={m.orange}
              scale={[0.057, 0.061, 0.054]}
            />
            <mesh
              geometry={g.shin}
              material={m.orange}
              position={[0, -0.235, 0.006]}
              scale={[0.048, 0.47, 0.046]}
              castShadow
            />
            <group
              ref={b(`foot_${side}`)}
              name={`foot_${side}`}
              position={[0, -0.51, 0]}
            >
              <mesh
                geometry={g.detail}
                material={m.orange}
                position={[0, 0, 0.055]}
                scale={[0.145, 0.06, 0.15]}
                castShadow
              />
              {[-1, 0, 1].map((toe) => (
                <mesh
                  key={toe}
                  geometry={g.detail}
                  material={m.orange}
                  position={[toe * 0.09, -0.02, 0.18 - Math.abs(toe) * 0.025]}
                  rotation={[0, toe * 0.28, 0]}
                  scale={[0.043, 0.04, 0.18]}
                  castShadow
                />
              ))}
            </group>
          </group>
        </group>
      ))}
      <group
        ref={b("body")}
        name="body"
        position={[0, storkDesign.bodyHeight, 0]}
        rotation={[storkDesign.torsoLean, 0.065, 0]}
      >
        <StorkSurface rig={rig} geometry={g.body} />
        <group
          ref={b("tail")}
          name="tail"
          position={[0, -0.31, -0.22]}
          rotation={[0.35, 0, 0]}
        >
          {[-1, 0, 1].map((i) => (
            <mesh
              key={i}
              geometry={g.detail}
              material={m.black}
              position={[i * 0.11, 0, -0.07]}
              scale={[0.085, 0.065, 0.16]}
              rotation={[0, i * -0.2, 0]}
              castShadow
            />
          ))}
        </group>
        <group ref={b("chest")} name="chest" position={[0, 0.19, 0.02]}>
          <group ref={b("neck_01")} name="neck_01" position={[0, 0.27, -0.025]}>
            <group
              ref={b("neck_02")}
              name="neck_02"
              position={[0, 0.31, 0.035]}
            >
              <group ref={b("head")} name="head" position={[0, 0.30, 0.09]} scale={storkDesign.headScale}>
                <StorkFace rig={rig} quality={quality} />
              </group>
            </group>
          </group>
        </group>
        {(["L", "R"] as const).map((side, i) => {
          const sign = i ? 1 : -1;
          return (
            <group
              key={side}
              ref={b(`wing_${side}_shoulder`)}
              name={`wing_${side}_shoulder`}
              position={[sign * 0.32, 0.30, 0.025]}
              scale={storkDesign.wingScale}
              rotation={[-0.1, 0, sign * (i ? 0.48 : 0.28)]}
            >
              <mesh
                geometry={g.wing}
                material={m.wing}
                position={[sign * 0.05, 0, 0]}
                castShadow
              />
              <group
                ref={b(`wing_${side}_mid`)}
                name={`wing_${side}_mid`}
                position={[sign * 0.06, -0.39, 0.018]}
              >
                <group
                  ref={b(`wing_${side}_tip`)}
                  name={`wing_${side}_tip`}
                  position={[0, -0.12, 0]}
                >
                  {[0, 1, 2, 3]
                    .slice(0, quality === "low" ? 3 : 4)
                    .map((feather) => (
                      <mesh
                        key={feather}
                        geometry={g.detail}
                        material={m.black}
                        position={[
                          sign * (feather * 0.073 - 0.08),
                          -0.1 + feather * 0.038,
                          0.018,
                        ]}
                        rotation={[0, 0, sign * feather * 0.13]}
                        scale={[0.067, 0.205 - feather * 0.014, 0.1]}
                        castShadow
                      />
                    ))}
                </group>
              </group>
            </group>
          );
        })}
        {backpack && (
          <group name="backpack" position={[0, 0.1, -0.27]}>
            <mesh
              geometry={g.head}
              material={m.green}
              position={[0, 0, -0.065]}
              scale={[0.72, 0.80, 0.37]}
              castShadow
            />
            <mesh
              geometry={g.box}
              material={m.green}
              position={[0, -0.1, -0.195]}
              scale={[0.38, 0.23, 0.065]}
              castShadow
            />
            <mesh
              geometry={g.box}
              material={m.gold}
              position={[0, 0.1, -0.22]}
              scale={[0.08, 0.065, 0.012]}
              rotation={[0, 0, Math.PI / 4]}
            />
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                geometry={g.strap}
                material={m.green}
                position={[0, -0.1, 0.27]}
                scale={[side, 1, 1]}
                castShadow
              />
            ))}
          </group>
        )}
      </group>
    </group>
  );
}
