# Comprehensive Investigation Handoff Report: Lesson Engine, Plotting Math & State Architecture

**Agent:** `explorer_o4_engine`  
**Date:** 2026-10-18  
**Scope:** Lesson Engine (`/lesson/[lessonId]`, `LessonView.tsx`, `LessonRenderer.tsx`), Interactive Plot & Math Compiler (`InteractivePlot.tsx`, `plot-math.ts`), Assessment Checkpoints (`Assessment.tsx`, `ChatAssessment.tsx`), State Persistence & Hydration Architecture (`progress-store.ts`, `progress-provider.tsx`, `repeat-tasks.ts`, `Sidebar.tsx`, `ProgressPanel.tsx`).  
**Preserved Boundary Constraint:** Strict preservation of 3D Island files (`src/components/learning-world/*`, `src/app/world.css`, `src/app/path/[directionId]/*`).  

---

## 1. Observation

### Observation 1.1: Scientific Notation Regex Fails on Valid Numbers with No Leading Digits (`.5e2`) or Trailing Dots (`1.e2`)
- **File:** `src/lib/plot-math.ts:1011, 1014-1019`
- **Verbatim Code:**
  ```ts
  1011: clean = clean.replace(/(\d+(?:\.\d+)?)[eE]([+-]?\d+)/g, "($1*10^($2))");
  ...
  1014: const tokens = clean.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
  1015: for (const token of tokens) {
  1016:   if (!ALLOWED_MATH_IDENTIFIERS.has(token.toLowerCase())) {
  1017:     return null;
  1018:   }
  1019: }
  ```
- **Empirical Execution:**
  Command: `npx tsx -e "import { compileCustomExpression } from './src/lib/plot-math.ts'; console.log('.5e2:', compileCustomExpression('.5e2')); console.log('1.e2:', compileCustomExpression('1.e2'));"`
  Output:
  ```
  .5e2: null
  1.e2: null
  ```
- **Impact:** Valid scientific expressions entered into the calculator drawer or plotting formulas with decimals lacking a leading zero (e.g. `.5e2`) or with trailing dots (`1.e2`) fail syntax checks and are rejected as `null` with `"Syntax or math error"`.

---

### Observation 1.2: Unthrottled `pointermove` and Synchronous Wheel State Updates in Interactive Plot
- **File:** `src/components/lesson/plot/InteractivePlot.tsx:1298-1318, 1706-1746`
- **Verbatim Code (Wheel Handler):**
  ```tsx
  1298: const handleWheel = (e: WheelEvent) => {
  1299:   e.preventDefault();
  1300:   e.stopPropagation();
  ...
  1310:   zoomAt(factor, currentScale.invertX(px), currentScale.invertY(py));
  1311: };
  ```
  Where `zoomAt` directly executes `setViewport((v) => ...)` (lines 1253-1271) on every single wheel event tick, bypassing `scheduleViewportUpdate`.
- **Verbatim Code (Pointer Move Handler):**
  ```tsx
  1732: } else if (settings.showHoverTooltip) {
  1733:   const px = ((e.clientX - rect.left) / rect.width) * W;
  1734:   if (px >= L && px <= W - R) {
  1735:     const xVal = scale.invertX(px);
  1736:     const yVal = activeFn(xVal);
  1737:     if (Number.isFinite(yVal)) {
  1738:       setHover({ x: xVal, y: yVal });
  1739:     } else {
  1740:       setHover(null);
  1741:     }
  1742:   } else {
  1743:     setHover(null);
  1744:   }
  1745: }
  ```
- **Bounding Rect Guard Missing:** Lines 1706-1733 do not guard `if (rect.width <= 0 || rect.height <= 0) return;`. If the element is resizing or hidden, `(e.clientX - rect.left) / rect.width` divides by zero, resulting in `Infinity` or `NaN` coordinates propagating to `scale.invertX(NaN)`.
- **Impact:** Moving the mouse over the SVG canvas at 120Hz-240Hz triggers hundreds of synchronous/unthrottled React re-renders per second of the root `InteractivePlot` component, causing frame drops and input stutter.

---

### Observation 1.3: Decimal Comma Rejection in Practice Numerical Inputs
- **Files:**
  - `src/components/lesson/Assessment.tsx:26-30`
  - `src/components/lesson/ChatAssessment.tsx:197-200`
  - `src/lib/repeat-tasks.ts:213-219`
- **Verbatim Code (`Assessment.tsx`):**
  ```tsx
  26: const value = Number(answer.trim());
  27: const correct =
  28:   answer.trim() !== "" &&
  29:   Number.isFinite(value) &&
  30:   Math.abs(value - problem.answer) <= problem.tolerance;
  ```
