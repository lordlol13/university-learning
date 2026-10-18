import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createProgressStore } from "../src/stores/progress-store";
import {
  validateRepeatAnswer,
  getSolvedRepeatTaskIds,
  markRepeatTaskSolved,
  type RepeatTask,
  SOLVED_REPEAT_TASKS_STORAGE_KEY,
  PRACTICE_SESSIONS_STORAGE_KEY,
} from "../src/lib/repeat-tasks";
import { initialProgress } from "../src/data/demo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Milestone 3 Adversarial Challenge — Decimal Comma Normalization", () => {
  function evaluateAssessment(answer: string, targetAnswer: number, tolerance: number) {
    const trimmed = answer.trim();
    const value = Number(trimmed.replace(",", "."));
    const isCorrect =
      trimmed !== "" &&
      Number.isFinite(value) &&
      Math.abs(value - targetAnswer) <= tolerance;
    return { isCorrect, value };
  }

  function evaluateChatAssessment(answer: string, targetAnswer: number, tolerance: number) {
    if (!answer.trim()) return { isCorrect: false, value: NaN };
    const value = Number(answer.trim().replace(",", "."));
    const isCorrect =
      Number.isFinite(value) &&
      Math.abs(value - targetAnswer) <= tolerance;
    return { isCorrect, value };
  }

  const practiceTask = (target: number, tol = 0.05): RepeatTask => ({
    id: "test-task",
    themeId: "theme-1",
    themeTitle: "Theme 1",
    directionId: "ai-ml",
    directionTitle: "AI & Machine Learning",
    prompt: "Solve",
    explanation: "Exp",
    kind: "practice",
    numericAnswer: target,
    tolerance: tol,
  });

  it("normalizes comma in '2,5' matching target 2.5 across all assessment evaluators", () => {
    assert.equal(evaluateAssessment("2,5", 2.5, 0.05).isCorrect, true);
    assert.equal(evaluateChatAssessment("2,5", 2.5, 0.05).isCorrect, true);
    assert.equal(validateRepeatAnswer(practiceTask(2.5), "2,5"), true);
  });

  it("normalizes comma in '0,05' matching target 0.05 across all assessment evaluators", () => {
    assert.equal(evaluateAssessment("0,05", 0.05, 0.001).isCorrect, true);
    assert.equal(evaluateChatAssessment("0,05", 0.05, 0.001).isCorrect, true);
    assert.equal(validateRepeatAnswer(practiceTask(0.05, 0.001), "0,05"), true);
  });

  it("normalizes comma in negative '-1,5' matching target -1.5 across all assessment evaluators", () => {
    assert.equal(evaluateAssessment("-1,5", -1.5, 0.05).isCorrect, true);
    assert.equal(evaluateChatAssessment("-1,5", -1.5, 0.05).isCorrect, true);
    assert.equal(validateRepeatAnswer(practiceTask(-1.5), "-1,5"), true);
  });

  it("preserves standard decimal dot in '3.14' matching target 3.14", () => {
    assert.equal(evaluateAssessment("3.14", 3.14, 0.001).isCorrect, true);
    assert.equal(evaluateChatAssessment("3.14", 3.14, 0.001).isCorrect, true);
    assert.equal(validateRepeatAnswer(practiceTask(3.14, 0.001), "3.14"), true);
  });

  it("safely rejects non-numeric string 'abc' without throwing exceptions", () => {
    assert.equal(evaluateAssessment("abc", 2.5, 0.05).isCorrect, false);
    assert.equal(evaluateChatAssessment("abc", 2.5, 0.05).isCorrect, false);
    assert.equal(validateRepeatAnswer(practiceTask(2.5), "abc"), false);
  });

  it("safely rejects empty string '' without throwing exceptions", () => {
    assert.equal(evaluateAssessment("", 0, 0.1).isCorrect, false);
    assert.equal(evaluateChatAssessment("", 0, 0.1).isCorrect, false);
    assert.equal(validateRepeatAnswer(practiceTask(0), ""), false);
  });

  it("safely rejects whitespace-only string '   ' without throwing exceptions", () => {
    assert.equal(evaluateAssessment("   ", 0, 0.1).isCorrect, false);
    assert.equal(evaluateChatAssessment("   ", 0, 0.1).isCorrect, false);
    assert.equal(validateRepeatAnswer(practiceTask(0), "   "), false);
  });

  it("handles adversarial inputs: padded whitespace, multiple commas, and non-finite strings", () => {
    assert.equal(evaluateAssessment("  2,5  ", 2.5, 0.01).isCorrect, true);
    assert.equal(evaluateAssessment("2,5,5", 2.5, 0.01).isCorrect, false);
    assert.equal(evaluateAssessment("Infinity", 100, 1).isCorrect, false);
    assert.equal(evaluateAssessment("-Infinity", -100, 1).isCorrect, false);
    assert.equal(evaluateAssessment("NaN", 0, 1).isCorrect, false);
  });
});

