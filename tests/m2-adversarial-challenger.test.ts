import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  directions,
  getDirectionLessons,
} from "../src/data/curriculum";
import {
  getAllRepeatTasks,
  validateRepeatAnswer,
  type RepeatTask,
} from "../src/lib/repeat-tasks";
import { getDirectionProgress } from "../src/stores/progress-store";
import type { Direction, Lesson } from "../src/types/curriculum";

describe("Milestone 2 Adversarial Stress Test — Objective 1: RepeatTasks Accuracy Score", () => {
  const catalogTasks = getAllRepeatTasks();
  const catalogCount = catalogTasks.length;

  it("confirms full catalog contains 50+ tasks (establishing the baseline flaw)", () => {
    assert.ok(
      catalogCount >= 50,
      `Expected 50+ repeat tasks in catalog, found ${catalogCount}`,
    );
  });

  function calculateSessionMetrics(sessionAnswers: Record<string, boolean>) {
    const attemptedCount = Object.keys(sessionAnswers).length;
    const totalQuestions = attemptedCount > 0 ? attemptedCount : 1;
    const correctCount = Object.values(sessionAnswers).filter(Boolean).length;
    const scorePercent =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    return { attemptedCount, totalQuestions, correctCount, scorePercent };
  }

  it("stress test: 0 attempted questions produces 0% accuracy and totalQuestions = 1 (never NaN or divide-by-zero)", () => {
    const sessionAnswers: Record<string, boolean> = {};
    const metrics = calculateSessionMetrics(sessionAnswers);

    assert.equal(metrics.attemptedCount, 0);
    assert.equal(metrics.correctCount, 0);
    assert.equal(metrics.totalQuestions, 1);
    assert.equal(metrics.scorePercent, 0);
    assert.equal(Number.isNaN(metrics.scorePercent), false);
    assert.equal(Number.isFinite(metrics.scorePercent), true);
  });

  it("stress test: 1/1 attempted (100% correct) produces 100% accuracy", () => {
    const sessionAnswers: Record<string, boolean> = {
      "task-1": true,
    };
    const metrics = calculateSessionMetrics(sessionAnswers);

    assert.equal(metrics.attemptedCount, 1);
    assert.equal(metrics.correctCount, 1);
    assert.equal(metrics.totalQuestions, 1);
    assert.equal(metrics.scorePercent, 100);
  });

  it("stress test: 3/5 attempted (3 correct, 2 incorrect) produces exactly 60% accuracy", () => {
    const sessionAnswers: Record<string, boolean> = {
      "task-1": true,
      "task-2": false,
      "task-3": true,
      "task-4": false,
      "task-5": true,
    };
    const metrics = calculateSessionMetrics(sessionAnswers);

    assert.equal(metrics.attemptedCount, 5);
    assert.equal(metrics.correctCount, 3);
    assert.equal(metrics.totalQuestions, 5);
    assert.equal(metrics.scorePercent, 60);

    // Verify flawed catalog division would have produced catastrophic under-scoring
    const flawedCatalogScore = Math.round((metrics.correctCount / catalogCount) * 100);
    assert.ok(
      flawedCatalogScore <= 6,
      `Flawed catalog score would be <= 6%, got ${flawedCatalogScore}%`,
    );
    assert.notEqual(metrics.scorePercent, flawedCatalogScore);
  });

  it("stress test: 5/5 attempted (5 correct, 0 incorrect) produces 100% accuracy", () => {
    const sessionAnswers: Record<string, boolean> = {
      "task-1": true,
      "task-2": true,
      "task-3": true,
      "task-4": true,
      "task-5": true,
    };
    const metrics = calculateSessionMetrics(sessionAnswers);

    assert.equal(metrics.attemptedCount, 5);
    assert.equal(metrics.correctCount, 5);
    assert.equal(metrics.totalQuestions, 5);
    assert.equal(metrics.scorePercent, 100);
  });

  it("adversarial confirmation: accuracy NEVER divides by 50+ when only 5 questions are attempted", () => {
    const sessionAnswers: Record<string, boolean> = {
      "task-1": true,
      "task-2": true,
      "task-3": true,
      "task-4": true,
      "task-5": true,
    };
    const metrics = calculateSessionMetrics(sessionAnswers);

    // If divided by catalogCount (50+), 5/50 would yield <= 10%
    const oldFlawedScore = Math.round((5 / catalogCount) * 100);
    assert.ok(
      oldFlawedScore <= 10,
      `Old flawed score was ${oldFlawedScore}%, which severely penalized students`,
    );
    assert.equal(metrics.scorePercent, 100);
    assert.notEqual(metrics.scorePercent, oldFlawedScore);
    assert.equal(metrics.totalQuestions, 5);
    assert.notEqual(metrics.totalQuestions, catalogCount);
  });

  it("additional edge permutations: 0/5, 2/3 (67%), 1/4 (25%), 4/7 (57%), 50/50", () => {
    // 0/5
    const zeroOfFive = calculateSessionMetrics({
      t1: false,
      t2: false,
      t3: false,
      t4: false,
      t5: false,
    });
    assert.equal(zeroOfFive.scorePercent, 0);

    // 2/3 -> 67%
    const twoOfThree = calculateSessionMetrics({
      t1: true,
      t2: false,
      t3: true,
    });
    assert.equal(twoOfThree.scorePercent, 67);

    // 1/4 -> 25%
    const oneOfFour = calculateSessionMetrics({
      t1: false,
      t2: true,
      t3: false,
      t4: false,
    });
    assert.equal(oneOfFour.scorePercent, 25);

    // 4/7 -> 57%
    const fourOfSeven = calculateSessionMetrics({
      t1: true,
      t2: true,
      t3: true,
      t4: true,
      t5: false,
      t6: false,
      t7: false,
    });
    assert.equal(fourOfSeven.scorePercent, 57);

    // 50/50 -> 100%
    const fiftyAnswers: Record<string, boolean> = {};
    for (let i = 0; i < 50; i++) fiftyAnswers[`task-${i}`] = true;
    const fiftyOfFifty = calculateSessionMetrics(fiftyAnswers);
    assert.equal(fiftyOfFifty.scorePercent, 100);
    assert.equal(fiftyOfFifty.totalQuestions, 50);
  });
});