- **Verbatim Code (`ChatAssessment.tsx`):**
  ```tsx
  197: const value = Number(answer.trim());
  198: const correct =
  199:   Number.isFinite(value) &&
  200:   Math.abs(value - problem.answer) <= problem.tolerance;
  ```
- **Verbatim Code (`repeat-tasks.ts`):**
  ```ts
  213: const val =
  214:   typeof userAnswer === "number"
  215:     ? userAnswer
  216:     : parseFloat(String(userAnswer).trim());
  217: if (isNaN(val) || task.numericAnswer === undefined) return false;
  218: const tol = task.tolerance ?? 0.05;
  219: return Math.abs(val - task.numericAnswer) <= tol;
  ```
- **Empirical Execution:**
  - `Number("2,5")` -> `NaN` (fails `Number.isFinite`)
  - `parseFloat("2,5")` -> `2` (truncates at comma; `Math.abs(2 - 2.5) = 0.5 > 0.05` -> marked false)
- **Impact:** Students using European keyboard layouts, Italian language keyboards, or mobile keypads with decimal commas (especially pertinent on the Italian track) have correct answers marked as incorrect.

---

### Observation 1.4: Missing "incorrect" Feedback Class on Multiple-Choice Options in `Assessment.tsx`
- **Files:** `src/components/lesson/Assessment.tsx:140-156`, `src/app/lesson.css:2256-2263`
- **Verbatim Code (`Assessment.tsx`):**
  ```tsx
  140: {question.options.map((option, index) => (
  141:   <label
  142:     key={option}
  143:     className={`${selected === index ? "selected" : ""} ${completed && index === question.answerIndex ? "correct" : ""}`}
  144:   >
  ```
- **Verbatim Code (`lesson.css`):**
  ```css
  2256: .lesson-options .selected {
  2257:   border-color: #75acd0;
  2258:   background: #eff7fc;
  2259: }
  2260: .lesson-options .correct {
  2261:   border-color: #78b76b;
  2262:   background: #eff8e9;
  2263: }
  ```
- **Impact:** When a student selects an incorrect option and presses "Check answer", the label remains in the neutral blue `.selected` state. It never receives an `.incorrect` class, and `.lesson.css` lacks `.lesson-options .incorrect` styling.

---

### Observation 1.5: Multi-Key Storage Fragmentation & In-Memory Desynchronization on Reset
- **Files:**
  - `src/stores/progress-store.ts:263-276`
  - `src/components/repeat/RepeatTasksView.tsx:104, 113-132, 191-218`
  - `src/lib/island-audio.ts:13, 23`
  - `src/components/lesson/plot/InteractivePlot.tsx:1146, 1160`
- **Verbatim Code (`progress-store.ts`):**
  ```ts
  263: resetProgress: () => {
  264:   try {
  265:     if (typeof globalThis !== "undefined" && globalThis.localStorage) {
  266:       globalThis.localStorage.removeItem("uplift_solved_repeat_tasks");
  267:       globalThis.localStorage.removeItem("uplift_practice_sessions");
  268:       globalThis.localStorage.removeItem("uplift_math_studio_settings_v3");
  269:     } else if (typeof localStorage !== "undefined") {
  270:       localStorage.removeItem("uplift_solved_repeat_tasks");
  271:       localStorage.removeItem("uplift_practice_sessions");
  272:       localStorage.removeItem("uplift_math_studio_settings_v3");
  273:     }
  274:   } catch {}
  275:   set({ ...freshProgress(), lessonActivities: {} });
  276: },
  ```
- **Impact:**
  - Five separate keys exist across the app without a unified storage layer (`storage.ts` does not exist).
  - `uplift_ambient_audio_muted` is not cleared on reset.
  - `RepeatTasksView` maintains `locallySolved: Set<string>` in React state. Resetting progress in `ProfileView` does not trigger state updates or event notifications in `RepeatTasksView`, leaving previously solved tasks still visually marked as solved until a hard page refresh.

---

### Observation 1.6: SSR Hydration Mismatch & Flash of Locked Content in `LessonView.tsx`
- **Files:**
  - `src/components/lesson/LessonView.tsx:32-40, 57-82`
  - `src/components/layout/Sidebar.tsx:72, 103`
  - `src/stores/progress-provider.tsx:28-46`
