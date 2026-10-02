/* eslint-disable */
/**
 * Milestone 2 Adversarial Stress-Test Harness
 * Evaluates src/lib/repeat-tasks.ts and RepeatTasksView logic under extreme boundary conditions.
 */

import {
  getAllRepeatTasks,
  getRepeatTasks,
  getRepeatThemes,
  validateRepeatAnswer,
  getPracticeSessions,
  savePracticeSession,
  clearPracticeSessions,
  PRACTICE_SESSIONS_STORAGE_KEY,
  type PracticeSession,
  type RepeatTask,
  type RepeatTheme,
} from "../src/lib/repeat-tasks.js";
import { directions, allLessons } from "../src/data/curriculum.js";
import { lessonContents } from "../src/data/lessons/index.js";

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  input?: unknown;
  output?: unknown;
  expected?: unknown;
  error?: string;
  notes?: string;
}

const results: TestResult[] = [];

function record(res: TestResult) {
  results.push(res);
  const mark = res.passed ? "✔ PASS" : "✖ FAIL";
  console.log(`${mark} [${res.category}] ${res.name}`);
  if (!res.passed) {
    if (res.input !== undefined) console.log(`   Input:    ${JSON.stringify(res.input)}`);
    if (res.expected !== undefined) console.log(`   Expected: ${JSON.stringify(res.expected)}`);
    if (res.output !== undefined) console.log(`   Actual:   ${JSON.stringify(res.output)}`);
    if (res.error) console.log(`   Error:    ${res.error}`);
    if (res.notes) console.log(`   Notes:    ${res.notes}`);
  }
}

// Storage mock for localStorage emulation
let mockStorageData = new Map<string, string>();
let shouldStorageThrowOnAccess = false;
let shouldStorageThrowOnSet = false;
let shouldStorageThrowOnGet = false;

const customMockStorage: Storage = {
  getItem: (key: string): string | null => {
    if (shouldStorageThrowOnGet) throw new Error("SecurityError: Access is denied for this origin");
    return mockStorageData.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    if (shouldStorageThrowOnSet) {
      const err = new Error("QuotaExceededError: The quota has been exceeded");
      err.name = "QuotaExceededError";
      throw err;
    }
    mockStorageData.set(key, value);
  },
  removeItem: (key: string): void => {
    mockStorageData.delete(key);
  },
  clear: (): void => {
    mockStorageData.clear();
  },
  get length(): number {
    return mockStorageData.size;
  },
  key: (index: number): string | null => {
    return Array.from(mockStorageData.keys())[index] ?? null;
  },
};

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  get: () => {
    if (shouldStorageThrowOnAccess) {
      throw new Error("SecurityError: Access to localStorage is denied");
    }
    return customMockStorage;
  },
});

function resetStorage() {
  mockStorageData.clear();
  shouldStorageThrowOnAccess = false;
  shouldStorageThrowOnSet = false;
  shouldStorageThrowOnGet = false;
}

console.log("=================================================================");
console.log("=== M2 ADVERSARIAL STRESS TEST SUITE EXECUTION ===");
console.log("=================================================================\n");

// ==============================================================================
// CATEGORY 1: getAllRepeatTasks & getRepeatThemes Input Resilience
// ==============================================================================
console.log("--- 1. Testing getAllRepeatTasks & getRepeatThemes Inputs ---");

// 1.1 Default undefined input
try {
  const all = getAllRepeatTasks(undefined);
  record({
    name: "getAllRepeatTasks(undefined) returns complete task pool without crashing",
    category: "Task Retrieval",
    passed: Array.isArray(all) && all.length >= 95,
    output: all.length,
    expected: ">= 95",
  });
} catch (e: any) {
  record({
    name: "getAllRepeatTasks(undefined) returns complete task pool without crashing",
    category: "Task Retrieval",
    passed: false,
    error: e.message,
  });
}

// 1.2 Empty array input
try {
  const empty = getAllRepeatTasks([]);
  record({
    name: "getAllRepeatTasks([]) returns empty array without throwing",
    category: "Task Retrieval",
    passed: Array.isArray(empty) && empty.length === 0,
    output: empty.length,
    expected: 0,
  });
} catch (e: any) {
  record({
    name: "getAllRepeatTasks([]) returns empty array without throwing",
    category: "Task Retrieval",
    passed: false,
    error: e.message,
  });
}