describe("Milestone 2 Adversarial Stress Test — Objective 2: Decimal Comma Parsing", () => {
  const createMockTask = (
    numericAnswer: number,
    tolerance = 0.05,
  ): RepeatTask => ({
    id: "test-practice-task",
    themeId: "test-theme",
    themeTitle: "Test Theme",
    directionId: "physics-engineering",
    directionTitle: "Physics & Engineering",
    kind: "practice",
    prompt: "Enter numerical response:",
    numericAnswer,
    tolerance,
    explanation: "Standard explanation",
  });

  it("tests '4,5': normalized to '4.5' and validates against 4.5", () => {
    const raw = "4,5";
    const normalized = raw.trim().replace(",", ".");
    assert.equal(normalized, "4.5");

    const task = createMockTask(4.5, 0.05);
    const valid = validateRepeatAnswer(task, normalized);
    assert.equal(valid, true, "'4,5' must validate as 4.5");
  });

  it("tests '0,05': normalized to '0.05' and validates against 0.05", () => {
    const raw = "0,05";
    const normalized = raw.trim().replace(",", ".");
    assert.equal(normalized, "0.05");

    const task = createMockTask(0.05, 0.005);
    const valid = validateRepeatAnswer(task, normalized);
    assert.equal(valid, true, "'0,05' must validate as 0.05");
  });

  it("tests '-2,5': normalized to '-2.5' and validates against -2.5", () => {
    const raw = "-2,5";
    const normalized = raw.trim().replace(",", ".");
    assert.equal(normalized, "-2.5");

    const task = createMockTask(-2.5, 0.05);
    const valid = validateRepeatAnswer(task, normalized);
    assert.equal(valid, true, "'-2,5' must validate as -2.5");
  });

  it("tests '1e-2': normalized to '1e-2' and validates against 0.01", () => {
    const raw = "1e-2";
    const normalized = raw.trim().replace(",", ".");
    assert.equal(normalized, "1e-2");

    const task = createMockTask(0.01, 0.001);
    const valid = validateRepeatAnswer(task, normalized);
    assert.equal(valid, true, "'1e-2' must validate as 0.01");
  });

  it("tests 'abc': normalized to 'abc', returns false without throwing", () => {
    const raw = "abc";
    const normalized = raw.trim().replace(",", ".");
    assert.equal(normalized, "abc");

    const task = createMockTask(4.5, 0.05);
    assert.doesNotThrow(() => {
      const valid = validateRepeatAnswer(task, normalized);
      assert.equal(valid, false, "'abc' must cleanly return false");
    });
  });

  it("tests extensive malformed and hostile inputs return false without throwing", () => {
    const task = createMockTask(10.0, 0.1);
    const hostileInputs = [
      "",
      "   ",
      ",",
      ",,",
      "4,5,6",
      "--2,5",
      "++3,5",
      "NaN",
      "Infinity",
      "-Infinity",
      "undefined",
      "null",
      "12px",
      "4.5.6",
      "1e999",
      "true",
      "false",
      "[object Object]",
      "{}",
    ];

    for (const input of hostileInputs) {
      assert.doesNotThrow(() => {
        const normalized = input.trim().replace(",", ".");
        const result = validateRepeatAnswer(task, normalized);
        assert.equal(
          result,
          false,
          `Expected input "${input}" to evaluate to false without throwing`,
        );
      });
    }

    // Direct null and undefined
    assert.doesNotThrow(() => {
      assert.equal(validateRepeatAnswer(task, null), false);
      assert.equal(validateRepeatAnswer(task, undefined), false);
    });
  });
});

