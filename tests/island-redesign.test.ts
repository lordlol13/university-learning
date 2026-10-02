import { test } from "node:test";
import assert from "node:assert/strict";
import { Shape } from "three";
import {
  aiLearningWorld,
  physicsLearningWorld,
  mathLearningWorld,
  italianLearningWorld,
  learningWorlds,
} from "../src/data/learning-world";
import { createWorldCurve } from "../src/lib/world-geometry";

const terrainShape = new Shape();
terrainShape.moveTo(-4, -9.6);
terrainShape.bezierCurveTo(-7.7, -8.7, -6.4, -3.5, -6.4, 0);
terrainShape.bezierCurveTo(-7, 4.7, -5.6, 9.7, -1.1, 10.1);
terrainShape.bezierCurveTo(4, 10.8, 6.1, 8.4, 6.2, 3.5);
terrainShape.bezierCurveTo(6.7, -2, 6.3, -8.9, 3.5, -9.7);
terrainShape.bezierCurveTo(1, -10.6, -1.7, -10.1, -4, -9.6);

const polyPoints = terrainShape.getPoints(300);

function isInsideTerrain(x: number, z: number, margin = 0.35): boolean {
  let inside = false;
  for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
    const xi = polyPoints[i].x;
    const zi = polyPoints[i].y;
    const xj = polyPoints[j].x;
    const zj = polyPoints[j].y;
    const intersect =
      zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  if (!inside) return false;

  for (let i = 0; i < polyPoints.length; i++) {
    const d = Math.hypot(polyPoints[i].x - x, polyPoints[i].y - z);
    if (d < margin) return false;
  }
  return true;
}

const SIGNPOSTS = [
  { name: "prevSign", x: 3.5, z: -1.8, radius: 0.45, interactive: true },
  { name: "nextSign", x: -3.8, z: -0.6, radius: 0.45, interactive: true },
];

const SCENERY_BY_WORLD: Record<
  string,
  { name: string; x: number; z: number; radius: number; interactive?: boolean }[]
> = {
  "ai-ml": [
    { name: "NeuralLattice", x: -4.4, z: -2.4, radius: 0.8 },
    { name: "QuantumCore", x: 4.8, z: -5.4, radius: 0.8 },
    { name: "TechOverlook", x: -4.4, z: 5.4, radius: 1.05, interactive: true },
  ],
  "physics-engineering": [
    { name: "WindTurbine", x: 4.8, z: -5.6, radius: 0.85 },
    { name: "HarmonicPendulum", x: -4.4, z: -2.4, radius: 0.85 },
    { name: "OpticalPrism", x: 4.5, z: 3.8, radius: 0.8 },
    { name: "WeatherStationRadar", x: -4.4, z: 5.4, radius: 0.9 },
    { name: "VectorGimbal", x: -1.2, z: -2.4, radius: 0.8 },
  ],
  mathematics: [
    { name: "GeometricSolids", x: -4.4, z: 5.4, radius: 0.95 },
    { name: "MobiusLoop", x: -4.4, z: -2.4, radius: 0.85 },
    { name: "ArchimedeanSpiral", x: 4.8, z: -5.4, radius: 0.9 },
    { name: "SineWaveRibbon", x: 4.5, z: 3.8, radius: 0.8 },
  ],
  "italian-language": [
    { name: "RenaissanceFountain", x: -4.4, z: 5.4, radius: 1.2 },
    { name: "MarbleColonnade", x: 4.8, z: -5.4, radius: 1.5 },
    { name: "TerracottaUrns", x: 4.5, z: 3.8, radius: 0.85 },
    { name: "StoneBalustrades", x: -4.6, z: -2.3, radius: 1.15 },
  ],
};

const STATIC_PROPS = [
  { name: "IslandPond", x: -5.2, z: -7.0, radius: 1.15 },
  { name: "ParkStreetlamp1", x: -2.6, z: -3.8, radius: 0.25 },
  { name: "ParkStreetlamp2", x: 3.2, z: 1.2, radius: 0.25 },
  { name: "StoneCampusBench1", x: 5.5, z: -0.8, radius: 0.65, interactive: true },
  { name: "StoneCampusBench2", x: -5.7, z: 0.0, radius: 0.65, interactive: true },
  { name: "CliffsideFence1", x: -6.0, z: -1.2, radius: 0.55 },
  { name: "CliffsideFence2", x: 5.7, z: 1.4, radius: 0.55 },
  { name: "MossyRock1", x: -5.8, z: -5.2, radius: 0.35 },
  { name: "MossyRock2", x: 5.5, z: -3.4, radius: 0.35 },
  { name: "MossyRock3", x: 3.8, z: -8.4, radius: 0.35 },
  { name: "MossyRock4", x: 4.2, z: 7.2, radius: 0.35 },
  { name: "SteppingStone1", x: -2.2, z: 4.8, radius: 0.2 },
  { name: "SteppingStone2", x: -2.5, z: 4.8, radius: 0.2 },
  { name: "SteppingStone3", x: -2.8, z: 4.8, radius: 0.2 },
  { name: "GardenBed1", x: -3.4, z: 2.7, radius: 0.65 },
  { name: "GardenBed2", x: 3.1, z: 2.8, radius: 0.65 },
  { name: "GardenBed3", x: 2.5, z: 0.5, radius: 0.65 },
  { name: "GardenBed4", x: -5.8, z: -3.8, radius: 0.65 },
];