// 1.3 Null input (defensive check)
try {
  const nullTasks = getAllRepeatTasks(null as any);
  record({
    name: "getAllRepeatTasks(null) handles null gracefully without unhandled TypeError",
    category: "Task Retrieval",
    passed: Array.isArray(nullTasks),
    output: Array.isArray(nullTasks) ? "Array" : typeof nullTasks,
    expected: "Array or graceful fallback",
  });
} catch (e: any) {
  record({
    name: "getAllRepeatTasks(null) handles null gracefully without unhandled TypeError",
    category: "Task Retrieval",
    passed: false,
    error: e.message,
    notes: "null !== undefined evaluates to true, so null.includes() throws TypeError",
  });
}

try {
  const nullThemes = getRepeatThemes(null as any);
  record({
    name: "getRepeatThemes(null) handles null gracefully without unhandled TypeError",
    category: "Theme Aggregation",
    passed: Array.isArray(nullThemes),
    output: Array.isArray(nullThemes) ? "Array" : typeof nullThemes,
    expected: "Array or graceful fallback",
  });
} catch (e: any) {
  record({
    name: "getRepeatThemes(null) handles null gracefully without unhandled TypeError",
    category: "Theme Aggregation",
    passed: false,
    error: e.message,
    notes: "getRepeatThemes forwards null to getAllRepeatTasks, which throws TypeError",
  });
}

// 1.4 Non-existent lesson IDs
try {
  const nonExistent = getAllRepeatTasks(["non-existent-lesson-123", "fake-lesson-xyz"]);
  record({
    name: "getAllRepeatTasks with non-existent lesson IDs returns empty array",
    category: "Task Retrieval",
    passed: Array.isArray(nonExistent) && nonExistent.length === 0,
    output: nonExistent.length,
    expected: 0,
  });
} catch (e: any) {
  record({
    name: "getAllRepeatTasks with non-existent lesson IDs returns empty array",
    category: "Task Retrieval",
    passed: false,
    error: e.message,
  });
}

// 1.5 Malicious / Odd string IDs (empty string, whitespace, null characters, prototype pollution keys)
try {
  const oddIds = getAllRepeatTasks(["", "   ", "\0", "__proto__", "constructor", "toString"]);
  record({
    name: "getAllRepeatTasks with prototype/malicious string keys returns empty array safely",
    category: "Task Retrieval",
    passed: Array.isArray(oddIds) && oddIds.length === 0,
    output: oddIds.length,
    expected: 0,
  });
} catch (e: any) {
  record({
    name: "getAllRepeatTasks with prototype/malicious string keys returns empty array safely",
    category: "Task Retrieval",
    passed: false,
    error: e.message,
  });
}

// 1.6 Array with mixed types (nulls, numbers, objects inside array)
try {
  const mixed = getAllRepeatTasks([null, undefined, 42, {}, "python-basics"] as any);
  record({
    name: "getAllRepeatTasks with mixed primitive array extracts matching valid lessons safely",
    category: "Task Retrieval",
    passed: Array.isArray(mixed) && mixed.length > 0 && mixed.every(t => t.themeId === "python-basics"),
    output: mixed.length,
    notes: "Should safely extract python-basics while ignoring non-matching items",
  });
} catch (e: any) {
  record({
    name: "getAllRepeatTasks with mixed primitive array extracts matching valid lessons safely",
    category: "Task Retrieval",
    passed: false,
    error: e.message,
  });
}

// 1.7 Array with 10,000 duplicate IDs (stress testing filter performance)
try {
  const start = performance.now();
  const duplicateIds = Array(10000).fill("python-basics");
  const filtered = getAllRepeatTasks(duplicateIds);
  const duration = performance.now() - start;
  record({
    name: "getAllRepeatTasks with 10,000 duplicate IDs handles large array in < 50ms",
    category: "Task Retrieval",
    passed: Array.isArray(filtered) && filtered.length > 0 && duration < 50,
    output: `${duration.toFixed(2)}ms`,
    notes: `Duration: ${duration.toFixed(2)}ms for 10k items`,
  });
} catch (e: any) {
  record({
    name: "getAllRepeatTasks with 10,000 duplicate IDs handles large array in < 50ms",
    category: "Task Retrieval",
    passed: false,
    error: e.message,
  });
}

