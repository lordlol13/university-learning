import {
  CatmullRomCurve3,
  LatheGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute,
  MathUtils,
  SplineCurve,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";

/** Smooth lofts replace stacked primitives; profiles describe one continuous outer contour. */
function loft(profile: [number, number][], segments: number, samples: number) {
  if (profile[0][1] > profile[profile.length - 1][1])
    profile = [...profile].reverse();
  const points = new SplineCurve(
    profile.map(([r, y]) => new Vector2(r, y)),
  ).getPoints(samples);
  points.forEach((p) => {
    p.x = Math.max(0, p.x);
  });
  return new LatheGeometry(points, segments);
}
export function createCharacterShapes(segments: number) {
  const head = loft(
    [
      [0, -1],
      [0.48, -0.84],
      [0.88, -0.53],
      [1.02, -0.12],
      [0.98, 0.35],
      [0.74, 0.78],
      [0, 1],
    ],
    segments,
    24,
  );
  head.scale(0.40, 0.435, 0.37);
  const body = loft(
    [
      [0, -0.56],
      [0.22, -0.47],
      [0.36, -0.24],
      [0.375, -0.03],
      [0.32, 0.20],
      [0.265, 0.36],
      [0.20, 0.51],
      [0.145, 0.66],
      [0.16, 0.80],
      [0.27, 0.94],
      [0.32, 1.08],
      [0.29, 1.25],
      [0.19, 1.37],
      [0, 1.418],
    ],
    segments,
    56,
  );
  const vertices = body.getAttribute("position");
  const skinIndices: number[] = [], skinWeights: number[] = [];
  for (let i = 0; i < vertices.count; i++) {
    const y = vertices.getY(i), z = vertices.getZ(i);
    // A single surface runs from belly to crown. The throat bends gently back
    // before opening into the smaller pear-shaped head; no intersecting skull.
    const neckT = MathUtils.smoothstep(y, 0.30, 1.07);
    const center = 0.12 * neckT - 0.09 * Math.sin(neckT * Math.PI);
    const headBlend = MathUtils.smoothstep(y, 0.70, 0.94);
    const chestProjection = 0.075 * Math.exp(-Math.pow((y - 0.27) / 0.35, 2));
    const depth = MathUtils.lerp(z > 0 ? 1.04 : 0.74, 0.925, headBlend);
    vertices.setZ(i, z * depth + center + chestProjection * (1 - headBlend));
    const headWeight = MathUtils.smoothstep(y, 0.44, 0.92);
    skinIndices.push(0, 1, 0, 0);
    skinWeights.push(1 - headWeight, headWeight, 0, 0);
  }
  body.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndices, 4));
  body.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));
  body.computeVertexNormals();
  // Lathe UVs duplicate the first meridian. Rejoin its normals after deformation
  // so the soft belly has no artificial vertical lighting seam.
  const normals = body.getAttribute("normal"),
    rows = body.parameters.points.length;
  const normal = new Vector3();
  for (let row = 0; row < rows; row++) {
    const end = segments * rows + row;
    normal
      .set(
        normals.getX(row) + normals.getX(end),
        normals.getY(row) + normals.getY(end),
        normals.getZ(row) + normals.getZ(end),
      )
      .normalize();
    normals.setXYZ(row, normal.x, normal.y, normal.z);
    normals.setXYZ(end, normal.x, normal.y, normal.z);
  }
  const wing = loft(
    [
      [0, 0.09],
      [0.13, 0.025],
      [0.19, -0.15],
      [0.21, -0.34],
      [0.18, -0.50],
      [0.13, -0.60],
      [0, -0.72],
    ],
    segments,
    18,
  );
  wing.scale(1, 1, 0.58);
  const shin = loft(
    [
      [0, -0.5],
      [0.84, -0.48],
      [0.8, -0.3],
      [0.9, 0.17],
      [1, 0.4],
      [0.75, 0.5],
      [0, 0.52],
    ],
    12,
    12,
  );
  const beak = loft(
    [
      [0, -0.06],
      [0.16, -0.015],
      [0.195, 0.07],
      [0.175, 0.22],
      [0.12, 0.48],
      [0.045, 0.76],
      [0.018, 0.89],
      [0, 0.92],
    ],
    segments,
    24,
  );
  const strap = new TubeGeometry(
    new CatmullRomCurve3([
      new Vector3(0.20, 0.2, -0.29),
      new Vector3(0.23, 0.32, -0.13),
      new Vector3(0.255, 0.26, 0.24),
      new Vector3(0.28, 0.02, 0.32),
      new Vector3(0.28, -0.23, 0.27),
      new Vector3(0.24, -0.3, -0.18),
    ]),
    segments,
    0.027,
    8,
    false,
  );
  return { head, body, wing, shin, beak, strap };
}