- **Verbatim Code (`LessonView.tsx`):**
  ```tsx
  36: const lessonState = useMemo(
  37:   () => ({ completedLessons, unlockedLessons }),
  38:   [completedLessons, unlockedLessons],
  39: );
  40: const status = getLessonStatus(lesson, lessonState);
  ...
  57: if (status === "locked")
  58:   return (
  59:     <div className="standard-page">
  ...
  68:       <h1>A little further along your path.</h1>
  ```
- **Impact:**
  - On the server, `completedLessons` and `unlockedLessons` reflect only initial demo defaults.
  - If a student visits a lesson they unlocked on their client device (e.g. `/lesson/deep-learning`), the server pre-renders the "locked" view with HTTP 200.
  - `LessonView.tsx` does not check `useProgressReady()`. When client rehydration finishes (~100ms later), `status` jumps from `"locked"` to `"current"`, causing a jarring visual layout flash.
  - In `Sidebar.tsx`, `suppressHydrationWarning` was added to `<aside>` (line 72) and `<nav>` (line 103) to mask this divergence.

---

### Observation 1.7: Unbounded Progress Percentage Calculations and Negative Stat Value Risks
- **Files:**
  - `src/components/layout/Sidebar.tsx:47-50`
  - `src/components/layout/ProgressPanel.tsx:46-47`
  - `src/components/profile/ProfileView.tsx:29, 110, 115`
- **Verbatim Code (`Sidebar.tsx`):**
  ```ts
  47: const levelPercent = Math.min(
  48:   100,
  49:   Math.round(((xp % levelSize) / levelSize) * 100),
  50: );
  ```
- **Impact:** If `xp < 0`, `xp % levelSize` is negative. `Math.min(100, negative)` evaluates to a negative number, resulting in invalid CSS widths (`style={{ width: "-15%" }}`) and invalid ARIA `aria-valuenow`. In `ProfileView.tsx`, `{level * levelSize - xp} XP to go` can evaluate negative if `xp` exceeds the level threshold.

---

### Observation 1.8: Boundary Singularity Accuracy in Simpson's Rule Integration
- **File:** `src/lib/plot-math.ts:162-190`
- **Verbatim Code:**
  ```ts
  177: const fa = safeEval(fn, a);
  178: const fb = safeEval(fn, b);
  179: let sum = (Number.isFinite(fa) ? fa : 0) + (Number.isFinite(fb) ? fb : 0);
  ```
- **Empirical Execution:**
  - `numericalDefiniteIntegral((x) => 1/Math.sqrt(x), 0, 1)` yields `1.859` (analytical value is `2.000`).
  - `numericalDefiniteIntegral((x) => 1/Math.sqrt(1 - x*x), -1, 1)` yields `2.860` (analytical value is `pi = 3.14159`).
- **Impact:** Dropping boundary singularities to `0` successfully guards against `NaN`, but produces substantial truncation error in calculus graphing simulations.

---

## 2. Logic Chain

1. **Premise 1 (Scientific Notation):** `compileCustomExpression` preprocesses scientific notation using regex `/(\d+(?:\.\d+)?)[eE]([+-]?\d+)/g`. Because the token matcher requires at least one digit preceding the decimal, expressions formatted as `.5e2` or `1.e2` are not replaced. When scanned for identifiers in line 1014, the unmatched `"e2"` is rejected by `ALLOWED_MATH_IDENTIFIERS`, resulting in a premature `null` return.
2. **Premise 2 (Plot Rendering):** `InteractivePlot` binds `onPointerMove` directly to `setHover`. In SVG graphics, mouse pointer move events fire at the hardware polling rate (up to 240Hz). Each state update triggers React reconciliations that recompute SVG `<path>` bezier curves and child components. Additionally, `handleWheel` invokes `zoomAt`, directly setting viewport state instead of using `scheduleViewportUpdate` (which employs `requestAnimationFrame`).
3. **Premise 3 (International Assessment Inputs):** In JavaScript, `Number("2,5")` returns `NaN`, and `parseFloat("2,5")` truncates at the comma to `2`. When students on European systems type decimals with commas, `Number.isFinite("2,5")` is false, and `parseFloat("2,5")` generates incorrect differences, causing false-negative quiz and practice failures.
4. **Premise 4 (State Hydration & Boundaries):** Server-side pre-rendering utilizes `initialProgress` from `demo.ts`. Client components reading Zustand's store before `store.persist.rehydrate()` completes observe demo state. In `LessonView.tsx`, this leads to advanced unlocked lessons being prematurely evaluated as `"locked"`, rendering the locked error template on the server and flashing upon client hydration.

---

## 3. Caveats