// 1.8 getRepeatThemes with various inputs
try {
  const allThemes = getRepeatThemes();
  const emptyThemes = getRepeatThemes([]);
  const singleTheme = getRepeatThemes(["python-basics"]);
  const nonExistentThemes = getRepeatThemes(["ghost-lesson"]);

  record({
    name: "getRepeatThemes returns valid themes with positive task counts",
    category: "Theme Aggregation",
    passed: allThemes.length >= 20 && allThemes.every(t => t.tasksCount > 0 && t.id && t.title),
    output: `Total themes: ${allThemes.length}`,
  });

  record({
    name: "getRepeatThemes([]) returns empty array",
    category: "Theme Aggregation",
    passed: Array.isArray(emptyThemes) && emptyThemes.length === 0,
    output: emptyThemes.length,
    expected: 0,
  });

  record({
    name: "getRepeatThemes(['python-basics']) isolates exactly that theme",
    category: "Theme Aggregation",
    passed: singleTheme.length === 1 && singleTheme[0].id === "python-basics",
    output: singleTheme.map(t => t.id),
  });

  record({
    name: "getRepeatThemes(['ghost-lesson']) returns empty array",
    category: "Theme Aggregation",
    passed: nonExistentThemes.length === 0,
    output: nonExistentThemes.length,
  });
} catch (e: any) {
  record({
    name: "getRepeatThemes resilience test",
    category: "Theme Aggregation",
    passed: false,
    error: e.message,
  });
}

// 1.9 Verify task data integrity across entire curriculum
try {
  const tasks = getAllRepeatTasks();
  let hasCorrupt = false;
  let corruptReason = "";

  for (const t of tasks) {
    if (!t.id || !t.themeId || !t.directionId || !t.prompt || !t.explanation) {
      hasCorrupt = true;
      corruptReason = `Task ${t.id} missing mandatory string fields`;
      break;
    }
    if (t.kind === "quiz") {
      if (!Array.isArray(t.options) || t.options.length < 2) {
        hasCorrupt = true;
        corruptReason = `Quiz task ${t.id} has invalid options`;
        break;
      }
      if (typeof t.answerIndex !== "number" || t.answerIndex < 0 || t.answerIndex >= t.options.length) {
        hasCorrupt = true;
        corruptReason = `Quiz task ${t.id} answerIndex ${t.answerIndex} out of bounds`;
        break;
      }
    } else if (t.kind === "practice") {
      if (typeof t.numericAnswer !== "number" || !Number.isFinite(t.numericAnswer)) {
        hasCorrupt = true;
        corruptReason = `Practice task ${t.id} numericAnswer is non-finite or missing`;
        break;
      }
      if (typeof t.tolerance !== "number" || t.tolerance < 0) {
        hasCorrupt = true;
        corruptReason = `Practice task ${t.id} tolerance is negative or missing`;
        break;
      }
    } else {
      hasCorrupt = true;
      corruptReason = `Task ${t.id} has unknown kind: ${(t as any).kind}`;
      break;
    }
  }

  record({
    name: "All generated RepeatTasks adhere strictly to data integrity constraints",
    category: "Data Integrity",
    passed: !hasCorrupt,
    output: hasCorrupt ? corruptReason : `${tasks.length} tasks valid`,
  });
} catch (e: any) {
  record({
    name: "All generated RepeatTasks adhere strictly to data integrity constraints",
    category: "Data Integrity",
    passed: false,
    error: e.message,
  });
}

// ==============================================================================
// CATEGORY 2: validateRepeatAnswer Boundary & Stress Testing
// ==============================================================================
console.log("\n--- 2. Testing validateRepeatAnswer Boundaries ---");

