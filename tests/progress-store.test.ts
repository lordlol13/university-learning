import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  createProgressStore,
  getDirectionProgress,
  getLessonStatus,
} from "../src/stores/progress-store";
import { allLessons, getLesson } from "../src/data/curriculum";

// A real browser-style storage adapter keeps persistence behavior in the tests.
const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  },
});
beforeEach(() => memory.clear());

test("initial curriculum and progress agree, with 3 of 6 completed", () => {
  const state = createProgressStore().getState();
  assert.deepEqual(getDirectionProgress("ai-ml", state), {
    completed: 3,
    total: 6,
    percent: 50,
  });
  allLessons.forEach((lesson) =>
    assert.equal(getLessonStatus(lesson, state), lesson.status),
  );
  assert.equal(state.level * 250 - state.xp, 143);
});
test("unknown and locked lessons cannot be started, unlocked early, or completed", () => {
  const store = createProgressStore();
  for (const id of ["missing", "databases", "deep-learning"]) {
    assert.equal(store.getState().startLesson(id), false);
    assert.equal(store.getState().unlockLesson(id), false);
    assert.equal(store.getState().completeLesson(id), false);
  }
  assert.equal(store.getState().xp, 357);
});
test("completion awards XP once and unlocks only the next eligible lesson", () => {
  const store = createProgressStore();
  assert.equal(store.getState().completeLesson("machine-learning"), true);
  assert.equal(store.getState().xp, 477);
  assert.equal(store.getState().currentLessonId, "databases");
  assert.equal(
    getLessonStatus(getLesson("databases")!, store.getState()),
    "current",
  );
  assert.equal(
    getLessonStatus(getLesson("deep-learning")!, store.getState()),
    "locked",
  );
  assert.equal(store.getState().completeLesson("machine-learning"), false);
  store.getState().startLesson("machine-learning");
  assert.equal(store.getState().completeLesson("machine-learning"), false);
  assert.equal(store.getState().xp, 477);
});
test("finishing the path advances levels, earns AI Explorer, and leaves no current lesson", () => {
  const store = createProgressStore();
  ["machine-learning", "databases", "deep-learning"].forEach((id) => {
    assert.equal(store.getState().startLesson(id), true);
    assert.equal(store.getState().completeLesson(id), true);
  });
  const state = store.getState();
  assert.equal(state.xp, 747);
  assert.equal(state.level, 3);
  assert.equal(state.currentLessonId, null);
  assert.ok(state.achievements.includes("ai-explorer"));
  assert.deepEqual(getDirectionProgress("ai-ml", state), {
    completed: 6,
    total: 6,
    percent: 100,
  });
});
test("direction selection handles empty curricula without losing earned progress", () => {
  const store = createProgressStore();
  store.getState().setCurrentDirection("data-science");
  assert.equal(store.getState().currentLessonId, null);
  assert.deepEqual(getDirectionProgress("data-science", store.getState()), {
    completed: 0,
    total: 0,
    percent: 0,
  });
  store.getState().setCurrentDirection("does-not-exist");
  assert.equal(store.getState().currentDirectionId, "data-science");
  store.getState().setCurrentDirection("ai-ml");
  assert.equal(store.getState().currentLessonId, "machine-learning");
});
test("persistence rehydrates progress and reset restores the demo", async () => {
  const store = createProgressStore();
  store.getState().completeLesson("machine-learning");
  const reloaded = createProgressStore();
  await reloaded.persist.rehydrate();
  assert.equal(reloaded.getState().xp, 477);
  assert.ok(reloaded.getState().completedLessons.includes("machine-learning"));
  reloaded.getState().resetProgress();
  assert.equal(reloaded.getState().xp, 357);
  assert.equal(reloaded.getState().completedLessons.length, 3);
});
test("XP actions ignore invalid rewards and calculate levels", () => {
  const store = createProgressStore();
  [-1, 0, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER].forEach((xp) =>
    store.getState().addXP(xp),
  );
  assert.equal(store.getState().xp, 357);
  store.getState().addXP(143);
  assert.equal(store.getState().xp, 500);
  assert.equal(store.getState().level, 3);
});
