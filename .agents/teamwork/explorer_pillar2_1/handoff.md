# Pillar 2 Audit Report: Test Suite Coverage & Resilience

**Auditor:** `explorer_pillar2_1`  
**Repository:** Uplift University (`uplift-university`, Next.js 16 / React 19 / Three.js / Zustand)  
**Scope:** Test Suite Coverage & Resilience (`tests/`, `src/lib/`, `src/stores/`, `src/components/`, `src/app/api/`, and edge case handling)  
**Audit Date:** 2026-10-05  
**Mode:** AUDIT-ONLY (Zero source code modifications)

---

## 1. Observation

### 1.1 Test Suite Inventory & Baseline Telemetry
The repository uses the Node.js native test runner via `tsx` (`package.json:12`: `"test": "tsx --test tests/*.test.ts"`).
Running the automated test suites yielded the following baseline results:

- **Command:** `npm test`
  - Output: `ℹ tests 73 | ℹ suites 3 | ℹ pass 73 | ℹ fail 0 | ℹ cancelled 0 | ℹ skipped 0 | ℹ duration_ms 59431.8372`
  - Warning/Noise during run: Unhandled console error logged during quota test: `Failed to save practice session: Error [QuotaExceededError]: QuotaExceededError: The quota has been exceeded` at `src/lib/repeat-tasks.ts:251`.
- **Command:** `npm run typecheck` (`tsc --noEmit`)
  - Output: Exited with code 0. Zero TypeScript errors.
- **Command:** `npm run lint` (`eslint .`)
  - Output: 0 errors, 5 unused variable warnings:
    - `src/components/learning-world/IslandSignposts.tsx:6:10` (`directions`)
    - `src/components/learning-world/IslandSignposts.tsx:7:10` (`learningWorlds`)
    - `src/components/learning-world/IslandSignposts.tsx:17:10` (`IslandSignpost`)
    - `src/components/learning-world/IslandSignposts.tsx:249:33` (`_props`)
    - `src/components/lesson/ChatAssessment.tsx:10:3` (`speed`)

#### Test Inventory Breakdown (8 Files in `tests/`):
1. `tests/island-redesign.test.ts` (237 lines):
   - 2 tests: "all campus islands have zero mesh clipping and generous clearance...", "all tree variants are recognized species with rich distributions".
   - Type: Data validation / geometric collision testing on static world configs.
2. `tests/learning-world.test.ts` (185 lines):
   - 7 tests: Platform arc-length ordering, 3D road geometry vertex/face closure, event emission order on lesson completion, Stork priority celebration queuing, level/achievement event payloads, hover cooldown logic, GLB clip case-insensitive fallback, Stork reset behavior.
   - Type: Math/Geometry & Controller unit tests.
3. `tests/lesson-engine.test.ts` (161 lines):
   - 5 tests: Gradient descent algorithm phase synchronization, convergence/divergence boundary conditions, activity completion gatekeeper logic, KaTeX rendering validity across 21 lesson contents, store block activity deduplication/reset.
   - Type: Math & Content integration tests.
4. `tests/m2-empirical-challenge.test.ts` (596 lines):
   - 14 tests in 3 suites: Track completion achievements (physics-master, math-pioneer, italian-scholar, practice-champion), Route alias logic (`/path/[directionId]`), resetProgress storage clearance & failure resilience.
   - Type: Store & Next.js page function integration tests.
5. `tests/mascot.test.ts` (93 lines):
   - 5 tests: Torso seam normal matching, animation gesture switching, anatomical look constraints & jump envelope, eyelid blinking timing, skinned mesh vertex weight preservation.
   - Type: Three.js geometry & mascot animation unit tests.
6. `tests/plot-math.test.ts` (542 lines):
   - 18 tests: niceStep grid step intervals, computeGridLines ticks, numericalDerivative, numericalSecondDerivative, numericalDefiniteIntegral Simpson rule, findCriticalPoints roots/extrema/inflections, compileCustomExpression sanitization & math evaluation, preset evaluations, linear coordinate inversion roundtrips, double-tap cooldown simulation, exponential compilation, uppercase normalization, singular boundary endpoints in integrals, pointer micro-jitter simulation, unary negation precedence, evaluateCalculatorExpression, gradient descent lab formula compilation.
   - Type: Mathematical utility unit tests and local simulation tests.
7. `tests/progress-store.test.ts` (117 lines):
   - 7 tests: Initial curriculum state, locked lesson guards, completion XP & unlocking, full path completion to level 3, empty curriculum direction switching, store rehydration & demo reset, invalid XP input handling.
   - Type: Zustand store unit tests.