const quizTask: RepeatTask = {
  id: "test-quiz",
  themeId: "test-theme",
  themeTitle: "Test Theme",
  directionId: "ai-ml",
  directionTitle: "AI & ML",
  kind: "quiz",
  prompt: "What is 2+2?",
  options: ["3", "4", "5", "6"],
  answerIndex: 1,
  explanation: "4 is correct",
};

const practiceTask: RepeatTask = {
  id: "test-practice",
  themeId: "test-theme",
  themeTitle: "Test Theme",
  directionId: "physics-engineering",
  directionTitle: "Physics",
  kind: "practice",
  prompt: "Calculate velocity (m/s):",
  numericAnswer: 12.5,
  tolerance: 0.1,
  explanation: "12.5 m/s",
};

// 2.1 Quiz Validation Cases
const quizCases: Array<{ name: string; input: any; expected: boolean }> = [
  { name: "Exact correct option number", input: 1, expected: true },
  { name: "Exact correct option string '1'", input: "1", expected: true },
  { name: "Option string with whitespace '  1  '", input: "  1  ", expected: true },
  { name: "Incorrect option number 0", input: 0, expected: false },
  { name: "Incorrect option number 2", input: 2, expected: false },
  { name: "Negative option number -1", input: -1, expected: false },
  { name: "Out of bounds option 999", input: 999, expected: false },
  { name: "Empty string ''", input: "", expected: false },
  { name: "Whitespace string '   '", input: "   ", expected: false },
  { name: "Non-numeric string 'B'", input: "B", expected: false },
  { name: "Non-numeric string 'four'", input: "four", expected: false },
  { name: "Null input", input: null, expected: false },
  { name: "Undefined input", input: undefined, expected: false },
  { name: "NaN input", input: NaN, expected: false },
  { name: "Infinity input", input: Infinity, expected: false },
  { name: "-Infinity input", input: -Infinity, expected: false },
  { name: "Float input 1.0", input: 1.0, expected: true },
  { name: "Float input 1.5", input: 1.5, expected: false },
  { name: "Object input {}", input: {} as any, expected: false },
  { name: "Array input [1]", input: [1] as any, expected: true }, // [1].toString() is "1", parseInt("1") = 1
];

for (const qc of quizCases) {
  try {
    const res = validateRepeatAnswer(quizTask, qc.input);
    record({
      name: `Quiz: ${qc.name}`,
      category: "validateRepeatAnswer (Quiz)",
      passed: res === qc.expected,
      input: qc.input,
      output: res,
      expected: qc.expected,
    });
  } catch (e: any) {
    record({
      name: `Quiz: ${qc.name}`,
      category: "validateRepeatAnswer (Quiz)",
      passed: false,
      input: qc.input,
      error: e.message,
    });
  }
}

// 2.2 Practice Validation Boundary Cases (Numeric & Epsilon)
// task.numericAnswer = 12.5, tolerance = 0.1
// Acceptable range: [12.4, 12.6]
const practiceCases: Array<{ name: string; input: any; expected: boolean; notes?: string }> = [
  { name: "Exact match numeric (12.5)", input: 12.5, expected: true },
  { name: "Exact match string ('12.5')", input: "12.5", expected: true },
  { name: "Whitespace padded string ('  12.5  ')", input: "  12.5  ", expected: true },
  { name: "Lower boundary exact (12.4)", input: 12.4, expected: true },
  { name: "Upper boundary exact (12.6)", input: 12.6, expected: true },
  { name: "Lower boundary string ('12.4')", input: "12.4", expected: true },
  { name: "Upper boundary string ('12.6')", input: "12.6", expected: true },
  { name: "Inside tolerance epsilon above (12.5999)", input: 12.5999, expected: true },
  { name: "Inside tolerance epsilon below (12.4001)", input: 12.4001, expected: true },
  { name: "Outside tolerance epsilon above (12.6001)", input: 12.6001, expected: false },
  { name: "Outside tolerance epsilon below (12.3999)", input: 12.3999, expected: false },
  { name: "Way outside (25.0)", input: 25.0, expected: false },
  { name: "Negative number (-12.5)", input: -12.5, expected: false },
  { name: "Scientific notation ('1.25e1')", input: "1.25e1", expected: true },
  { name: "Scientific notation lower ('1.24e1')", input: "1.24e1", expected: true },
  { name: "Scientific notation outside ('1.27e1')", input: "1.27e1", expected: false },
  { name: "With plus sign ('+12.5')", input: "+12.5", expected: true },
  { name: "Empty string ('')", input: "", expected: false },
  { name: "Whitespace string ('   ')", input: "   ", expected: false },
  { name: "Garbage string ('abc')", input: "abc", expected: false },
  { name: "Number with trailing letters ('12.5m/s')", input: "12.5m/s", expected: true, notes: "parseFloat parses 12.5" },
  { name: "Letters with trailing number ('m/s 12.5')", input: "m/s 12.5", expected: false },
  { name: "Multiple decimals ('12.5.5')", input: "12.5.5", expected: true, notes: "parseFloat parses 12.5" },
  { name: "NaN input (NaN)", input: NaN, expected: false },
  { name: "NaN string ('NaN')", input: "NaN", expected: false },
  { name: "Infinity input (Infinity)", input: Infinity, expected: false },
  { name: "-Infinity input (-Infinity)", input: -Infinity, expected: false },
  { name: "Infinity string ('Infinity')", input: "Infinity", expected: false },
  { name: "Null input", input: null, expected: false },
  { name: "Undefined input", input: undefined, expected: false },
  { name: "Object input {}", input: {} as any, expected: false },
];

