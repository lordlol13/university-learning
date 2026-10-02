import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  getAllRepeatTasks,
  getRepeatTasks,
  getRepeatThemes,
  validateRepeatAnswer,
  getPracticeSessions,
  savePracticeSession,
  clearPracticeSessions,
  MAX_PRACTICE_SESSIONS,
  PRACTICE_SESSIONS_STORAGE_KEY,
  type PracticeSession,
  type RepeatTask,
  type RepeatTheme,
} from "../src/lib/repeat-tasks";
import { createProgressStore } from "../src/stores/progress-store";
import { getDirection, getDirectionLessons } from "../src/data/curriculum";

// Storage mock to test persistent storage in Node.js test environment
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
    clear: () => {
      memory.clear();
    },
  },
});

beforeEach(() => {
  memory.clear();
});

test("getAllRepeatTasks extracts all repeatable tasks across four campus tracks", () => {
  const tasks = getAllRepeatTasks();
  assert.ok(tasks.length >= 95, `Expected at least 95 repeat tasks, found ${tasks.length}`);

  const directionsFound = new Set(tasks.map((t) => t.directionId));
  assert.ok(directionsFound.has("ai-ml"));
  assert.ok(directionsFound.has("physics-engineering"));
  assert.ok(directionsFound.has("mathematics"));
  assert.ok(directionsFound.has("italian-language"));

  for (const task of tasks) {
    assert.ok(task.id, "Task must have an id");
    assert.ok(task.themeId, "Task must have a themeId");
    assert.ok(task.themeTitle, "Task must have a themeTitle");
    assert.ok(task.directionId, "Task must have a directionId");
    assert.ok(task.prompt, "Task must have a prompt");
    assert.ok(task.explanation, "Task must have an explanation");

    if (task.kind === "quiz") {
      assert.ok(Array.isArray(task.options) && task.options.length >= 2, "Quiz must have options");
      assert.ok(
        typeof task.answerIndex === "number" &&
          task.answerIndex >= 0 &&
          task.answerIndex < task.options.length,
        "Quiz answerIndex must be valid",
      );
    } else if (task.kind === "practice") {
      assert.ok(
        typeof task.numericAnswer === "number" && Number.isFinite(task.numericAnswer),
        "Practice task must have finite numericAnswer",
      );
      assert.ok(
        typeof task.tolerance === "number" && task.tolerance >= 0,
        "Practice tolerance must be non-negative",
      );
    }
  }
});

test("filtering repeat tasks by completed lessons isolates only completed themes", () => {
  const singleLessonTasks = getAllRepeatTasks(["python-basics"]);
  assert.ok(singleLessonTasks.length > 0);
  assert.ok(singleLessonTasks.every((t) => t.themeId === "python-basics"));

  const multiLessonTasks = getRepeatTasks(["python-basics", "linear-algebra", "calc-derivatives"]);
  const themesInMulti = new Set(multiLessonTasks.map((t) => t.themeId));
  assert.deepEqual(Array.from(themesInMulti).sort(), [
    "calc-derivatives",
    "linear-algebra",
    "python-basics",
  ]);

  const emptyTasks = getAllRepeatTasks([]);
  assert.equal(emptyTasks.length, 0);

  const nonExistentTasks = getAllRepeatTasks(["non-existent-lesson-id"]);
  assert.equal(nonExistentTasks.length, 0);
});

test("getRepeatThemes computes accurate task counts matching task generator", () => {
  const allThemes = getRepeatThemes();
  assert.ok(allThemes.length >= 20, "Should have 20 distinct themes");

  const totalCount = allThemes.reduce((acc, t) => acc + t.tasksCount, 0);
  assert.equal(totalCount, getAllRepeatTasks().length);

  const filteredThemes = getRepeatThemes(["si-base-units", "water-equivalency"]);
  assert.equal(filteredThemes.length, 2);
  const filteredTotal = filteredThemes.reduce((acc, t) => acc + t.tasksCount, 0);
  assert.equal(filteredTotal, getAllRepeatTasks(["si-base-units", "water-equivalency"]).length);
});