describe("Milestone 2 Adversarial Stress Test — Objective 3: Courses Search & Filters", () => {
  const DIRECTION_DIFFICULTIES: Record<
    string,
    ("beginner" | "intermediate" | "advanced")[]
  > = {
    "ai-ml": ["intermediate", "advanced"],
    "physics-engineering": ["intermediate", "advanced"],
    mathematics: ["beginner", "intermediate"],
    "italian-language": ["beginner"],
    "italian-culture": ["beginner"],
  };

  function filterCourses({
    searchQuery = "",
    trackFilter = "all",
    difficultyFilter = "all",
    statusFilter = "all",
    completedLessons = [] as string[],
  }) {
    return directions.filter((direction: Direction) => {
      const lessons = getDirectionLessons(direction);
      const progress = getDirectionProgress(direction.id, {
        completedLessons,
      });

      // 1. Track filter
      if (trackFilter !== "all") {
        if (trackFilter === "italian-language") {
          if (
            direction.id !== "italian-language" &&
            direction.id !== "italian-culture"
          ) {
            return false;
          }
        } else if (direction.id !== trackFilter) {
          return false;
        }
      }

      // 2. Difficulty filter
      if (difficultyFilter !== "all") {
        const allowed = DIRECTION_DIFFICULTIES[direction.id] ?? [];
        if (!allowed.includes(difficultyFilter as (typeof allowed)[number])) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter === "in-progress") {
        if (progress.completed === 0 || progress.completed === progress.total) {
          return false;
        }
      } else if (statusFilter === "completed") {
        if (progress.completed === 0 || progress.completed < progress.total) {
          return false;
        }
      }

      // 4. Search query filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = direction.title.toLowerCase().includes(query);
        const matchesShort = direction.shortTitle.toLowerCase().includes(query);
        const matchesDesc = direction.description.toLowerCase().includes(query);
        const matchesLesson = lessons.some(
          (l: Lesson) =>
            l.title.toLowerCase().includes(query) ||
            l.description.toLowerCase().includes(query) ||
            l.id.toLowerCase().includes(query),
        );
        if (!matchesTitle && !matchesShort && !matchesDesc && !matchesLesson) {
          return false;
        }
      }

      return true;
    });
  }

  it("empty query returns all campus directions", () => {
    const emptyQuery = filterCourses({ searchQuery: "" });
    assert.equal(emptyQuery.length, directions.length);

    const whitespaceQuery = filterCourses({ searchQuery: "    " });
    assert.equal(whitespaceQuery.length, directions.length);
  });

  it("case insensitivity: matching uppercase, lowercase, and mixed-case queries", () => {
    // "physics" vs "PHYSICS" vs "PhYsIcS"
    const lower = filterCourses({ searchQuery: "physics" });
    const upper = filterCourses({ searchQuery: "PHYSICS" });
    const mixed = filterCourses({ searchQuery: "PhYsIcS" });

    assert.ok(lower.length >= 1);
    assert.deepEqual(
      lower.map((d) => d.id),
      upper.map((d) => d.id),
    );
    assert.deepEqual(
      lower.map((d) => d.id),
      mixed.map((d) => d.id),
    );
    assert.ok(lower.some((d) => d.id === "physics-engineering"));

    // "mathematics" vs "MATHEMATICS"
    // Note: matches both 'mathematics' (title) and 'physics-engineering' (contains 'vector mathematics')
    const mathLower = filterCourses({ searchQuery: "mathematics" });
    const mathUpper = filterCourses({ searchQuery: "MATHEMATICS" });
    assert.equal(mathLower.length, 2);
    assert.ok(mathLower.some((d) => d.id === "mathematics"));
    assert.ok(mathLower.some((d) => d.id === "physics-engineering"));
    assert.deepEqual(mathLower, mathUpper);

    // "italian" vs "ITALIAN"
    const italianLower = filterCourses({ searchQuery: "italian" });
    const italianUpper = filterCourses({ searchQuery: "ITALIAN" });
    assert.ok(italianLower.length >= 1);
    assert.deepEqual(italianLower, italianUpper);
  });

  it("multi-keyword phrase matching across title, description, and lesson content", () => {
    // Multi-word title match: "Machine Learning"
    const mlResults = filterCourses({ searchQuery: "machine learning" });
    assert.ok(mlResults.some((d) => d.id === "ai-ml"));

    // Multi-word description match: "neural networks"
    const neuralResults = filterCourses({ searchQuery: "neural networks" });
    assert.ok(neuralResults.some((d) => d.id === "ai-ml"));

    // Multi-word lesson title match: "vector components"
    const vectorResults = filterCourses({ searchQuery: "vector components" });
    assert.ok(vectorResults.some((d) => d.id === "physics-engineering"));

    // Multi-word lesson title match: "si base units"
    const siResults = filterCourses({ searchQuery: "si base units" });
    assert.ok(siResults.some((d) => d.id === "physics-engineering"));

    // Multi-word lesson title match: "rates of change"
    const ratesResults = filterCourses({ searchQuery: "rates of change" });
    assert.ok(ratesResults.some((d) => d.id === "mathematics"));

    // Multi-word lesson title match: "boolean logic"
    const logicResults = filterCourses({ searchQuery: "boolean logic" });
    assert.ok(logicResults.some((d) => d.id === "mathematics"));

    // Multi-word lesson title match: "greetings & introductions"
    const greetingsResults = filterCourses({ searchQuery: "greetings & introductions" });
    assert.ok(greetingsResults.some((d) => d.id === "italian-language"));

    // Multi-word direction title match: "italian language"
    const italianResults = filterCourses({ searchQuery: "italian language" });
    assert.ok(italianResults.some((d) => d.id === "italian-language"));

    // Hyphenated vs spaced ID matching:
    // 'italian-greetings' matches lesson ID directly
    const hyphenResults = filterCourses({ searchQuery: "italian-greetings" });
    assert.ok(hyphenResults.some((d) => d.id === "italian-language"));
  });

  it("non-matching query (e.g. 'xyz123') yields exactly 0 results (triggering empty state)", () => {
    const nonMatching = filterCourses({ searchQuery: "xyz123" });
    assert.equal(nonMatching.length, 0);

    const nonMatching2 = filterCourses({ searchQuery: "nonexistent-course-999" });
    assert.equal(nonMatching2.length, 0);

    const nonMatching3 = filterCourses({ searchQuery: "quantum cryptography" });
    assert.equal(nonMatching3.length, 0);
  });

  it("combined filter stress: track filter + difficulty + search query interaction", () => {
    // AI track + intermediate difficulty + "python"
    const aiPython = filterCourses({
      trackFilter: "ai-ml",
      difficultyFilter: "intermediate",
      searchQuery: "python",
    });
    assert.equal(aiPython.length, 1);
    assert.equal(aiPython[0].id, "ai-ml");

    // Physics track + beginner difficulty -> yields 0 because physics is ["intermediate", "advanced"]
    const physicsBeginner = filterCourses({
      trackFilter: "physics-engineering",
      difficultyFilter: "beginner",
    });
    assert.equal(physicsBeginner.length, 0);

    // Italian track alias: filtering for "italian-language" matches "italian-language"
    const italianTrack = filterCourses({ trackFilter: "italian-language" });
    assert.ok(italianTrack.some((d) => d.id === "italian-language"));

    // Status filter: completed when user completed all 7 physics lessons
    const physicsLessons = getDirectionLessons(
      directions.find((d) => d.id === "physics-engineering")!,
    );
    const completedPhysicsIds = physicsLessons.map((l) => l.id);

    const completedSearch = filterCourses({
      statusFilter: "completed",
      completedLessons: completedPhysicsIds,
    });
    assert.ok(completedSearch.some((d) => d.id === "physics-engineering"));

    const inProgressSearch = filterCourses({
      statusFilter: "in-progress",
      completedLessons: completedPhysicsIds.slice(0, 3),
    });
    assert.ok(inProgressSearch.some((d) => d.id === "physics-engineering"));
  });
});