for (const pc of practiceCases) {
  try {
    const res = validateRepeatAnswer(practiceTask, pc.input);
    record({
      name: `Practice: ${pc.name}`,
      category: "validateRepeatAnswer (Practice)",
      passed: res === pc.expected,
      input: pc.input,
      output: res,
      expected: pc.expected,
      notes: pc.notes,
    });
  } catch (e: any) {
    record({
      name: `Practice: ${pc.name}`,
      category: "validateRepeatAnswer (Practice)",
      passed: false,
      input: pc.input,
      error: e.message,
    });
  }
}

// 2.3 Floating point precision test: 0.1 + 0.2 = 0.30000000000000004
const floatTask: RepeatTask = {
  id: "float-task",
  themeId: "float-theme",
  themeTitle: "Float Theme",
  directionId: "mathematics",
  directionTitle: "Math",
  kind: "practice",
  prompt: "What is 0.1 + 0.2?",
  numericAnswer: 0.3,
  tolerance: 0.001,
  explanation: "0.3",
};

const floatSum = 0.1 + 0.2;
const floatRes = validateRepeatAnswer(floatTask, floatSum);
record({
  name: "Floating point precision (0.1 + 0.2 = 0.30000000000000004) evaluates true within tolerance",
  category: "Floating Point",
  passed: floatRes === true,
  input: floatSum,
  output: floatRes,
  expected: true,
});

// 2.4 Zero numericAnswer test
const zeroTask: RepeatTask = {
  id: "zero-task",
  themeId: "zero-theme",
  themeTitle: "Zero Theme",
  directionId: "mathematics",
  directionTitle: "Math",
  kind: "practice",
  prompt: "Evaluate at origin:",
  numericAnswer: 0,
  tolerance: 0.05,
  explanation: "0",
};

record({
  name: "Numeric answer 0 matches 0",
  category: "Zero Numeric Answer",
  passed: validateRepeatAnswer(zeroTask, 0) === true,
});
record({
  name: "Numeric answer 0 matches -0",
  category: "Zero Numeric Answer",
  passed: validateRepeatAnswer(zeroTask, -0) === true,
});
record({
  name: "Numeric answer 0 matches '0'",
  category: "Zero Numeric Answer",
  passed: validateRepeatAnswer(zeroTask, "0") === true,
});
record({
  name: "Numeric answer 0 matches 0.04 (within tol 0.05)",
  category: "Zero Numeric Answer",
  passed: validateRepeatAnswer(zeroTask, 0.04) === true,
});
record({
  name: "Numeric answer 0 rejects 0.06 (outside tol 0.05)",
  category: "Zero Numeric Answer",
  passed: validateRepeatAnswer(zeroTask, 0.06) === false,
});