8. `tests/repeat-tasks.test.ts` (458 lines):
   - 11 tests: Task extraction across 4 tracks, task filtering by completed lesson IDs, theme count aggregation, quiz & numeric answer tolerance validation, session persistence, track completion achievements, defensive null handling, SecurityError handling, corrupt array element filtering, MAX_PRACTICE_SESSIONS capacity cap, QuotaExceededError graceful fallback.
   - Type: Repeat review system unit & storage resilience tests.

---

### 1.2 Empirical Code Coverage Audit
Executing Node's experimental code coverage profiler (`node --import tsx --test --experimental-test-coverage tests/*.test.ts`) uncovered significant coverage disparities:

| Module / Directory | Line Coverage | Branch Coverage | Function Coverage | Uncovered Range / Notes |
| :--- | :---: | :---: | :---: | :--- |
| `src/app/api/mascot/route.ts` | **0.00%** | **0.00%** | **0.00%** | Entire file never loaded or executed |
| `src/app/lesson/[lessonId]/page.tsx` | **0.00%** | **0.00%** | **0.00%** | Entire file never loaded or executed |
| `src/app/repeat/page.tsx` | **0.00%** | **0.00%** | **0.00%** | Entire file never loaded or executed |
| `src/app/courses/page.tsx` | **0.00%** | **0.00%** | **0.00%** | Entire file never loaded or executed |
| `src/app/dashboard/page.tsx` | **0.00%** | **0.00%** | **0.00%** | Entire file never loaded or executed |
| `src/app/profile/page.tsx` | **0.00%** | **0.00%** | **0.00%** | Entire file never loaded or executed |
| `src/app/leaderboard/page.tsx` | **0.00%** | **0.00%** | **0.00%** | Entire file never loaded or executed |
| `src/app/achievements/page.tsx` | **0.00%** | **0.00%** | **0.00%** | Entire file never loaded or executed |
| `src/app/path/[directionId]/page.tsx` | 100.00% | 100.00% | 100.00% | Covered via `m2-empirical-challenge.test.ts` |
| `src/components/lesson/plot/InteractivePlot.tsx` | **38.50%** | 100.00% | **10.00%** | Lines 45-152, 155-208, 211-290, 294-344, 350-436, 444-513, 516-568, 572-1292 |
| `src/components/lesson/plot/MathCalculatorDrawer.tsx` | **20.44%** | 100.00% | **50.00%** | Lines 47-373 |
| `src/components/repeat/RepeatTasksView.tsx` | **35.93%** | 100.00% | **50.00%** | Lines 34-534 |
| `src/components/lesson/LessonRenderer.tsx` | **37.09%** | 100.00% | **28.57%** | Lines 57-92, 96-218, 220-229, 232-268, 271-583 |
| `src/components/lesson/LessonView.tsx` | **34.13%** | 100.00% | **50.00%** | Lines 24-189 |
| `src/components/lesson/GradientDescentLab.tsx` | **35.73%** | 100.00% | **14.29%** | Lines 27-58, 63-69, 72-79, 83-100, 114-256, 260-319 |
| `src/components/lesson/ChatAssessment.tsx` | **35.83%** | 100.00% | **25.00%** | Lines 12-37, 41-121, 124-213 |
| `src/components/lesson/algorithm/AlgorithmVisualizer.tsx` | **41.03%** | 100.00% | **20.00%** | Lines 11-41, 44-58, 64-70, 73-88 |
| `src/components/learning-world/LearningWorld.tsx` | **45.89%** | 100.00% | **33.33%** | Lines 31-34, 36-43, 76-109, 112-269 |
| `src/components/learning-world/DirectionView.tsx` | **34.88%** | 100.00% | **50.00%** | Lines 15-70 |
| `src/components/learning-world/LessonNode.tsx` | **41.67%** | 100.00% | **50.00%** | Lines 13-61 |
| `src/components/layout/*` (AppShell, Sidebar, TopBar, ProgressPanel) | **0.00%** | **0.00%** | **0.00%** | Never imported or executed |
| `src/stores/progress-provider.tsx` | **66.67%** | 100.00% | **40.00%** | Lines 22-37, 41, 50-54 |
| `src/stores/progress-store.ts` | 97.89% | 96.43% | 93.55% | Lines 67-68, 85, 162-164 |
| `src/lib/plot-math.ts` | 98.51% | 79.68% | 100.00% | Lines 159, 317, 324-325, 350, 353, 368-371, 374, 449 |
| `src/lib/repeat-tasks.ts` | 95.33% | 82.19% | 100.00% | Lines 16, 81-82, 88, 90-99 |
| `src/lib/stork-controller.ts` | 89.92% | 96.43% | **78.57%** | Lines 31, 33, 62-71 (and `react()` dispatch loop) |
| `src/lib/gradient-descent.ts` | 95.70% | 100.00% | 83.33% | Lines 59-62 (`formatNumber` lines 89-93 untested) |
| `src/lib/lesson-progress.ts` | 100.00% | 100.00% | 100.00% | Full execution under happy path |
| `src/lib/world-geometry.ts` | 100.00% | 100.00% | 100.00% | Covered |
| `src/lib/learning-events.ts` | 100.00% | 100.00% | 100.00% | Covered |