test("validateRepeatAnswer correctly validates quiz questions and practice numbers with tolerance", () => {
  const sampleQuiz: RepeatTask = {
    id: "quiz-sample",
    themeId: "python-basics",
    themeTitle: "Python Basics",
    directionId: "ai-ml",
    directionTitle: "AI & ML",
    kind: "quiz",
    prompt: "Sample question?",
    options: ["Alpha", "Beta", "Gamma", "Delta"],
    answerIndex: 2,
    explanation: "Gamma is correct",
  };

  assert.equal(validateRepeatAnswer(sampleQuiz, 2), true);
  assert.equal(validateRepeatAnswer(sampleQuiz, "2"), true);
  assert.equal(validateRepeatAnswer(sampleQuiz, 0), false);
  assert.equal(validateRepeatAnswer(sampleQuiz, 3), false);
  assert.equal(validateRepeatAnswer(sampleQuiz, null), false);
  assert.equal(validateRepeatAnswer(sampleQuiz, undefined), false);

  const samplePractice: RepeatTask = {
    id: "practice-sample",
    themeId: "si-base-units",
    themeTitle: "SI Units",
    directionId: "physics-engineering",
    directionTitle: "Physics",
    kind: "practice",
    prompt: "Calculate velocity in m/s:",
    numericAnswer: 12.5,
    tolerance: 0.1,
    explanation: "12.5 m/s",
  };

  assert.equal(validateRepeatAnswer(samplePractice, 12.5), true);
  assert.equal(validateRepeatAnswer(samplePractice, "12.5"), true);
  assert.equal(validateRepeatAnswer(samplePractice, 12.55), true);
  assert.equal(validateRepeatAnswer(samplePractice, "12.42"), true);
  assert.equal(validateRepeatAnswer(samplePractice, 12.7), false);
  assert.equal(validateRepeatAnswer(samplePractice, "not a number"), false);
  assert.equal(validateRepeatAnswer(samplePractice, null), false);
});

test("practice sessions persist in storage with timestamps, accuracy scores, and retrieve in order", () => {
  assert.deepEqual(getPracticeSessions(), []);

  const session1: PracticeSession = {
    id: "session-101",
    completedAt: "2026-09-30T10:00:00.000Z",
    totalQuestions: 5,
    correctCount: 4,
    scorePercent: 80,
    xpEarned: 60,
    themeId: "python-basics",
    themeTitle: "Python Basics",
    directionId: "ai-ml",
  };

  savePracticeSession(session1);
  const savedSessions = getPracticeSessions();
  assert.equal(savedSessions.length, 1);
  assert.deepEqual(savedSessions[0], session1);

  const session2: PracticeSession = {
    id: "session-102",
    completedAt: "2026-09-30T10:30:00.000Z",
    totalQuestions: 8,
    correctCount: 8,
    scorePercent: 100,
    xpEarned: 120,
    themeId: "all",
    themeTitle: "Completed Units",
    directionId: undefined,
  };

  savePracticeSession(session2);
  const updatedSessions = getPracticeSessions();
  assert.equal(updatedSessions.length, 2);
  assert.equal(updatedSessions[0].id, "session-102");
  assert.equal(updatedSessions[1].id, "session-101");

  clearPracticeSessions();
  assert.deepEqual(getPracticeSessions(), []);
});