// 2.5 Malformed task object passed to validateRepeatAnswer
try {
  const nullTaskRes = validateRepeatAnswer(null as any, 1);
  record({
    name: "validateRepeatAnswer(null, 1) returns false without throwing",
    category: "Malformed Task Object",
    passed: nullTaskRes === false,
    output: nullTaskRes,
  });
} catch (e: any) {
  record({
    name: "validateRepeatAnswer(null, 1) returns false without throwing",
    category: "Malformed Task Object",
    passed: false,
    error: e.message,
  });
}

try {
  const emptyTaskRes = validateRepeatAnswer({} as any, 1);
  record({
    name: "validateRepeatAnswer({}, 1) returns false without throwing",
    category: "Malformed Task Object",
    passed: emptyTaskRes === false,
    output: emptyTaskRes,
  });
} catch (e: any) {
  record({
    name: "validateRepeatAnswer({}, 1) returns false without throwing",
    category: "Malformed Task Object",
    passed: false,
    error: e.message,
  });
}

try {
  const noAnswerPractice: RepeatTask = {
    ...practiceTask,
    numericAnswer: undefined,
  };
  const noAnsRes = validateRepeatAnswer(noAnswerPractice, 12.5);
  record({
    name: "validateRepeatAnswer with undefined numericAnswer returns false safely",
    category: "Malformed Task Object",
    passed: noAnsRes === false,
    output: noAnsRes,
  });
} catch (e: any) {
  record({
    name: "validateRepeatAnswer with undefined numericAnswer returns false safely",
    category: "Malformed Task Object",
    passed: false,
    error: e.message,
  });
}

// ==============================================================================
// CATEGORY 3: savePracticeSession & getPracticeSessions Storage Resilience
// ==============================================================================
console.log("\n--- 3. Testing Storage Persistence, Corruption & Capacity ---");

resetStorage();

// 3.1 Initial empty state
record({
  name: "getPracticeSessions() on empty storage returns empty array []",
  category: "Storage",
  passed: Array.isArray(getPracticeSessions()) && getPracticeSessions().length === 0,
});

// 3.2 Basic save & retrieval
const s1: PracticeSession = {
  id: "session-1",
  completedAt: "2026-10-01T10:00:00Z",
  totalQuestions: 5,
  correctCount: 4,
  scorePercent: 80,
  xpEarned: 60,
  themeId: "python-basics",
  themeTitle: "Python Basics",
  directionId: "ai-ml",
};
savePracticeSession(s1);
const stored1 = getPracticeSessions();
record({
  name: "savePracticeSession persists session and getPracticeSessions retrieves it",
  category: "Storage",
  passed: stored1.length === 1 && stored1[0].id === "session-1" && stored1[0].scorePercent === 80,
});

// 3.3 Multiple sessions & LIFO ordering (newest session first)
const s2: PracticeSession = {
  id: "session-2",
  completedAt: "2026-10-01T10:15:00Z",
  totalQuestions: 10,
  correctCount: 10,
  scorePercent: 100,
  xpEarned: 150,
  themeId: "all",
  themeTitle: "All Themes",
};
savePracticeSession(s2);
const stored2 = getPracticeSessions();
record({
  name: "Sessions maintain LIFO ordering (newest at index 0)",
  category: "Storage",
  passed: stored2.length === 2 && stored2[0].id === "session-2" && stored2[1].id === "session-1",
});

// 3.4 Corrupted JSON strings in localStorage
const corruptJsonValues = [
  { name: "Unclosed JSON array", value: "[{id: 'broken'" },
  { name: "Garbage string", value: "SOME_RANDOM_GARBAGE_DATA" },
  { name: "Primitive null JSON", value: "null" },
  { name: "Primitive number JSON", value: "12345" },
  { name: "Primitive boolean JSON", value: "true" },
  { name: "Primitive string JSON", value: '"just a string"' },
  { name: "Object instead of array", value: '{"id": "session-1", "score": 100}' },
  { name: "Empty string", value: "" },
];