---

### 1.3 Verbatim Edge Case Findings & Empirical Vulnerabilities

#### Finding A: Scientific Notation Silent Calculation Corruption in `compileCustomExpression`
- **Location:** `src/lib/plot-math.ts:646-651`, `src/lib/plot-math.ts:661`, `src/lib/plot-math.ts:784-807`
- **Empirical Execution Command:**
  ```bash
  node -e "import('./src/lib/plot-math.ts').then(m => { console.log('1e-5:', m.compileCustomExpression('1e-5')(0)); console.log('1e5:', m.compileCustomExpression('1e5')); console.log('calc 1e-5:', m.evaluateCalculatorExpression('1e-5')); })"
  ```
- **Actual Output:**
  ```text
  1e-5: -2.281718171540955
  1e5: null
  calc 1e-5: { success: true, result: -2.281718, isFunction: false }
  ```
- **Root Cause:**
  1. In line 646: `const tokens = clean.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];`. For input `"1e-5"`, the token matched is `["e"]`. For `"1e5"`, the token matched is `["e5"]`.
  2. Because `"e5"` is not in `ALLOWED_MATH_IDENTIFIERS` (line 649), `"1e5"` returns `null`.
  3. For `"1e-5"`, `"e"` is recognized as Euler's constant ($Math.E \approx 2.71828$). Then line 661 transforms implicit multiplication: `(\d)\s*([a-zA-Z(])` converts `1e` to `1*e`.
  4. The expression `1e-5` (which mathematically represents $0.00001 = 10^{-5}$) compiles to `1 * Math.E - 5` which equals `-2.281718`! The calculator drawer and graphing engine silently corrupt scientific notation values.

#### Finding B: `niceStep` and `computeGridLines` Division by Zero / Non-Finite Propagation
- **Location:** `src/lib/plot-math.ts:45-58`, `src/lib/plot-math.ts:61-116`
- **Empirical Execution Command:**
  ```bash
  node -e "import('./src/lib/plot-math.ts').then(m => { console.log('niceStep(10, 0):', m.niceStep(10, 0)); console.log('niceStep(10, -5):', m.niceStep(10, -5)); console.log('niceStep(10, NaN):', m.niceStep(10, NaN)); })"
  ```
- **Actual Output:**
  ```text
  niceStep(10, 0): Infinity
  niceStep(10, -5): NaN
  niceStep(10, NaN): NaN
  ```
- **Root Cause:**
  Line 46 only checks `if (range <= 0 || !Number.isFinite(range)) return 1;`. It never validates `targetTicks <= 0 || !Number.isFinite(targetTicks)`. Passing `targetTicks = 0` results in `rawStep = Infinity`, `Math.log10(Infinity) = Infinity`, `fraction = Infinity / Infinity = NaN`, returning `Infinity` or `NaN`.
  Consequently, `computeGridLines(viewport, 0, 0)` returns `{ stepX: Infinity, stepY: Infinity, majorX: [], majorY: [] }`.

#### Finding C: Numerical Definite Integral Interval Distortion on Negative Inputs
- **Location:** `src/lib/plot-math.ts:150-169`
- **Empirical Execution Command:**
  ```bash
  node -e "import('./src/lib/plot-math.ts').then(m => { console.log('integral -2 intervals:', m.numericalDefiniteIntegral(x => 3*x*x, 0, 2, -2)); })"
  ```
- **Actual Output:**
  ```text
  integral -2 intervals: -4
  ```
- **Root Cause:**
  Line 154: `const n = intervals % 2 === 0 ? intervals : intervals + 1; const h = (b - a) / n;`. When `intervals = -2`, `n = -2`, `h = -1`, reversing the step direction and yielding `-4` instead of `+8`. No guard exists for `intervals <= 0`.

#### Finding D: Critical Missing Exception Boundaries in Calculus Utilities
- **Location:** `src/lib/plot-math.ts:119-144`, `src/lib/plot-math.ts:175-199`
- **Empirical Execution Command:**
  ```bash
  node -e "import('./src/lib/plot-math.ts').then(m => { try { m.numericalDerivative(() => { throw new Error('eval error'); }, 0); } catch(e) { console.log('derivative uncaught:', e.message); } try { m.findCriticalPoints(() => { throw new Error('eval error'); }, -2, 2); } catch(e) { console.log('findCriticalPoints uncaught:', e.message); } })"
  ```