test("completing campus tracks unlocks physics-master, math-pioneer, and italian-scholar achievements", () => {
  const store = createProgressStore();

  // Test Physics Track Completion
  const physicsDirection = getDirection("physics-engineering");
  assert.ok(physicsDirection);
  const physicsLessons = getDirectionLessons(physicsDirection);

  for (const lesson of physicsLessons) {
    store.setState((prev) => ({
      ...prev,
      currentDirectionId: "physics-engineering",
      currentLessonId: lesson.id,
      unlockedLessons: Array.from(new Set([...prev.unlockedLessons, lesson.id])),
    }));
    store.getState().completeLesson(lesson.id);
  }
  assert.ok(
    store.getState().achievements.includes("physics-master"),
    "Should award physics-master badge upon completing all physics lessons",
  );

  // Test Mathematics Track Completion
  const mathDirection = getDirection("mathematics");
  assert.ok(mathDirection);
  const mathLessons = getDirectionLessons(mathDirection);

  for (const lesson of mathLessons) {
    store.setState((prev) => ({
      ...prev,
      currentDirectionId: "mathematics",
      currentLessonId: lesson.id,
      unlockedLessons: Array.from(new Set([...prev.unlockedLessons, lesson.id])),
    }));
    store.getState().completeLesson(lesson.id);
  }
  assert.ok(
    store.getState().achievements.includes("math-pioneer"),
    "Should award math-pioneer badge upon completing all math lessons",
  );

  // Test Italian Track Completion
  const italianDirection = getDirection("italian-language");
  assert.ok(italianDirection);
  const italianLessons = getDirectionLessons(italianDirection);

  for (const lesson of italianLessons) {
    store.setState((prev) => ({
      ...prev,
      currentDirectionId: "italian-language",
      currentLessonId: lesson.id,
      unlockedLessons: Array.from(new Set([...prev.unlockedLessons, lesson.id])),
    }));
    store.getState().completeLesson(lesson.id);
  }
  assert.ok(
    store.getState().achievements.includes("italian-scholar"),
    "Should award italian-scholar badge upon completing all Italian lessons",
  );

  // Test unlockAchievement for practice-champion
  const unlocked = store.getState().unlockAchievement("practice-champion");
  assert.equal(unlocked, true);
  assert.ok(store.getState().achievements.includes("practice-champion"));
  // Re-unlocking should return false (deduplicated)
  assert.equal(store.getState().unlockAchievement("practice-champion"), false);
});

test("getAllRepeatTasks and getRepeatThemes defensively handle null and invalid inputs without throwing", () => {
  // 1. null input
  let nullTasks: RepeatTask[] = [];
  assert.doesNotThrow(() => {
    nullTasks = getAllRepeatTasks(null as unknown as string[]);
  }, "getAllRepeatTasks(null) should not throw TypeError");
  assert.ok(Array.isArray(nullTasks));
  assert.ok(nullTasks.length >= 95, "Should fall back to returning all repeat tasks when passed null");

  let nullThemes: RepeatTheme[] = [];
  assert.doesNotThrow(() => {
    nullThemes = getRepeatThemes(null as unknown as string[]);
  }, "getRepeatThemes(null) should not throw TypeError");
  assert.ok(Array.isArray(nullThemes));
  assert.ok(nullThemes.length >= 20, "Should fall back to returning all themes when passed null");

  // 2. Non-array invalid types
  assert.doesNotThrow(() => {
    const stringTasks = getAllRepeatTasks("python-basics" as unknown as string[]);
    assert.ok(Array.isArray(stringTasks));
  });

  assert.doesNotThrow(() => {
    const objTasks = getAllRepeatTasks({} as unknown as string[]);
    assert.ok(Array.isArray(objTasks));
  });

  // 3. Normal array filtering preserved
  const emptyTasks = getAllRepeatTasks([]);
  assert.equal(emptyTasks.length, 0);

  const filteredTasks = getAllRepeatTasks(["python-basics"]);
  assert.ok(filteredTasks.length > 0);
  assert.ok(filteredTasks.every((t) => t.themeId === "python-basics"));
});

test("storage operations survive SecurityError when localStorage access is restricted", () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  try {
    // Configure localStorage getter to throw SecurityError on access
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("SecurityError: Access to localStorage is denied");
      },
    });

    // 1. getPracticeSessions() must catch or handle null storage and return []
    let sessions: PracticeSession[] = [];
    assert.doesNotThrow(() => {
      sessions = getPracticeSessions();
    }, "getPracticeSessions() must not crash on SecurityError");
    assert.deepEqual(sessions, [], "Should return empty array when storage is blocked");

    // 2. savePracticeSession() must not throw
    const sampleSession: PracticeSession = {
      id: "sess-sec-test",
      completedAt: new Date().toISOString(),
      totalQuestions: 3,
      correctCount: 3,
      scorePercent: 100,
      xpEarned: 45,
      themeId: "python-basics",
    };
    assert.doesNotThrow(() => {
      savePracticeSession(sampleSession);
    }, "savePracticeSession() must not crash on SecurityError");

    // 3. clearPracticeSessions() must not throw
    assert.doesNotThrow(() => {
      clearPracticeSessions();
    }, "clearPracticeSessions() must not crash on SecurityError");
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "localStorage", originalDescriptor);
    }
  }
});