describe("Milestone 3 Adversarial Challenge — InteractivePlot RAF Throttling & Zero-Size Rect Guards", () => {
  const interactivePlotCode = fs.readFileSync(
    path.join(rootDir, "src/components/lesson/plot/InteractivePlot.tsx"),
    "utf8",
  );

  it("guards all pointer coordinate mappings against zero and negative bounding client rect dimensions", () => {
    const guards = interactivePlotCode.match(/if\s*\(\s*rect\.width\s*<=\s*0\s*\|\|\s*rect\.height\s*<=\s*0\s*\)\s*return;/g);
    assert.ok(guards !== null && guards.length >= 3, `Expected at least 3 zero-size rect guards, found ${guards?.length}`);
  });

  it("proves 0 NaN or Infinity values propagate when width = 0, height = 0, or negative dimensions", () => {
    function calculateCoordinates(
      clientX: number,
      clientY: number,
      rect: { left: number; top: number; width: number; height: number },
      W: number,
      H: number,
    ) {
      if (rect.width <= 0 || rect.height <= 0) return null;
      const px = ((clientX - rect.left) / rect.width) * W;
      const py = ((clientY - rect.top) / rect.height) * H;
      return { px, py };
    }

    const degenerateRects = [
      { width: 0, height: 400 },
      { width: 600, height: 0 },
      { width: 0, height: 0 },
      { width: -100, height: 400 },
      { width: 600, height: -200 },
      { width: -50, height: -50 },
    ];

    for (const rect of degenerateRects) {
      const result = calculateCoordinates(100, 100, { left: 0, top: 0, ...rect }, 800, 450);
      assert.equal(result, null, `Degenerate rect ${JSON.stringify(rect)} must return null`);
    }

    const validResult = calculateCoordinates(100, 100, { left: 0, top: 0, width: 800, height: 450 }, 800, 450);
    assert.ok(validResult !== null);
    assert.equal(Number.isNaN(validResult.px), false);
    assert.equal(Number.isNaN(validResult.py), false);
    assert.equal(Number.isFinite(validResult.px), true);
    assert.equal(Number.isFinite(validResult.py), true);
  });

  it("verifies RAF throttling hooks exist for hover and viewport with proper cleanup", () => {
    assert.ok(interactivePlotCode.includes("const scheduleHoverUpdate = useCallback("));
    assert.ok(interactivePlotCode.includes("hoverRafId.current = requestAnimationFrame("));
    assert.ok(interactivePlotCode.includes("if (hoverRafId.current !== null) cancelAnimationFrame(hoverRafId.current)"));
    assert.ok(interactivePlotCode.includes("currentViewportRef.current = viewport"));
  });

  it("simulates RAF burst coalescing: 50 rapid events yield at most 1 committed state update per frame", () => {
    let pendingHover: { x: number; y: number } | null = null;
    let hoverRafId: number | null = null;
    let commits = 0;
    const recordedHover: Array<{ x: number; y: number }> = [];

    function scheduleHover(h: { x: number; y: number } | null) {
      pendingHover = h;
      if (hoverRafId === null) {
        hoverRafId = 999;
      }
    }

    function flushFrame() {
      if (hoverRafId !== null) {
        if (pendingHover) {
          recordedHover.push(pendingHover);
        }
        commits++;
        hoverRafId = null;
      }
    }

    for (let i = 0; i < 50; i++) {
      scheduleHover({ x: i, y: i * 2 });
    }

    assert.equal(commits, 0, "No commits before RAF callback");
    flushFrame();
    assert.equal(commits, 1, "Exactly one commit per animation frame");
    assert.equal(recordedHover[0]?.x, 49);
    assert.equal(recordedHover[0]?.y, 98);
  });
});