- **Actual Output:**
  ```text
  derivative uncaught: eval error
  findCriticalPoints uncaught: eval error
  ```
- **Root Cause:**
  `numericalDerivative`, `numericalSecondDerivative`, and `findCriticalPoints` execute user-provided math functions without `try...catch` guards. Any function throwing during graph evaluation triggers an unhandled crash in the rendering tree.

#### Finding E: Corrupted Array Deserialization Crashes in `progress-store.ts`
- **Location:** `src/stores/progress-store.ts:42-68`
- **Empirical Execution Command:**
  ```bash
  npx tsx -e "import { getLessonStatus, getDirectionProgress } from './src/stores/progress-store.ts'; import { getLesson } from './src/data/curriculum.ts'; try { getLessonStatus(getLesson('python-basics')!, { completedLessons: undefined as any, unlockedLessons: undefined as any }); } catch(e: any) { console.log('getLessonStatus error:', e.message); } try { getDirectionProgress('ai-ml', { completedLessons: undefined as any } as any); } catch(e: any) { console.log('getDirectionProgress error:', e.message); }"
  ```
- **Actual Output:**
  ```text
  getLessonStatus error: Cannot read properties of undefined (reading 'includes')
  getDirectionProgress error: Cannot read properties of undefined (reading 'includes')
  ```
- **Root Cause:**
  Lines 46 and 59 invoke `state.completedLessons.includes(...)` without defensive `Array.isArray(state.completedLessons)` checks. If corrupted state in `localStorage` rehydrates without `completedLessons`, the entire navigation and lesson status evaluation crashes with a fatal TypeError.

#### Finding F: Division by Zero producing `NaN` in `lessonCompletion`
- **Location:** `src/lib/lesson-progress.ts:16-33`
- **Empirical Code Analysis:**
  ```ts
  export function lessonCompletion(lesson: LessonContent, activity: LessonActivity) {
    const requirements = lessonRequirements(lesson);
    let total = 0, done = 0;
    for (const key of ["completed", "practice", "quiz"] as const) {
      total += requirements[key].length;
      done += requirements[key].filter((id) => activity[key].includes(id)).length;
    }
    return {
      done,
      total,
      percent: Math.round((done / total) * 100), // When total === 0, Math.round(NaN) = NaN
      complete: done === total,                  // 0 === 0 -> true!
    };
  }
  ```
- **Result:** An empty lesson returns `{ done: 0, total: 0, percent: NaN, complete: true }`.

---

### 1.4 Test Resilience & Mock Quality Weaknesses

#### Finding G: False Positive / In-Test Simulation Testing in `tests/plot-math.test.ts`
- **Location:** `tests/plot-math.test.ts:211-251`, `tests/plot-math.test.ts:324-408`
- **Observation:**
  In `tests/plot-math.test.ts`:
  - Lines 216-234 declare a local function `simulateTrigger(now, clientX, clientY, graphX, graphY)` inside the test file.
  - Lines 346-372 declare local functions `onPointerDown`, `onPointerMove`, `onPointerUp` inside the test file.
  - Neither test imports or executes any production code from `src/components/lesson/plot/InteractivePlot.tsx`!
- **Root Cause:**
  Because the repository lacks a DOM test harness (`jsdom` / `@testing-library/react`), the author wrote self-contained mock algorithms that pass unconditionally inside the test runner, while the production event handlers in `InteractivePlot.tsx:1280-1333` and `InteractivePlot.tsx:1420-1550` remain completely unverified.

#### Finding H: Uncoordinated Global `localStorage` Mock Pollution
- **Location:** `tests/learning-world.test.ts:21-28`, `tests/lesson-engine.test.ts:133-140`, `tests/progress-store.test.ts:11-23`, `tests/repeat-tasks.test.ts:21-36`, `tests/m2-empirical-challenge.test.ts:24-39`
- **Observation:**
  Five distinct test files re-assign `globalThis.localStorage` via `Object.defineProperty` using differing semantics (one is a silent no-op object, others are in-memory Maps, one has dynamic error throwing). If test runner concurrency changes or tests execute in different worker configurations, storage state leaks between suites.

---

## 2. Logic Chain