for (const c of corruptJsonValues) {
  resetStorage();
  mockStorageData.set(PRACTICE_SESSIONS_STORAGE_KEY, c.value);
  try {
    const res = getPracticeSessions();
    record({
      name: `Corrupted storage (${c.name}) returns empty array [] without throwing`,
      category: "Storage Corruption",
      passed: Array.isArray(res) && res.length === 0,
      output: res,
    });
  } catch (e: any) {
    record({
      name: `Corrupted storage (${c.name}) returns empty array [] without throwing`,
      category: "Storage Corruption",
      passed: false,
      error: e.message,
    });
  }
}

// 3.4.1 Corrupted elements inside a valid JSON array
resetStorage();
mockStorageData.set(
  PRACTICE_SESSIONS_STORAGE_KEY,
  JSON.stringify([null, 123, "corrupted", { incomplete: true }]),
);
try {
  const malformedItems = getPracticeSessions();
  // Corrupt entries should either be filtered out or sanitized to valid PracticeSession shapes
  const allAreValidObjects =
    Array.isArray(malformedItems) &&
    malformedItems.every(
      (s) =>
        s &&
        typeof s === "object" &&
        typeof s.id === "string" &&
        typeof s.completedAt === "string" &&
        typeof s.scorePercent === "number",
    );
  record({
    name: "getPracticeSessions filters out or sanitizes corrupt/null array elements",
    category: "Corrupt Data Sanitization",
    passed: allAreValidObjects,
    output: malformedItems,
    notes: allAreValidObjects
      ? "Sanitized"
      : "Array contains null/primitive entries, violating PracticeSession schema",
  });
} catch (e: any) {
  record({
    name: "getPracticeSessions filters out or sanitizes corrupt/null array elements",
    category: "Corrupt Data Sanitization",
    passed: false,
    error: e.message,
  });
}

// 3.5 Saving when localStorage was previously corrupted (self-healing)
resetStorage();
mockStorageData.set(PRACTICE_SESSIONS_STORAGE_KEY, "{MALFORMED_JSON");
try {
  savePracticeSession(s1);
  const healed = getPracticeSessions();
  record({
    name: "savePracticeSession self-heals corrupted storage without throwing",
    category: "Storage Self-Healing",
    passed: healed.length === 1 && healed[0].id === "session-1",
    output: healed.length,
  });
} catch (e: any) {
  record({
    name: "savePracticeSession self-heals corrupted storage without throwing",
    category: "Storage Self-Healing",
    passed: false,
    error: e.message,
  });
}

// 3.6 Capacity & High Volume Stress Test (1,000 sessions)
resetStorage();
try {
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    savePracticeSession({
      id: `session-stress-${i}`,
      completedAt: new Date(Date.now() + i * 1000).toISOString(),
      totalQuestions: 5,
      correctCount: 4,
      scorePercent: 80,
      xpEarned: 60,
      themeId: "python-basics",
    });
  }
  const duration = performance.now() - start;
  const sessions1000 = getPracticeSessions();
  record({
    name: "Capacity test: 1,000 sessions saved and retrieved in order",
    category: "Storage Capacity",
    passed: sessions1000.length === 1000 && sessions1000[0].id === "session-stress-999",
    output: `${sessions1000.length} sessions in ${duration.toFixed(2)}ms`,
    notes: `Duration: ${duration.toFixed(2)}ms`,
  });
} catch (e: any) {
  record({
    name: "Capacity test: 1,000 sessions saved and retrieved in order",
    category: "Storage Capacity",
    passed: false,
    error: e.message,
  });
}

// 3.7 Storage Quota Exceeded (QuotaExceededError) handling
resetStorage();
shouldStorageThrowOnSet = true;
try {
  // Should catch internally and log error, not crash caller
  savePracticeSession(s1);
  record({
    name: "savePracticeSession handles QuotaExceededError without crashing caller",
    category: "Storage Quota Error",
    passed: true,
  });
} catch (e: any) {
  record({
    name: "savePracticeSession handles QuotaExceededError without crashing caller",
    category: "Storage Quota Error",
    passed: false,
    error: e.message,
  });
}
shouldStorageThrowOnSet = false;

