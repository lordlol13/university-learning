"use client";
import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { storkJointNames } from "./StorkRig";
export interface CharacterStats {
  fps: number;
  triangles: number;
  calls: number;
  materials: number;
}
export default function StorkDebug({
  model,
  rig,
  bounds,
  onStats,
}: {
  model: RefObject<Group | null>;
  rig: boolean;
  bounds: boolean;
  onStats: (stats: CharacterStats) => void;
}) {
  const box = useMemo(() => new Box3(), []);
  const positions = useMemo(
    () => new Float32Array(storkJointNames.length * 6),
    [],
  );
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  const a = useRef(new Vector3()),
    b = useRef(new Vector3()),
    elapsed = useRef(0),
    frames = useRef(0);
  useFrame(({ gl }, delta) => {
    if (!model.current) return;
    if (bounds) box.setFromObject(model.current);
    if (rig) {
      let index = 0;
      model.current.traverse((object) => {
        if (
          !storkJointNames.some((name) => name === object.name) ||
          !object.parent ||
          index >= storkJointNames.length * 2
        )
          return;
        object.getWorldPosition(a.current);
        object.parent.getWorldPosition(b.current);
        const attr = geometry.getAttribute("position");
        attr.setXYZ(index++, a.current.x, a.current.y, a.current.z);
        attr.setXYZ(index++, b.current.x, b.current.y, b.current.z);
      });
      geometry.setDrawRange(0, index);
      geometry.getAttribute("position").needsUpdate = true;
      geometry.computeBoundingSphere();
    }
    elapsed.current += delta;
    frames.current++;
    if (elapsed.current > 1) {
      let triangles = 0;
      const materials = new Set();
      model.current.traverse((object) => {
        const mesh = object as Mesh;
        if (!mesh.isMesh || !mesh.visible) return;
        triangles +=
          (mesh.geometry.index?.count ??
            mesh.geometry.getAttribute("position")?.count ??
            0) / 3;
        for (const material of Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material])
          materials.add(material.uuid);
      });
      onStats({
        fps: Math.round(frames.current / elapsed.current),
        triangles,
        calls: gl.info.render.calls,
        materials: materials.size,
      });
      elapsed.current = 0;
      frames.current = 0;
    }
  });
  return (
    <group>
      {rig && (
        <>
          <axesHelper args={[0.5]} />
          <lineSegments geometry={geometry}>
            <lineBasicMaterial
              color="#d24cd0"
              depthTest={false}
              transparent
              opacity={0.9}
            />
          </lineSegments>
        </>
      )}
      {bounds && <box3Helper args={[box, new Color("#287fde")]} />}
    </group>
  );
}