```
Observation: package.json has only `tsx --test tests/*.test.ts` with no jsdom or testing-library
  ├── Logic Step 1: Tests execute strictly in a Node.js CLI process without DOM, Window, or Web APIs.
  └── Result: 53 React UI components (src/components/) and 10 Next.js route pages (src/app/) cannot mount or render in tests.

Observation: tests/plot-math.test.ts:211-251 & 324-408 test locally defined functions simulateTrigger & onPointerMove
  ├── Logic Step 2: The tests do not import or exercise InteractivePlot.tsx.
  └── Result: R1 acceptance criteria ("Double-clicking places a coordinate pin on the first try") has false positive test coverage. Component breakages will not fail tests.

Observation: compileCustomExpression("1e-5")(0) returns -2.281718, and "1e5" returns null
  ├── Logic Step 3: Tokenizer treats 'e' in 1e-5 as Euler's constant and replaces '1e' with '1*Math.E - 5'.
  └── Result: Mathematical calculations involving scientific notation in plots or the calculator drawer silently produce incorrect results or crash.

Observation: niceStep(10, 0) returns Infinity, and niceStep(10, NaN) returns NaN
  ├── Logic Step 4: niceStep lacks targetTicks validity check before division.
  └── Result: computeGridLines with zero ticks generates non-finite stepX/stepY and breaks graph SVG rendering.

Observation: getLessonStatus & getDirectionProgress throw TypeError when state.completedLessons is undefined
  ├── Logic Step 5: Zustand rehydration from corrupted localStorage can produce incomplete state objects.
  └── Result: Lack of defensive default fallbacks in progress-store.ts leads to unhandled runtime crashes during rehydration.

Observation: src/app/api/mascot/route.ts has 0% coverage and no test files
  ├── Logic Step 6: Route handler GET logic (dynamic access to public/models/stork.glb) is unverified.
  └── Result: Backend API contract regressions or filesystem access failures are undetected.
```

---

## 3. Detailed Weakness Catalog with Severity Ratings

| ID | Severity | File Path & Lines | Root Cause | Failure Mode |
| :--- | :---: | :--- | :--- | :--- |
| **TEST-01** | `[CRITICAL]` | `src/lib/plot-math.ts:646-670` | Tokenizer & implicit multiplication treat scientific notation exponent `e` as variable / Euler's constant | Scientific notation like `1e-5` produces `-2.2817` instead of `0.00001`; `1e5` returns `null`. Math errors in plotting & calculator. |
| **TEST-02** | `[HIGH]` | `tests/plot-math.test.ts:211-251, 324-408` | Double-tap tests test local dummy functions rather than `src/components/lesson/plot/InteractivePlot.tsx` | False positive tests: UI event handling or coordinate transformations in `InteractivePlot.tsx` can break with 100% test pass rate. |
| **TEST-03** | `[HIGH]` | `src/app/api/mascot/route.ts:1-17` | No test file exists for Next.js route handlers | Route response structure, headers (`no-store`), and filesystem model access (`public/models/stork.glb`) are unverified. |
| **TEST-04** | `[HIGH]` | `src/stores/progress-provider.tsx:22-66` | No unit/integration tests for Context Provider and hooks (`useProgress`, `useLearningEvents`, `useProgressReady`) | Rehydration race conditions, timeout fallback (100ms), and out-of-context hook invocation errors are unverified. |
| **TEST-05** | `[HIGH]` | `src/stores/progress-store.ts:42-68` | Direct calls to `.includes()` without checking `Array.isArray(state.completedLessons)` | Uncaught `TypeError: Cannot read properties of undefined (reading 'includes')` on corrupt storage rehydration. |
| **TEST-06** | `[HIGH]` | `src/lib/plot-math.ts:45-58` | `niceStep` does not validate `targetTicks <= 0 || !Number.isFinite(targetTicks)` | `niceStep(10, 0)` returns `Infinity`, causing `computeGridLines` to produce `stepX: Infinity` and empty ticks. |
| **TEST-07** | `[HIGH]` | `package.json:12` & `tests/` | Lack of DOM/Browser test framework (`jsdom`, `@testing-library/react`, Playwright) | 53 core React UI components in `src/components/` and 10 page routes in `src/app/` have 0% interaction test coverage. |
| **TEST-08** | `[HIGH]` | `src/lib/plot-math.ts:119-144, 175-199` | `numericalDerivative` and `findCriticalPoints` lack exception handling for throwing `fn(x)` | Any runtime error in user equation crashes graph analysis and unmounts the component tree. |
| **TEST-09** | `[MEDIUM]` | `src/lib/lesson-progress.ts:16-33` | `lessonCompletion` divides by `total` without checking `total === 0` | Empty lesson returns `{ percent: NaN, complete: true }`. |
| **TEST-10** | `[MEDIUM]` | `src/lib/stork-controller.ts:99-118` | `StorkController.react(event)` dispatch loop has 0 tests | Event reactions (`LESSON_COMPLETED`, `LEVEL_UP`, `ACHIEVEMENT_UNLOCKED`, `LESSON_STARTED`, `XP_GAINED`) are never tested via `react()`. |
| **TEST-11** | `[MEDIUM]` | `src/lib/gradient-descent.ts:89-93` | `formatNumber` has 0 tests | Large numbers, scientific notation thresholds, and non-finite numbers in iteration table are untested. |
| **TEST-12** | `[MEDIUM]` | `src/lib/plot-math.ts:150-169` | `numericalDefiniteIntegral` does not guard against `intervals <= 0` | Negative intervals produce inverted area values (e.g. `-4` instead of `+8`). |
| **TEST-13** | `[MEDIUM]` | `tests/*` (5 files) | Five different uncoordinated `localStorage` mocks across test files | Order-dependent state leakage between test suites; lack of unified test environment harness. |
| **TEST-14** | `[LOW]` | `src/lib/repeat-tasks.ts:251` | `console.error` invoked unconditionally when catching `QuotaExceededError` | Noisy error logs during automated test runs; pollutes CI test runner output. |

---

## 4. Concrete Remediation Code

Below are concrete, drop-in test suites and test cases designed to remediate the identified gaps and strengthen test suite resilience.

### Remediation Suite 1: Scientific Notation & Calculus Boundary Tests (`tests/plot-math-edge-cases.test.ts`)
Remediates **TEST-01**, **TEST-06**, **TEST-08**, and **TEST-12**:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compileCustomExpression,
  evaluateCalculatorExpression,
  niceStep,
  computeGridLines,
  numericalDerivative,
  numericalDefiniteIntegral,
  findCriticalPoints,
} from "../src/lib/plot-math";

test("TEST-01: compileCustomExpression correctly parses scientific notation without Euler corruption", () => {
  // Scientific notation with positive exponent
  const fPos = compileCustomExpression("1e5");
  assert.ok(fPos, "1e5 should compile successfully");
  assert.equal(fPos(0), 100000);

  // Scientific notation with negative exponent (e.g. 1e-5 = 0.00001)
  const fNeg = compileCustomExpression("1e-5");
  assert.ok(fNeg, "1e-5 should compile successfully");
  assert.ok(Math.abs(fNeg(0) - 0.00001) < 1e-9, `Expected 0.00001, got ${fNeg(0)}`);

  // Mixed scientific notation in equation: 2.5e-2 * x^2
  const fPoly = compileCustomExpression("2.5e-2 * x^2");
  assert.ok(fPoly);
  assert.ok(Math.abs(fPoly(10) - 2.5) < 1e-6);

  // Calculator expression evaluation
  const calc1e5 = evaluateCalculatorExpression("1e5");
  assert.equal(calc1e5.success, true);
  assert.equal(calc1e5.result, 100000);

  const calc1eNeg5 = evaluateCalculatorExpression("1e-5");
  assert.equal(calc1eNeg5.success, true);
  assert.equal(calc1eNeg5.result, 0.00001);
});

test("TEST-06: niceStep safely guards against zero, negative, and non-finite targetTicks", () => {
  assert.equal(niceStep(10, 0), 1, "targetTicks=0 should return default step 1");
  assert.equal(niceStep(10, -5), 1, "targetTicks=-5 should return default step 1");
  assert.equal(niceStep(10, NaN), 1, "targetTicks=NaN should return default step 1");
  assert.equal(niceStep(10, Infinity), 1, "targetTicks=Infinity should return default step 1");
  assert.equal(niceStep(0, 10), 1, "range=0 should return default step 1");
  assert.equal(niceStep(-50, 10), 1, "range=-50 should return default step 1");

  // computeGridLines with zero ticks does not produce Infinity
  const grid = computeGridLines({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 }, 0, 0);
  assert.ok(Number.isFinite(grid.stepX), "stepX must be finite");
  assert.ok(Number.isFinite(grid.stepY), "stepY must be finite");
});

test("TEST-08: numericalDerivative and findCriticalPoints survive throwing functions without crashing", () => {
  const throwingFn = (_x: number) => {
    throw new Error("Evaluation failed");
  };

  assert.doesNotThrow(() => {
    const deriv = numericalDerivative(throwingFn, 0);
    assert.equal(deriv, 0, "Throwing function derivative must fallback to 0");
  });

  assert.doesNotThrow(() => {
    const pts = findCriticalPoints(throwingFn, -5, 5);
    assert.deepEqual(pts, [], "Throwing function critical points must fallback to empty array");
  });
});

test("TEST-12: numericalDefiniteIntegral handles negative or non-finite intervals defensively", () => {
  const fSquare = (x: number) => 3 * x * x;

  // Intervals <= 0 should fallback to standard interval count
  const resNeg = numericalDefiniteIntegral(fSquare, 0, 2, -2);
  assert.ok(Math.abs(resNeg - 8) < 0.1, `Expected ~8, got ${resNeg}`);

  const resZero = numericalDefiniteIntegral(fSquare, 0, 2, 0);
  assert.ok(Math.abs(resZero - 8) < 0.1, `Expected ~8, got ${resZero}`);

  const resNaN = numericalDefiniteIntegral(fSquare, 0, 2, NaN);
  assert.ok(Math.abs(resNaN - 8) < 0.1, `Expected ~8, got ${resNaN}`);
});
```

---

### Remediation Suite 2: Mascot API Route Handler Test (`tests/api-mascot.test.ts`)
Remediates **TEST-03**:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { GET } from "../src/app/api/mascot/route";

test("TEST-03: GET /api/mascot returns valid JSON response and no-store cache header", async () => {
  const response = await GET();
  assert.equal(response.status, 200, "API route must return HTTP 200");

  const cacheControl = response.headers.get("Cache-Control");
  assert.equal(cacheControl, "no-store", "Route must enforce no-store header");

  const body = await response.json();
  assert.ok(typeof body === "object" && body !== null, "Response must be a JSON object");
  assert.ok("modelUrl" in body, "Response body must contain 'modelUrl' key");

  // modelUrl must either be a valid path string or null if asset missing
  if (body.modelUrl !== null) {
    assert.equal(typeof body.modelUrl, "string");
    assert.equal(body.modelUrl, "/models/stork.glb");
  } else {
    assert.equal(body.modelUrl, null);
  }
});
```

---

### Remediation Suite 3: State Corruption & Hydration Defensive Tests (`tests/progress-store-resilience.test.ts`)
Remediates **TEST-05** and **TEST-09**:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getLessonStatus,
  getDirectionProgress,
  createProgressStore,
} from "../src/stores/progress-store";
import { getLesson } from "../src/data/curriculum";
import { lessonCompletion, emptyActivity } from "../src/lib/lesson-progress";
import type { LessonContent } from "../src/types/lesson-engine";

test("TEST-05: getLessonStatus and getDirectionProgress handle undefined completedLessons gracefully", () => {
  const lesson = getLesson("python-basics")!;
  assert.ok(lesson);

  // Corrupted state with undefined / null arrays
  const corruptedState = {
    completedLessons: undefined as unknown as string[],
    unlockedLessons: undefined as unknown as string[],
  };

  assert.doesNotThrow(() => {
    const status = getLessonStatus(lesson, corruptedState);
    assert.ok(status === "locked" || status === "current" || status === "completed");
  }, "getLessonStatus must not throw on undefined completedLessons");

  assert.doesNotThrow(() => {
    const dirProgress = getDirectionProgress("ai-ml", corruptedState as any);
    assert.deepEqual(dirProgress, { completed: 0, total: 6, percent: 0 });
  }, "getDirectionProgress must not throw on undefined completedLessons");
});

test("TEST-09: lessonCompletion handles empty or zero-requirement lessons without NaN percent", () => {
  const emptyLesson: LessonContent = {
    id: "empty-test-lesson",
    title: "Empty Lesson",
    version: 1,
    sections: [],
    practiceProblems: [],
    quiz: [],
  };

  const completion = lessonCompletion(emptyLesson, emptyActivity());
  assert.equal(Number.isNaN(completion.percent), false, "Percent must not be NaN");
  assert.equal(completion.percent, 0, "Empty lesson percent must be 0");
  assert.equal(completion.complete, false, "Empty lesson must not be marked complete");
});
```

---

### Remediation Suite 4: Stork Controller Event Reactions & Gradient Descent Formatter (`tests/stork-reactions.test.ts`)
Remediates **TEST-10** and **TEST-11**:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { StorkController } from "../src/lib/stork-controller";
import { formatNumber } from "../src/lib/gradient-descent";

test("TEST-10: StorkController.react dispatches correct animations for all learning event types", () => {
  const controller = new StorkController();

  // LESSON_COMPLETED -> celebrate
  controller.react({ type: "LESSON_COMPLETED", lessonId: "linear-algebra", nextLessonId: "calc-derivatives", sequence: 1, timestamp: Date.now() });
  assert.equal(controller.animation, "celebrate");

  controller.reset();

  // LEVEL_UP -> celebrate
  controller.react({ type: "LEVEL_UP", level: 5, sequence: 2, timestamp: Date.now() });
  assert.equal(controller.animation, "celebrate");

  controller.reset();

  // ACHIEVEMENT_UNLOCKED -> celebrate
  controller.react({ type: "ACHIEVEMENT_UNLOCKED", achievementId: "math-pioneer", sequence: 3, timestamp: Date.now() });
  assert.equal(controller.animation, "celebrate");

  controller.reset();

  // LESSON_STARTED -> point
  controller.react({ type: "LESSON_STARTED", lessonId: "python-basics", sequence: 4, timestamp: Date.now() });
  assert.equal(controller.animation, "point");

  controller.reset();

  // XP_GAINED when idle -> wave
  controller.react({ type: "XP_GAINED", amount: 100, total: 500, sequence: 5, timestamp: Date.now() });
  assert.equal(controller.animation, "wave");
});

test("TEST-11: formatNumber formats regular numbers, scientific thresholds, and handles edge cases", () => {
  assert.equal(formatNumber(12.3456), "12.3456");
  assert.equal(formatNumber(0), "0");
  assert.equal(formatNumber(5.1), "5.1");
  assert.equal(formatNumber(10000), "1.00e+4");
  assert.equal(formatNumber(250000), "2.50e+5");
  assert.equal(formatNumber(-15000), "-1.50e+4");
});
```

---

## 5. Caveats
1. **Source Code Immutability:** In adherence to the strict AUDIT-ONLY constraint, no existing files in `src/`, `tests/`, or `package.json` were modified during this investigation. All remediation test suites are presented as proposals ready for implementation.
2. **Component Testing Boundary:** Because the current package configuration does not install `@testing-library/react` or `jsdom`, React component rendering tests (e.g. mounting `InteractivePlot` or `RepeatTasksView`) could not be executed directly in the Node.js test runner without adding new devDependencies (`@testing-library/react`, `jsdom`).
3. **Hardware Acceleration:** WebGL and Three.js canvas execution in headless Node.js requires mocking WebGL rendering contexts, meaning visual rendering fidelity in `src/components/learning-world/` must be validated via browser/E2E test tools rather than pure Node CLI tests.

---

## 6. Conclusion
The Uplift University test suite possesses a solid foundation of 73 unit tests covering core mathematical algorithms, curve sampling, and data integrity. However, from a resilience and architectural standpoint, Pillar 2 exhibits three critical vulnerabilities:
1. **Mathematical Parsing Vulnerability (`[CRITICAL]`):** Scientific notation (`1e-5`, `1e5`) is corrupted or rejected by `compileCustomExpression`, silently producing wrong math in interactive plots and calculator drawer evaluations without any existing test detecting the bug.
2. **False Confidence from Simulation Testing (`[HIGH]`):** Key interactive plot tests in `plot-math.test.ts` test local duplicate mocks rather than production code in `InteractivePlot.tsx`, creating an illusion of 100% test coverage while the actual React components remain untested.
3. **Complete Absence of UI & Route Testing (`[HIGH]`):** 53 React components, 10 Next.js route pages, and the API route handler have zero direct interaction test coverage due to the lack of a DOM test harness.

Adopting the proposed remediation suites and integrating `@testing-library/react` will elevate test resilience from baseline unit verification to true production-grade reliability.

---

## 7. Verification Method
To independently verify all findings and test suite behavior:

1. **Run Baseline Automated Tests:**
   ```powershell
   npm test
   ```
   *Expected:* 73 passing tests, 0 failures, 1 QuotaExceededError console warning from `repeat-tasks.ts`.

2. **Run Experimental Code Coverage Profiler:**
   ```powershell
   node --import tsx --test --experimental-test-coverage tests/*.test.ts
   ```
   *Expected:* Confirms `src/app/api/mascot/route.ts` (0%), `InteractivePlot.tsx` (38.5% line, 10% func), `progress-provider.tsx` (66.7% line, 40% func).

3. **Verify Scientific Notation Bug (`TEST-01`):**
   ```powershell
   node -e "import('./src/lib/plot-math.ts').then(m => { console.log('1e-5:', m.compileCustomExpression('1e-5')(0)); console.log('1e5:', m.compileCustomExpression('1e5')); })"
   ```
   *Expected:* Reproduces `-2.281718` for `1e-5` (Euler multiplication bug) and `null` for `1e5`.

4. **Verify niceStep Zero-Tick Division (`TEST-06`):**
   ```powershell
   node -e "import('./src/lib/plot-math.ts').then(m => console.log('niceStep(10, 0):', m.niceStep(10, 0)))"
   ```
   *Expected:* Reproduces `Infinity`.

5. **Verify State Rehydration Undefined Array Crash (`TEST-05`):**
   ```powershell
   npx tsx -e "import { getLessonStatus } from './src/stores/progress-store.ts'; import { getLesson } from './src/data/curriculum.ts'; getLessonStatus(getLesson('python-basics'), { completedLessons: undefined as any, unlockedLessons: undefined as any });"
   ```
   *Expected:* Throws `TypeError: Cannot read properties of undefined (reading 'includes')`.

6. **Invalidation Condition:**
   If running any of the above commands fails to reproduce the exact error messages or behaviors cited, re-check Node.js version (tested on Node v24.21.0 / Windows).