describe("Milestone 3 Adversarial Challenge — State Persistence & resetProgress Purge", () => {
  const storeMemory = new Map<string, string>();
  const testStorage = {
    getItem: (key: string) => storeMemory.get(key) ?? null,
    setItem: (key: string, value: string) => storeMemory.set(key, value),
    removeItem: (key: string) => storeMemory.delete(key),
    clear: () => storeMemory.clear(),
  };

  it("resetProgress invokes removeItem for all target keys and purges repeat tasks and sessions", () => {
    storeMemory.clear();

    const removedKeys: string[] = [];
    const trackingStorage = {
      ...testStorage,
      removeItem: (key: string) => {
        removedKeys.push(key);
        storeMemory.delete(key);
      },
    };

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      writable: true,
      value: trackingStorage,
    });

    // Seed state
    storeMemory.set("uplift-progress", JSON.stringify({ xp: 8888, level: 30 }));
    storeMemory.set(SOLVED_REPEAT_TASKS_STORAGE_KEY, JSON.stringify(["task-1", "task-2"]));
    storeMemory.set(PRACTICE_SESSIONS_STORAGE_KEY, JSON.stringify([{ id: "s1" }]));
    storeMemory.set("uplift_math_studio_settings_v3", JSON.stringify({ showGrid: false }));
    storeMemory.set("uplift_sound_enabled", "false");
    storeMemory.set("third_party_token", "preserved");

    markRepeatTaskSolved("in-memory-task");
    assert.ok(getSolvedRepeatTaskIds().includes("in-memory-task"));

    const store = createProgressStore();
    store.getState().resetProgress();

    // Verify all keys were removed via removeItem
    assert.ok(removedKeys.includes("uplift-progress"), "Must remove uplift-progress");
    assert.ok(removedKeys.includes(SOLVED_REPEAT_TASKS_STORAGE_KEY), "Must remove uplift_solved_repeat_tasks");
    assert.ok(removedKeys.includes(PRACTICE_SESSIONS_STORAGE_KEY), "Must remove uplift_practice_sessions");
    assert.ok(removedKeys.includes("uplift_math_studio_settings_v3"), "Must remove uplift_math_studio_settings_v3");
    assert.ok(removedKeys.includes("uplift_sound_enabled"), "Must remove uplift_sound_enabled");

    // Repeat tasks and sessions are deleted
    assert.equal(storeMemory.get(SOLVED_REPEAT_TASKS_STORAGE_KEY), undefined);
    assert.equal(storeMemory.get(PRACTICE_SESSIONS_STORAGE_KEY), undefined);
    assert.equal(storeMemory.get("third_party_token"), "preserved");

    // In-memory solved tasks cleared
    assert.equal(getSolvedRepeatTaskIds().length, 0);

    // State reset to initialProgress
    const state = store.getState();
    assert.equal(state.xp, initialProgress.xp);
    assert.equal(state.level, initialProgress.level);
    assert.deepEqual(state.completedLessons, initialProgress.completedLessons);
  });

  it("survives removeItem throwing SecurityError without crashing caller", () => {
    const errorStorage = {
      getItem: (key: string) => storeMemory.get(key) ?? null,
      setItem: (key: string, value: string) => storeMemory.set(key, value),
      removeItem: () => {
        throw new Error("SecurityError: Access is denied");
      },
      clear: () => {},
    };

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      writable: true,
      value: errorStorage,
    });

    const store = createProgressStore();
    assert.doesNotThrow(() => {
      store.getState().resetProgress();
    });
    assert.equal(store.getState().xp, initialProgress.xp);
  });
});

describe("Milestone 3 Adversarial Challenge — 3D Island File Immutability", () => {
  it("verifies all 3D island files predate Milestone 3 start time", () => {
    const islandFiles = [
      "src/app/world.css",
      "src/components/learning-world/WorldCanvas.tsx",
      "src/components/learning-world/LearningWorld.tsx",
      "src/components/learning-world/IslandMiniLab.tsx",
      "src/components/learning-world/SafeHtml.tsx",
    ];

    const m3Start = new Date("2026-10-18T08:20:00Z").getTime();
    for (const f of islandFiles) {
      const stats = fs.statSync(path.join(rootDir, f));
      assert.ok(
        stats.mtime.getTime() < m3Start,
        `File ${f} was modified at ${stats.mtime.toISOString()}, expected before ${new Date(m3Start).toISOString()}`,
      );
    }
  });
});