- **3D Island Preservation:** As instructed by the critical strict constraint, no inspection or modification was performed on `src/components/learning-world/*`, `src/app/world.css`, or `src/app/path/[directionId]/*`.
- **Existing Tests:** The baseline test suite (78 tests) passes 100% because existing test assertions in `tests/plot-math.test.ts` test `1e-5`, `1e5`, `2.5e3`, but omit floats without leading zeros (`.5e2`) and omit comma decimal inputs.
- **Code Sandboxes:** Non-coding tracks (Physics, Mathematics, Italian) correctly contain 0 code blocks across all curriculum lessons.

---

## 4. Conclusion

The application's core lesson engine and math architecture are functionally rich, but contain 8 specific bugs across numerical compilation, pointer/wheel event handling, international input normalization, assessment feedback styles, storage synchronization, and SSR hydration.

### Summary of Discovered Bugs & Recommended Remediation

| # | Bug Title | Impacted File(s) & Lines | Severity | Recommended Remediation |
|---|---|---|---|---|
| 1 | Scientific notation regex edge-case failure on `.5e2` / `1.e2` | `src/lib/plot-math.ts:1011` | High | Update regex to `/((?:\d+(?:\.\d*)?\|\.\d+))[eE]([+-]?\d+)/g` |
| 2 | Unthrottled `pointermove` & synchronous wheel zoom | `src/components/lesson/plot/InteractivePlot.tsx:1298-1318, 1706-1746` | High | Throttle `setHover` via rAF; route `handleWheel` through `scheduleViewportUpdate`; add `rect.width <= 0` guard |
| 3 | Comma decimal rejection in numerical inputs | `Assessment.tsx:26`, `ChatAssessment.tsx:197`, `repeat-tasks.ts:216` | High | Normalize string with `.replace(",", ".")` before numerical conversion |
| 4 | Missing `.incorrect` class in assessment multiple choice | `Assessment.tsx:142`, `src/app/lesson.css:2256-2263` | Medium | Add `${checked && !completed && selected === index ? "incorrect" : ""}` and CSS rule `.lesson-options .incorrect` |
| 5 | Multi-key storage fragmentation and reset desync | `progress-store.ts:263`, `RepeatTasksView.tsx:104`, `repeat-tasks.ts` | High | Create `src/lib/storage.ts` coordinator; clear in-memory `locallySolved` on reset |
| 6 | SSR hydration mismatch & locked card flash in `LessonView` | `LessonView.tsx:32-40, 57`, `Sidebar.tsx:72, 103` | High | Defer locked card display until `useProgressReady()` is true; remove `suppressHydrationWarning` |
| 7 | Negative progress percentage / stat calculation risks | `Sidebar.tsx:47`, `ProgressPanel.tsx:47`, `ProfileView.tsx:29, 110` | Low | Clamp values with `Math.max(0, Math.min(100, ...))` |
| 8 | Boundary singularity truncation error in Simpson's rule | `src/lib/plot-math.ts:177-179` | Medium | When boundary is non-finite, sample at perturbed offset `a + 1e-4 * h` |

---

## 5. Verification Method

To independently verify these findings, execute the following commands in the workspace root:

1. **Verify Baseline Test Suite:**
   ```bash
   npm test
   ```
   *Expected:* 78 tests pass.

2. **Verify Scientific Notation Bug with `.5e2`:**
   ```bash
   npx tsx -e "import { compileCustomExpression } from './src/lib/plot-math.ts'; console.log('.5e2 result:', compileCustomExpression('.5e2'));"
   ```
   *Expected:* Outputs `null` (demonstrating the defect).

3. **Verify Comma Decimal Input Failure:**
   ```bash
   npx tsx -e "import { validateRepeatAnswer } from './src/lib/repeat-tasks.ts'; console.log('Parsed 2,5 for answer 2.5:', validateRepeatAnswer({ kind: 'practice', numericAnswer: 2.5, tolerance: 0.05, id: '1', themeId: 't', themeTitle: 'T', directionId: 'd', prompt: 'p', explanation: 'e' }, '2,5'));"
   ```
   *Expected:* Outputs `false` (demonstrating the defect).

4. **Verify TypeScript & Build Integrity:**
   ```bash
   npm run typecheck
   npm run build
   ```
   *Expected:* Compiles cleanly without TypeScript errors.

5. **Invalidation Condition:**
   - If `compileCustomExpression(".5e2")` returns a callable function evaluating to `50`, Bug 1 is invalidated.
   - If `validateRepeatAnswer(..., "2,5")` returns `true`, Bug 3 is invalidated.
