"use client";
import { memo, useMemo } from "react";
import { CatmullRomCurve3, TubeGeometry } from "three";
import { createRoadGeometry, sampleWorldPath } from "@/lib/world-geometry";
import type { LearningWorldData } from "@/types/learning-world";

export const Road = memo(function Road({
  curve,
  data,
}: {
  curve: CatmullRomCurve3;
  data: LearningWorldData;
}) {
  const geometry = useMemo(
    () => createRoadGeometry(curve, data.roadWidth, data.roadDepth),
    [curve, data],
  );
  const edges = useMemo(
    () =>
      [-1, 1].map((side) => {
        const points = Array.from({ length: 81 }, (_, i) => {
          const point = sampleWorldPath(
            curve,
            i / 80,
            side * (data.roadWidth / 2 - 0.13),
          );
          point.y += data.roadDepth / 2 + 0.025;
          return point;
        });
        return new TubeGeometry(
          new CatmullRomCurve3(points),
          100,
          0.045,
          6,
          false,
        );
      }),
    [curve, data],
  );
  return (
    <group name="raised-spline-road">
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.67} />
      </mesh>
      {edges.map((edge, i) => (
        <mesh key={i} geometry={edge} castShadow>
          <meshStandardMaterial color="#fff6de" roughness={0.58} />
        </mesh>
      ))}
      {[0.08, 0.31, 0.54, 0.78, 0.98].map((t) => {
        const point = curve.getPointAt(t);
        const height = point.y - data.roadDepth / 2 - 0.05;
        return (
          <mesh
            key={t}
            position={[point.x, height / 2 + 0.05, point.z]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.47, 0.62, height, 12]} />
            <meshStandardMaterial color="#d3cbb4" roughness={0.86} />
          </mesh>
        );
      })}
    </group>
  );
});