test("all campus islands have zero mesh clipping and generous clearance from road, platforms, and signposts", () => {
  assert.equal(learningWorlds.length, 4);

  for (const world of learningWorlds) {
    const curve = createWorldCurve(world);
    const platforms = world.lessons.map((l) => ({
      ...curve.getPointAt(l.t),
      lessonId: l.lessonId,
      radius: 1.25,
    }));
    const scenery = SCENERY_BY_WORLD[world.directionId] ?? [];

    type TestEntity = {
      name: string;
      x: number;
      z: number;
      radius: number;
      interactive?: boolean;
    };

    const allEntities: TestEntity[] = [
      ...world.buildings.map((b, i) => ({
        name: `building-${b.variant ?? i}`,
        x: b.position[0],
        z: b.position[2],
        radius:
          b.variant === "main" || b.variant === "villa" || b.variant === "observatory"
            ? 2.05
            : 1.05,
      })),
      ...world.trees.map((t, i) => ({
        name: `tree-${t.variant}-${i}`,
        x: t.position[0],
        z: t.position[2],
        radius:
          t.variant === "cypress"
            ? 0.4 * t.scale
            : t.variant === "birch"
              ? 0.55 * t.scale
              : t.variant === "tall" || t.variant === "pine"
                ? 0.65 * t.scale
                : 0.8 * t.scale,
      })),
      ...scenery,
      ...STATIC_PROPS,
    ];

    for (let i = 0; i < allEntities.length; i++) {
      const e1 = allEntities[i];

      // 1. Road spline clearance (half-width 1.4m + entity radius)
      let minRoadDist = Infinity;
      for (let step = 0; step <= 400; step++) {
        const rp = curve.getPointAt(step / 400);
        const d = Math.hypot(rp.x - e1.x, rp.z - e1.z);
        if (d < minRoadDist) minRoadDist = d;
      }
      const reqRoad = 1.4 + e1.radius;
      assert.ok(
        minRoadDist >= reqRoad,
        `${world.directionId} entity ${e1.name} at (${e1.x.toFixed(2)}, ${e1.z.toFixed(2)}) clips road: ${minRoadDist.toFixed(2)}m < ${reqRoad.toFixed(2)}m`,
      );

      // 2. Lesson platforms clearance (platform radius 1.25m + entity radius)
      for (let pIdx = 0; pIdx < platforms.length; pIdx++) {
        const pl = platforms[pIdx];
        const d = Math.hypot(pl.x - e1.x, pl.z - e1.z);
        const reqPlat = pl.radius + e1.radius;
        assert.ok(
          d >= reqPlat,
          `${world.directionId} entity ${e1.name} clips platform ${pIdx} (${world.lessons[pIdx].lessonId}): ${d.toFixed(2)}m < ${reqPlat.toFixed(2)}m`,
        );
      }

      // 3. Island signposts clearance (base 0.45m, click target 1.1m for interactive)
      for (const sp of SIGNPOSTS) {
        const d = Math.hypot(sp.x - e1.x, sp.z - e1.z);
        const reqSign = sp.radius + e1.radius;
        assert.ok(
          d >= reqSign,
          `${world.directionId} entity ${e1.name} clips ${sp.name}: ${d.toFixed(2)}m < ${reqSign.toFixed(2)}m`,
        );
        if (e1.interactive) {
          const reqTarget = 1.1 + e1.radius;
          assert.ok(
            d >= reqTarget,
            `${world.directionId} interactive entity ${e1.name} inside click target of ${sp.name}: ${d.toFixed(2)}m < ${reqTarget.toFixed(2)}m`,
          );
        }
      }

      // 4. Pairwise entity clearance (sum of physical bounding radii)
      for (let j = i + 1; j < allEntities.length; j++) {
        const e2 = allEntities[j];
        if (e1.name.startsWith("SteppingStone") && e2.name.startsWith("SteppingStone")) continue;
        const d = Math.hypot(e1.x - e2.x, e1.z - e2.z);
        const reqPair = e1.radius + e2.radius;
        assert.ok(
          d >= reqPair,
          `${world.directionId} physical collision between ${e1.name} and ${e2.name}: ${d.toFixed(2)}m < ${reqPair.toFixed(2)}m`,
        );
      }

      // 5. Island perimeter bounds (all entities strictly inside island lawn, not hanging off cliff)
      assert.ok(
        isInsideTerrain(e1.x, e1.z, Math.max(0.3, e1.radius * 0.4)),
        `${world.directionId} entity ${e1.name} at (${e1.x.toFixed(2)}, ${e1.z.toFixed(2)}) is placed outside or too close to island cliff!`,
      );
    }
  }
});

test("all tree variants are recognized species with rich distributions", () => {
  const allowedVariants = new Set([
    "round",
    "tall",
    "pine",
    "cherry",
    "cypress",
    "birch",
  ]);

  for (const world of [
    aiLearningWorld,
    physicsLearningWorld,
    mathLearningWorld,
    italianLearningWorld,
  ]) {
    assert.ok(world.trees.length >= 10, `${world.directionId} should have at least 10 trees to fill island`);
    for (const tree of world.trees) {
      assert.ok(
        allowedVariants.has(tree.variant),
        `Tree variant ${tree.variant} is not valid`,
      );
      assert.ok(tree.scale >= 0.6 && tree.scale <= 1.5, "Tree scale should be normalized");
    }
  }
});