// 3.8 SecurityError / Access Denied (e.g. Safari private mode, cross-origin iframe)
resetStorage();
shouldStorageThrowOnAccess = true;
try {
  const restrictedSessions = getPracticeSessions();
  record({
    name: "getPracticeSessions handles localStorage access throwing SecurityError",
    category: "Security & Sandbox",
    passed: Array.isArray(restrictedSessions) && restrictedSessions.length === 0,
    output: restrictedSessions,
  });
} catch (e: any) {
  record({
    name: "getPracticeSessions handles localStorage access throwing SecurityError",
    category: "Security & Sandbox",
    passed: false,
    error: e.message,
    notes: "Accessing globalThis.localStorage threw before getLocalStorage() could check",
  });
}
shouldStorageThrowOnAccess = false;

// 3.9 clearPracticeSessions
resetStorage();
savePracticeSession(s1);
savePracticeSession(s2);
clearPracticeSessions();
record({
  name: "clearPracticeSessions removes stored sessions",
  category: "Storage",
  passed: getPracticeSessions().length === 0,
});

// ==============================================================================
// CATEGORY 4: RepeatTasksView Component Logic Simulation
// ==============================================================================
console.log("\n--- 4. Testing RepeatTasksView Internal Logic ---");

// 4.1 Score percentage calculation edge cases
function computeScorePercent(correctCount: number, totalQuestions: number): number {
  return totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
}

record({
  name: "Score calculation with 0 questions yields 0% (no NaN or divide-by-zero)",
  category: "View Logic",
  passed: computeScorePercent(0, 0) === 0,
  output: computeScorePercent(0, 0),
  expected: 0,
});

record({
  name: "Score calculation with 1 of 3 yields rounded 33%",
  category: "View Logic",
  passed: computeScorePercent(1, 3) === 33,
  output: computeScorePercent(1, 3),
  expected: 33,
});

record({
  name: "Score calculation with 2 of 3 yields rounded 67%",
  category: "View Logic",
  passed: computeScorePercent(2, 3) === 67,
  output: computeScorePercent(2, 3),
  expected: 67,
});

record({
  name: "Score calculation with 5 of 5 yields 100%",
  category: "View Logic",
  passed: computeScorePercent(5, 5) === 100,
  output: computeScorePercent(5, 5),
  expected: 100,
});

// 4.2 XP Award Deduplication logic simulation
const simulatedSolvedSet = new Set<string>();
let simulatedXp = 0;

function simulateAnswerCheck(taskId: string, isCorrect: boolean) {
  if (isCorrect && !simulatedSolvedSet.has(taskId)) {
    simulatedSolvedSet.add(taskId);
    simulatedXp += 15;
    return true; // awarded
  }
  return false; // not awarded or already solved
}

const firstAttempt = simulateAnswerCheck("task-1", true);
const retryAttempt = simulateAnswerCheck("task-1", true);
const thirdAttempt = simulateAnswerCheck("task-1", false);

record({
  name: "First correct answer awards +15 XP",
  category: "XP Deduplication",
  passed: firstAttempt === true && simulatedXp === 15,
});

record({
  name: "Subsequent correct attempt on same task does NOT re-award XP (deduplicated)",
  category: "XP Deduplication",
  passed: retryAttempt === false && simulatedXp === 15,
});

record({
  name: "Incorrect attempt does not award XP",
  category: "XP Deduplication",
  passed: thirdAttempt === false && simulatedXp === 15,
});

// ==============================================================================
// SUMMARY & STATISTICS
// ==============================================================================
console.log("\n=================================================================");
console.log("=== ADVERSARIAL STRESS TEST SUMMARY ===");
console.log("=================================================================");

const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log(`Total Scenarios Tested: ${total}`);
console.log(`Passed:                 ${passed}`);
console.log(`Failed:                 ${failed}`);
console.log(`Pass Rate:              ${((passed / total) * 100).toFixed(1)}%\n`);

if (failed > 0) {
  console.log("Failed Scenarios:");
  for (const f of results.filter((r) => !r.passed)) {
    console.log(` - [${f.category}] ${f.name}`);
    if (f.error) console.log(`     Error: ${f.error}`);
    if (f.notes) console.log(`     Notes: ${f.notes}`);
  }
} else {
  console.log("ALL ADVERSARIAL SCENARIOS PASSED WITH ZERO UNHANDLED EXCEPTIONS!");
}

process.exit(failed > 0 ? 1 : 0);
