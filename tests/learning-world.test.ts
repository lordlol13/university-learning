import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createLearningEvents,
  type LearningEvent,
} from "../src/lib/learning-events";
import { StorkController } from "../src/lib/stork-controller";
import {
  createWorldCurve,
  createRoadGeometry,
  sampleWorldPath,
} from "../src/lib/world-geometry";
import { aiLearningWorld } from "../src/data/learning-world";
import { allLessons } from "../src/data/curriculum";
import { createProgressStore } from "../src/stores/progress-store";

// This file tests events rather than persistence; keep browser storage available in Node.
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  },
});

test("all curriculum platforms have unique, increasing arc-length placements", () => {
  const placements = aiLearningWorld.lessons;
  assert.deepEqual(
    placements.map((p) => p.lessonId),
    allLessons.map((l) => l.id),
  );
  placements.forEach((placement, i) => {
    assert.ok(placement.t > 0 && placement.t < 1);
    if (i) assert.ok(placement.t > placements[i - 1].t);
  });
  const curve = createWorldCurve(aiLearningWorld);
  for (const placement of placements) {
    const center = curve.getPointAt(placement.t);
    assert.ok(sampleWorldPath(curve, placement.t).distanceTo(center) < 1e-6);
    const side = sampleWorldPath(curve, placement.t, -1.12);
    assert.ok(Math.abs(side.y - center.y) < 1e-6);
    assert.ok(side.distanceTo(center) > 1.1);
  }
});
test("the spline road is a closed thick mesh with finite positions and normals", () => {
  const geometry = createRoadGeometry(
    createWorldCurve(aiLearningWorld),
    aiLearningWorld.roadWidth,
    aiLearningWorld.roadDepth,
  );
  assert.ok(geometry.index);
  assert.ok(geometry.getAttribute("position").count > 1000);
  assert.ok(
    Array.from(geometry.getAttribute("position").array).every(Number.isFinite),
  );
  assert.ok(
    Array.from(geometry.getAttribute("normal").array).every(Number.isFinite),
  );
  const edges = new Map<string, number>();
  const indices = geometry.index.array;
  for (let i = 0; i < indices.length; i += 3) {
    for (const [a, b] of [
      [indices[i], indices[i + 1]],
      [indices[i + 1], indices[i + 2]],
      [indices[i + 2], indices[i]],
    ]) {
      const key = [a, b].sort((x, y) => x - y).join(":");
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }
  assert.ok(
    [...edges.values()].every((count) => count === 2),
    "Every road edge must have two faces, including end caps",
  );
  geometry.dispose();
});
test("completion emits one coherent reaction sequence after state is updated", () => {
  const events = createLearningEvents();
  const store = createProgressStore(events);
  const captured: LearningEvent[] = [];
  const unsubscribe = events.subscribe((event) => {
    captured.push(event);
    assert.equal(store.getState().xp, 477);
  });
  assert.equal(store.getState().completeLesson("machine-learning"), true);
  assert.deepEqual(
    captured.map((e) => e.type),
    ["LESSON_COMPLETED", "XP_GAINED", "CURRENT_LESSON_CHANGED"],
  );
  assert.equal(
    captured[2].type === "CURRENT_LESSON_CHANGED" && captured[2].lessonId,
    "databases",
  );
  assert.equal(store.getState().completeLesson("machine-learning"), false);
  assert.equal(captured.length, 3);
  unsubscribe();
  store.getState().startLesson("databases");
  assert.equal(captured.length, 3);
});
test("a higher-priority celebration wins, then queued navigation returns to idle", () => {
  const controller = new StorkController();
  controller.request("wave", "hover", 1);
  controller.request("celebrate", "lessonComplete", 2);
  controller.request("wave", "click", 1);
  controller.request("point", "navigation", 1);
  assert.equal(controller.animation, "celebrate");
  for (let i = 0; i < 21; i++) controller.update(0.1);
  assert.equal(controller.animation, "wave");
  for (let i = 0; i < 11; i++) controller.update(0.1);
  assert.equal(controller.animation, "point");
  for (let i = 0; i < 12; i++) controller.update(0.1);
  assert.equal(controller.animation, "idle");
});
test("level and achievement events carry the newly earned values", () => {
  const events = createLearningEvents(),
    store = createProgressStore(events);
  const captured: LearningEvent[] = [];
  events.subscribe((event) => captured.push(event));
  for (const id of ["machine-learning", "databases", "deep-learning"]) {
    store.getState().startLesson(id);
    store.getState().completeLesson(id);
  }
  assert.ok(
    captured.some((event) => event.type === "LEVEL_UP" && event.level === 3),
  );
  assert.ok(
    captured.some(
      (event) =>
        event.type === "ACHIEVEMENT_UNLOCKED" &&
        event.achievementId === "ai-explorer",
    ),
  );
  assert.equal(
    captured.filter((event) => event.type === "LESSON_COMPLETED").length,
    3,
  );
  assert.equal(store.getState().currentLessonId, null);
});
test("hover cooldown prevents repeated reactions and walk remains the navigation base", () => {
  const controller = new StorkController();
  controller.setBase("walk");
  assert.equal(controller.animation, "walk");
  assert.equal(controller.request("wave", "hover", 1), true);
  assert.equal(controller.request("wave", "hover", 1), false);
  for (let i = 0; i < 12; i++) controller.update(0.1);
  assert.equal(controller.animation, "walk");
  controller.setBase("idle");
  assert.equal(controller.animation, "idle");
});

import { resolveStorkClip, storkAnimations } from "../src/data/world-config";

test("GLB clip lookup is case insensitive and missing reactions fall back to Idle", () => {
  const clips = ["Idle", "Walk", "Point"];
  assert.equal(resolveStorkClip(clips, "walk"), "Walk");
  assert.equal(resolveStorkClip(clips, "celebrate"), "Idle");
  assert.equal(resolveStorkClip([], "celebrate"), null);
  assert.equal(resolveStorkClip(["Walk"], "thinking"), null);
  assert.equal(resolveStorkClip(clips, "pointLeft"), "Point");
  assert.equal(resolveStorkClip(["Idle", "Success"], "success"), "Success");
  for (const state of storkAnimations)
    assert.equal(resolveStorkClip(["Idle"], state), "Idle");
});

test("deactivating an assistant clears pending reactions before it is opened again", () => {
  const controller = new StorkController();
  controller.request("celebrate", "lessonComplete");
  controller.request("wave", "click");
  controller.setBase("walk");
  controller.reset();
  assert.equal(controller.animation, "idle");
  controller.update(0.1);
  assert.equal(controller.animation, "idle");
  assert.equal(controller.request("wave", "click"), true);
});
