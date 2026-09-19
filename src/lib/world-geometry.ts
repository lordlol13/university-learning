import {
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  Vector3,
} from "three";
import type { LearningWorldData } from "../types/learning-world";

export const createWorldCurve = (data: LearningWorldData) =>
  new CatmullRomCurve3(
    data.controlPoints.map((point) => new Vector3(...point)),
    false,
    "centripetal",
  );

export function sampleWorldPath(
  curve: CatmullRomCurve3,
  t: number,
  offset = 0,
  target = new Vector3(),
) {
  const clamped = Math.max(0, Math.min(1, t));
  curve.getPointAt(clamped, target);
  if (offset !== 0) {
    const tangent = curve.getTangentAt(clamped);
    target.x += tangent.z * offset;
    target.z -= tangent.x * offset;
  }
  return target;
}

/** Extrude a closed, bevel-shaped road cross-section along the arc-length spline.
 * Top, bevels, walls, underside and end caps are all real indexed geometry.
 */
export function createRoadGeometry(
  curve: CatmullRomCurve3,
  width: number,
  depth: number,
  segments = 160,
) {
  const half = width / 2;
  const bevel = 0.12;
  const profile = [
    [-half + bevel, depth / 2],
    [half - bevel, depth / 2],
    [half - 0.025, depth / 2 - 0.035],
    [half, depth / 2 - bevel],
    [half, -depth / 2 + bevel],
    [half - 0.04, -depth / 2 + 0.035],
    [half - bevel, -depth / 2],
    [-half + bevel, -depth / 2],
    [-half + 0.04, -depth / 2 + 0.035],
    [-half, -depth / 2 + bevel],
    [-half, depth / 2 - bevel],
    [-half + 0.025, depth / 2 - 0.035],
  ];
  const vertices: number[] = [];
  const indices: number[] = [];
  const colors: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const side = new Vector3(tangent.z, 0, -tangent.x).normalize();
    profile.forEach(([x, y], edge) => {
      vertices.push(point.x + side.x * x, point.y + y, point.z + side.z * x);
      const shade = edge <= 2 || edge >= 11 ? 1 : 0.83;
      colors.push(shade, shade * 0.965, shade * 0.85);
    });
  }
  const count = profile.length;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < count; j++) {
      const a = i * count + j,
        b = i * count + ((j + 1) % count);
      const c = (i + 1) * count + j,
        d = (i + 1) * count + ((j + 1) % count);
      indices.push(a, c, b, b, c, d);
    }
  }
  for (const end of [0, segments]) {
    const center = curve.getPointAt(end / segments);
    const centerIndex = vertices.length / 3;
    vertices.push(center.x, center.y, center.z);
    colors.push(0.83, 0.8, 0.7);
    for (let j = 0; j < count; j++) {
      const a = end * count + j,
        b = end * count + ((j + 1) % count);
      if (end === 0) indices.push(centerIndex, a, b);
      else indices.push(centerIndex, b, a);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