test("getPracticeSessions filters out corrupt array elements, nulls, and non-session objects", () => {
  const validSession: PracticeSession = {
    id: "valid-session-1",
    completedAt: "2026-10-01T12:00:00.000Z",
    totalQuestions: 5,
    correctCount: 4,
    scorePercent: 80,
    xpEarned: 60,
    themeId: "calc-derivatives",
  };

  // 1. Array containing purely corrupt entries
  localStorage.setItem(
    PRACTICE_SESSIONS_STORAGE_KEY,
    JSON.stringify([null, undefined, 42, "corrupted-string", true, {}, { notASession: 1 }]),
  );
  const corruptedResult = getPracticeSessions();
  assert.ok(Array.isArray(corruptedResult));
  assert.equal(corruptedResult.length, 0, "Corrupt entries must be filtered out completely");

  // 2. Array containing mix of valid and corrupt entries
  localStorage.setItem(
    PRACTICE_SESSIONS_STORAGE_KEY,
    JSON.stringify([
      null,
      validSession,
      12345,
      { id: "partial-missing-fields" },
      { id: "missing-score", completedAt: "2026-10-01" },
    ]),
  );
  const mixedResult = getPracticeSessions();
  assert.equal(mixedResult.length, 1, "Only valid session should be retained");
  assert.deepEqual(mixedResult[0], validSession);

  // 3. Self-healing: saving a new session purges corrupt entries and persists only valid ones
  const newSession: PracticeSession = {
    id: "valid-session-2",
    completedAt: "2026-10-01T12:05:00.000Z",
    totalQuestions: 3,
    correctCount: 3,
    scorePercent: 100,
    xpEarned: 45,
    themeId: "python-basics",
  };
  savePracticeSession(newSession);
  const healedSessions = getPracticeSessions();
  assert.equal(healedSessions.length, 2);
  assert.equal(healedSessions[0].id, "valid-session-2");
  assert.equal(healedSessions[1].id, "valid-session-1");
});

test("savePracticeSession enforces maximum storage capacity limit (caps at MAX_PRACTICE_SESSIONS)", () => {
  const MAX_LIMIT = MAX_PRACTICE_SESSIONS ?? 1000;

  // Save MAX_LIMIT + 25 sessions
  for (let i = 0; i < MAX_LIMIT + 25; i++) {
    savePracticeSession({
      id: `session-cap-${i}`,
      completedAt: new Date(Date.now() + i * 1000).toISOString(),
      totalQuestions: 5,
      correctCount: 5,
      scorePercent: 100,
      xpEarned: 75,
      themeId: "python-basics",
    });
  }

  const stored = getPracticeSessions();
  assert.equal(stored.length, MAX_LIMIT, `Sessions count should be capped at ${MAX_LIMIT}`);
  assert.equal(stored[0].id, `session-cap-${MAX_LIMIT + 24}`, "Newest session must be at index 0");
  assert.equal(stored[stored.length - 1].id, `session-cap-25`, "Oldest sessions beyond limit should be evicted");
});

test("savePracticeSession handles QuotaExceededError gracefully without crashing caller", () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  try {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => "[]",
        setItem: () => {
          const quotaErr = new Error("QuotaExceededError: The quota has been exceeded");
          quotaErr.name = "QuotaExceededError";
          throw quotaErr;
        },
        removeItem: () => {},
        clear: () => {},
      },
    });

    const session: PracticeSession = {
      id: "quota-overflow-session",
      completedAt: new Date().toISOString(),
      totalQuestions: 5,
      correctCount: 4,
      scorePercent: 80,
      xpEarned: 60,
      themeId: "python-basics",
    };

    assert.doesNotThrow(() => {
      savePracticeSession(session);
    }, "savePracticeSession must catch QuotaExceededError without throwing");
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, "localStorage", originalDescriptor);
    }
  }
});
