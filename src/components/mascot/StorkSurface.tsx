"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferGeometry, SkinnedMesh } from "three";
import { storkDesign } from "./stork-config";
import { storkMaterials } from "./stork-materials";
import { createStorkSkin, type BoundStorkRig } from "./StorkRig";

/** GPU skinning joins the crown, throat and chest without a visible head seam.
 * The existing logical rig still owns every pose; these two bones only deform its surface.
 */
export function StorkSurface({ rig, geometry }: { rig: BoundStorkRig; geometry: BufferGeometry }) {
  const mesh = useRef<SkinnedMesh>(null);
  const skin = useMemo(() => createStorkSkin(), []);
  useLayoutEffect(() => {
    mesh.current?.bind(skin.skeleton, skin.identity);
  }, [skin]);
  useEffect(() => () => skin.skeleton.dispose(), [skin]);
  useFrame(() => {
    const { body, head } = rig.joints.current;
    if (!body || !head) return;
    body.updateWorldMatrix(true, false);
    head.updateWorldMatrix(true, false);
    skin.relative.copy(body.matrixWorld).invert().multiply(head.matrixWorld);
    skin.relative.decompose(skin.head.position, skin.head.quaternion, skin.head.scale);
    // Head accessories have their own size; the surface is already built to that size.
    skin.head.scale.divideScalar(storkDesign.headScale);
    skin.head.updateMatrixWorld(true);
  });
  return (
    <skinnedMesh ref={mesh} geometry={geometry} material={storkMaterials.white} castShadow frustumCulled={false}>
      <primitive object={skin.root} />
    </skinnedMesh>
  );
}
