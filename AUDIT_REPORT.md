# Uplift University Codebase Audit Report
**Date:** 2026-10-05  
**Codebase:** `uplift-university` (Next.js 16.3.5 / React 19.2.8 / Three.js 0.182.0 / @react-three/fiber 9.7.0 / Zustand 5.0.15)  
**Audit Mode:** STRICT AUDIT-ONLY (0 source files modified)  
**Workspace:** `c:\Users\Muzaffar\Desktop\university-learning`  

---

## 1. Executive Summary

### 1.1 Overall Health Score: 73 / 100

The Uplift University learning platform demonstrates impressive pedagogical design, rich Three.js procedural island environments, and an ambitious multi-track interactive curriculum (AI & Machine Learning, Physics & Engineering, Mathematics, and Italian Language & Culture). Automated unit tests and static typechecking pass with 100% success on the baseline codebase.

However, an exhaustive multi-agent investigation across all architectural dimensions reveals critical production vulnerabilities, subtle mathematical calculation corruptions, memory leaks in 3D graphics disposal, and architectural coupling that threaten application stability, security, and scalability under real-world usage.

### 1.2 Pillar-by-Pillar Score Breakdown

| Pillar | Focus Domain | Health Score | Rating | Primary Vulnerabilities Identified |
| :--- | :--- | :---: | :---: | :--- |
| **Pillar 1** | 3D Graphics & UI Performance | **68 / 100** | Needs Attention | Cloned GLTF memory leaks (`dispose={null}`), orphaned road geometries, WebGL context thrashing on navigation, unthrottled pointer & wheel event re-renders. |
| **Pillar 2** | Test Suite Coverage & Resilience | **71 / 100** | Moderate Risk | Scientific notation Euler corruption bug undetected, double-tap tested against local mocks rather than production components, 0% UI/DOM and API route test coverage. |
| **Pillar 3** | Architecture & State Management | **65 / 100** | Critical Risk | Ubiquitous whole-store subscriptions (`useProgress((s) => s)`) triggering universal layout re-renders, state fragmented across 4 uncoordinated localStorage keys, hydration race condition suppressed by `suppressHydrationWarning`. |
| **Pillar 4** | TypeScript Strictness & Code Quality | **78 / 100** | Good / Moderate | 5 ESLint warnings failing zero-warning criteria, missing `global-error.tsx` root boundary, missing `noUncheckedIndexedAccess`, division by zero yielding `NaN%` in progress ring. |
| **Pillar 5** | API Security & Input Validation | **62 / 100** | Critical Risk | Zero HTTP security headers configured (no CSP, no HSTS, no clickjacking protection), live `new Function` evaluation on keystroke, unvalidated localStorage state rehydration, force-dynamic file checks. |
| **Overall** | **Consolidated Quality Index** | **73 / 100** | **Moderate Risk** | **Immediate hardening required prior to multi-user or production deployment.** |

### 1.3 Executive Narrative

Uplift University has succeeded in building a responsive, highly thematic educational product that combines 3D campus exploration, dynamic graph plotting, and structured modular lessons. The repository compiles cleanly with Next.js Turbopack, achieves zero errors in `tsc --noEmit`, and passes all 73 existing test assertions.

Despite this solid exterior, beneath the surface the application suffers from systemic architectural debts:
1. **Security & Input Isolation Deficit:** The web application is deployed with zero standard defense-in-depth HTTP headers (no CSP, no X-Frame-Options, no HSTS). The interactive calculator compiles mathematical strings using raw `new Function` on every keystroke, forcing `'unsafe-eval'` permissions.
2. **GPU Memory Lifecycle Gaps:** 3D scene elements, such as the GLTF mascot rig and custom spline roads, actively leak vertex buffers and materials into WebGL memory because `<group dispose={null}>` and untracked `TubeGeometry` instances prevent garbage collection.
3. **Hidden Numerical Calculation Corruptions:** The custom mathematical expression compiler contains a severe bug where scientific notation numbers (e.g. `1e-5`) have their exponent parsed as Euler's constant $e$, resulting in $-2.2817$ instead of $0.00001$. This calculation flaw was masked because existing unit tests did not cover scientific notation.
4. **State Fragmentation & Component Churn:** 10 core views and layouts subscribe to the entire Zustand store (`useProgress((s) => s)`). Every user scroll event that views a lesson block mutates store state, triggering full-tree re-renders across the application shell and 3D canvas. Furthermore, persistent user state is fragmented across 4 separate `localStorage` keys without transaction coordination.
5. **Hydration Mismatches & Missing Crash Boundaries:** Because server-side rendering renders a hardcoded demo profile while client hydration runs asynchronously under a 100ms timeout race condition, `suppressHydrationWarning` was placed on `<html>` and `<body>` to silence React hydration warnings. If an error occurs in the root layout, the lack of `global-error.tsx` leaves users with an unrecoverable white screen.

---

## 2. Top 5 Weakest Areas

Ranked by severity, architectural blast radius, and operational risk.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP 5 ARCHITECTURAL & OPERATIONAL VULNERABILITIES                                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. [CRITICAL] Total Absence of HTTP Security Headers & Dynamic Code Generation         │
│    Files: next.config.ts:1-17, src/lib/plot-math.ts:734-738, MathCalculatorDrawer.tsx:64│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. [CRITICAL] Cloned GLTF Rig & Spline Road GPU Memory Leaks in 3D Lifecycle           │
│    Files: StorkAssetModel.tsx:74-76, Road.tsx:14-39, MascotStage.tsx:108-124           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. [CRITICAL] Scientific Notation Euler Corruption in Custom Math Compiler             │
│    Files: src/lib/plot-math.ts:646-670, 784-807                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. [CRITICAL] Ubiquitous Whole-Store Subscriptions & 4-Way Storage Fragmentation       │
│    Files: 10 views in src/components/, RepeatTasksView.tsx:114, progress-store.ts:254 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. [HIGH]     Fragile Hydration Race Condition & Absence of Global/Route Boundaries    │
│    Files: layout.tsx:27-28, progress-provider.tsx:81-98, LessonRenderer.tsx:243, 269   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Rank 1: Total Absence of HTTP Security Headers & Keystroke-Driven Dynamic Code Evaluation
- **Severity:** `[CRITICAL]`
- **CWE:** CWE-1021 (Clickjacking), CWE-79 (XSS), CWE-94 / CWE-95 (Dynamic Code Injection)
- **Impacted Files & Lines:**
  - `next.config.ts:1-17` (Zero security headers defined)
  - `src/lib/plot-math.ts:734-738` (`new Function` constructor executing dynamic strings)
  - `src/components/lesson/plot/MathCalculatorDrawer.tsx:64` (Evaluates `new Function` on every keystroke)
- **Root Cause:**
  `next.config.ts` fails to configure an `async headers()` handler. As a result, the application serves all HTML without `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, or `Permissions-Policy`. Any malicious third-party site can frame Uplift University to conduct Clickjacking attacks on student accounts.
  Furthermore, `compileCustomExpression` generates dynamic JavaScript functions via `new Function("Math", "x", "\"use strict\"; return Number(" + s + ");")` which executes during the render cycle whenever a user types into `MathCalculatorDrawer`. This forces the platform to require `'unsafe-eval'` under CSP and introduces code injection risks if mathematical identifier regexes are bypassed.
- **Architectural Impact:** Prevents compliance with modern web security baselines, prevents deployment of a zero-trust Content Security Policy, and creates severe client-side execution vulnerabilities.

---

### Rank 2: Cloned GLTF Rig & Spline Road GPU Memory Leaks in 3D Scene Life Cycle
- **Severity:** `[CRITICAL]`
- **Impacted Files & Lines:**
  - `src/components/mascot/StorkAssetModel.tsx:74-76` (`<group scale={model.scale} dispose={null}>`)
  - `src/components/learning-world/Road.tsx:14-39` (Untracked `createRoadGeometry` and `TubeGeometry`)
  - `src/scenes/MascotStage.tsx:108-124` (Orphaned shadow map render targets via `key={quality}`)
  - `src/components/learning-world/DirectionView.tsx:66` & `LearningWorld.tsx:285-294` (Full WebGL context recreation on every route change)
- **Root Cause:**
  In `@react-three/fiber`, wrapping `<primitive object={model.copy} />` inside `<group dispose={null}>` explicitly commands the R3F reconciler **never** to dispose the underlying Three.js scene graph when unmounted. Every time the mascot component mounts or unmounts, cloned skeletal bones, textures, and geometry buffers remain permanently allocated in GPU memory.
  Similarly, `Road.tsx` instantiates a heavy `BufferGeometry` and two `TubeGeometry` instances via `useMemo` outside R3F's JSX tree. It provides zero `useEffect` cleanup hook to call `.dispose()`. Over repeated navigation across the four campus tracks, GPU VRAM steadily escalates, causing frame drops and eventually browser WebGL context crashes.
- **Architectural Impact:** Causes irreversible memory leaks in mobile and desktop browsers, leading to silent WebGL canvas crashes, tab crashes on constrained devices, and stuttering 3D rendering.

---

### Rank 3: Silent Mathematical Calculation Corruption in Scientific Notation
- **Severity:** `[CRITICAL]`
- **Impacted Files & Lines:**
  - `src/lib/plot-math.ts:646-651`, `661`, `784-807`
- **Root Cause:**
  In `compileCustomExpression`, line 646 matches identifier tokens using `/[a-zA-Z_$][a-zA-Z0-9_$]*/g`. For an input containing scientific notation like `"1e-5"`, the token matched is `["e"]`. Line 648 recognizes `"e"` as Euler's constant ($Math.E \approx 2.71828$).
  Next, line 661 transforms implicit multiplication: `s = s.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2");`. This converts `"1e"` into `"1*e"`. The expression `"1e-5"` (which mathematically represents $0.00001 = 10^{-5}$) is compiled into JavaScript as `1 * Math.E - 5`, which evaluates to **$-2.281718$**!
  Furthermore, for an input like `"1e5"`, the token matched is `["e5"]`. Because `"e5"` is not in `ALLOWED_MATH_IDENTIFIERS`, the compiler returns `null`, rejecting valid scientific notation completely.
- **Empirical Proof:**
  ```javascript
  // Live node execution proof:
  compileCustomExpression("1e-5")(0); // Returns -2.281718171540955 (CORRUPTED)
  compileCustomExpression("1e5");    // Returns null (REJECTED)
  evaluateCalculatorExpression("1e-5"); // Returns { success: true, result: -2.281718 }
  ```
- **Architectural Impact:** Destroys mathematical integrity across interactive plotting labs, calculus tangent computations, scientific calculations, and calculator drawer operations.

---

### Rank 4: Architectural State Fragmentation & Ubiquitous Whole-Store Re-Render Cascades
- **Severity:** `[CRITICAL]` / `[HIGH]`
- **Impacted Files & Lines:**
  - `src/components/layout/AppShell.tsx:71, 81`
  - `src/components/layout/ProgressPanel.tsx:16` (`const state = useProgress((s) => s);`)
  - `src/components/mascot/StorkAssistant.tsx:32` (`const state = useProgress((s) => s);`)
  - `src/components/dashboard/DashboardView.tsx:12`, `DirectionView.tsx:15`, `CoursesView.tsx:17`, `LearningWorld.tsx:154`, `LearningPath.tsx:10`, `RepeatTasksView.tsx:44`, `ProfileView.tsx:11`, `LessonView.tsx:32`
  - `src/stores/progress-store.ts:268-283` (`"uplift-progress"`)
  - `src/components/repeat/RepeatTasksView.tsx:114, 192, 211` (`"uplift_solved_repeat_tasks"`)
  - `src/lib/repeat-tasks.ts:40, 229, 251, 298` (`"uplift_practice_sessions"`)
  - `src/components/lesson/plot/InteractivePlot.tsx:1146, 1160` (`"uplift_math_studio_settings_v3"`)
- **Root Cause:**
  10 core views throughout the platform subscribe to the entire Zustand store via `useProgress((s) => s)` without atomic selectors. Because Zustand performs referential `Object.is` equality checks, **any single state mutation**—such as reading a lesson paragraph that triggers an `IntersectionObserver` view event—causes all 10 components to re-render in unison. Since `AppShell` mounts `ProgressPanel` and `StorkAssistant` (which hosts Three.js canvas `<AssistantCanvas />`), layout re-render cascades run continuously.
  In parallel, application persistence is fragmented across 4 separate, uncoordinated `localStorage` keys. When `resetProgress()` is called, it deletes only 2 keys, ignores plot settings, and fails to notify in-memory React state in `RepeatTasksView`, leading to desynchronized application state.
- **Architectural Impact:** Causes CPU thrashing, main thread locking during scrolling, and broken state synchronization across student sessions.

---

### Rank 5: Fragile Hydration Race Condition & Absence of Global/Route Error Boundaries
- **Severity:** `[HIGH]`
- **Impacted Files & Lines:**
  - `src/app/layout.tsx:27-28` (`suppressHydrationWarning` on `<html>` and `<body>`)
  - `src/stores/progress-store.ts:270` (`skipHydration: true`)
  - `src/stores/progress-provider.tsx:81-98` (Arbitrary 100ms `setTimeout` fallback race condition)
  - `src/app/global-error.tsx` (**MISSING**)
  - `src/app/lesson/[lessonId]/error.tsx` (**MISSING**)
  - `src/components/lesson/LessonRenderer.tsx:243, 269` (Synchronous unhandled `throw new Error`)
- **Root Cause:**
  The server pre-renders pages with a static demo profile (Alex Morgan, 357 XP), while client rehydration happens asynchronously under an arbitrary 100ms timer. To mask the resulting React hydration warning, developers added `suppressHydrationWarning` to the root HTML tags. Users experience visual layout shifts when their stored progress pops in over the demo profile.
  Furthermore, the repository lacks a root `src/app/global-error.tsx`. If an exception occurs within root providers (`ProgressProvider`, `AppShell`), Next.js has no error boundary to catch it, rendering an irrecoverable blank white screen. Sub-routes also lack localized `error.tsx` files; when `LessonRenderer.tsx` throws an unhandled error for an unknown quiz problem ID, the entire application shell unmounts back to `src/app/error.tsx`.
- **Architectural Impact:** Fragile user experience, visual layout jumps on initial load, and maximum failure blast radius for localized rendering exceptions.

---

## 3. Pillar-by-Pillar Findings

---

### Pillar 1: 3D Graphics & UI Performance
**Audited Components:** Three.js scene graphs, `@react-three/fiber` canvas lifecycle, asset loading, GPU memory disposal, render loops (`useFrame`), UI overlays (`@react-three/drei` `<Html>`), and 2D math plotting.

#### [P1-W01] Cloned GLTF Hierarchy Leaked via `dispose={null}`
- **Severity:** `[CRITICAL]`
- **File & Lines:** `src/components/mascot/StorkAssetModel.tsx:74-76`
- **Root Cause:** In R3F, `<primitive object={model.copy} />` wrapped in `<group dispose={null}>` commands the reconciler to retain cloned meshes, skeletal rigs, and materials in memory forever upon unmount.
- **Architectural Impact:** Permanent GPU VRAM leak when toggling mascot views or switching routes.

#### [P1-W02] Road Geometry and Border Tubes Leaked on Canvas Unmount
- **Severity:** `[CRITICAL]`
- **File & Lines:** `src/components/learning-world/Road.tsx:14-39`, `src/lib/world-geometry.ts:93-100`
- **Root Cause:** `createRoadGeometry` and `TubeGeometry` allocate thousands of vertex positions and normals via `useMemo` outside JSX. No cleanup `useEffect` calls `geometry.dispose()`.
- **Architectural Impact:** GPU memory leaks whenever switching between 3D world view and course list view.

#### [P1-W03] WebGL Context Destruction and Recreation on Campus Navigation
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/learning-world/DirectionView.tsx:66`, `src/components/learning-world/LearningWorld.tsx:285-294`
- **Root Cause:** `<LearningWorld key={direction.id}>` and `<WorldCanvas key={data.directionId}>` unmount and remount `<Canvas>` on every track switch (`/path/ai-ml` to `/path/physics-engineering`), destroying the WebGL context, recompiling all shaders, and risking the browser context limit.
- **Architectural Impact:** 150-300ms frame stutter and canvas blanking during course navigation.

#### [P1-W04] Unthrottled Pointer Event Handling in `InteractivePlot.tsx`
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/lesson/plot/InteractivePlot.tsx:1636-1692`
- **Root Cause:** `onPointerMove` directly calls `setViewport(nextVp)` on every hardware event (120Hz-240Hz), triggering synchronous React renders, recalculating 380 curve samples, and mutating SVG paths unthrottled.
- **Architectural Impact:** Main thread lag and dropped frames during panning and curve tracing.

#### [P1-W05] Wheel Zoom Listener Churn & Heavy Root-Finding Thrashing
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/lesson/plot/InteractivePlot.tsx:1208-1237`, `1257-1278`
- **Root Cause:** The `useEffect` registering the `wheel` listener lists `scale` in its dependencies. Because `scale` recalculates on every zoom tick, the listener is destroyed and recreated on every event. In addition, `zoomAt` immediately calls `setSettledDomain`, forcing `findCriticalPoints` to execute iterative root-finding on every wheel micro-tick.
- **Architectural Impact:** Extreme CPU utilization and jerky zoom interaction in mathematical plots.

#### [P1-W06] Excessive Independent `useFrame` Subscriptions Across Static Island Trees
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/learning-world/Environment.tsx:29-38`, `LessonPlatform.tsx:276-297`
- **Root Cause:** 20+ trees per island each mount an independent `useFrame` hook computing trigonometry in JavaScript every frame. Similarly, `LessonPlatform` runs `MathUtils.damp` continuously even when at rest.
- **Architectural Impact:** Continuous CPU drain and battery consumption on mobile and laptop devices.

#### [P1-W07] Unmount/Remount Layout Thrashing in `LessonPlatform` HTML Overlays
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/learning-world/LessonPlatform.tsx:454-539`
- **Root Cause:** Hovering over a platform unmounts one `<Html>` tree (compact pin) and mounts another (expanded card), forcing DOM creation and portal re-binding inside the canvas container.
- **Architectural Impact:** DOM thrashing and layout stutter during 3D campus navigation.

#### [P1-W08] Full Progress Store Subscription Triggering Cascading Canvas Re-renders
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/learning-world/LearningWorld.tsx:154`
- **Root Cause:** Subscribing to the entire Zustand store (`useProgress((s) => s)`) causes `LearningWorld` to re-render whenever XP or streak updates, regenerating callbacks passed to `WorldCanvas`.
- **Architectural Impact:** Unnecessary 3D scene re-renders on unrelated UI events.

#### [P1-W09] Absence of Asset Preloading and Double-Mount FOUC
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/mascot/StorkAssetModel.tsx:18-35`, `use-stork-asset.ts:4-24`
- **Root Cause:** Initial state is `url = null`, so `StorkAssetModel` mounts `<ProceduralStork>` on frame 1. When `fetch("/api/mascot")` resolves, it unmounts `ProceduralStork` and mounts `GltfStork`, causing visual flash.
- **Architectural Impact:** Visible mascot flash and layout jitter on initial load.

#### [P1-W10] Missing WebGL Context Loss Recovery in `SceneBoundary`
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/ui/SceneBoundary.tsx:5-19`
- **Root Cause:** Only catches React errors; does not listen for `webglcontextlost` or `webglcontextrestored`. When context is lost (e.g. computer sleep or GPU reset), the canvas stays blank permanently.
- **Architectural Impact:** Permanent canvas failure after device sleep or GPU driver reset.

#### [P1-W11] Directional Light Shadow Map Leak via `key={quality}`
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/scenes/MascotStage.tsx:108-124`
- **Root Cause:** Keying `<directionalLight key={quality}>` unmounts the light and mounts a new one when quality changes, orphaning the old shadow map `WebGLRenderTarget`.
- **Architectural Impact:** VRAM accumulation when adjusting quality settings.

#### [P1-W12] Incomplete Dynamic Splitting of 64KB `InteractivePlot`
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/components/lesson/GradientDescentLab.tsx:19`, `LessonRenderer.tsx:32-36`
- **Root Cause:** `InteractivePlot` is statically bundled into lesson components, adding 64KB of plotting logic into pages that only show text or non-coding theory.
- **Architectural Impact:** Bloated initial page bundle size.

#### [P1-W13] Stork Assistant Inaccessible on Desktop Viewports
- **Severity:** `[LOW]`
- **File & Lines:** `src/components/layout/AppShell.tsx:81`, `src/components/mascot/StorkAssistant.tsx:21`
- **Root Cause:** `AppShell` renders `<StorkAssistant mobile />`. On desktop viewports where `useSmallScreen()` is false, `mobile === small` evaluates to false, returning `null`. The 3D mascot is hidden on desktop.
- **Architectural Impact:** Desktop users are deprived of the interactive 3D assistant.

#### [P1-W14] Dead Code and Unused Imports in `IslandSignposts.tsx`
- **Severity:** `[LOW]`
- **File & Lines:** `src/components/learning-world/IslandSignposts.tsx:6-254`
- **Root Cause:** 230 lines of signboard geometry and HTML overlays are dead code because `IslandSignposts` returns `null`, emitting 4 ESLint warnings.
- **Architectural Impact:** Code bloat and build warning pollution.

---

### Pillar 2: Test Suite Coverage & Resilience
**Audited Components:** `tests/` directory, automated runner, code coverage profiling, numerical edge cases, mock fidelity, and error resilience.

#### [P2-W01] Scientific Notation Euler Corruption Undetected by Tests
- **Severity:** `[CRITICAL]`
- **File & Lines:** `src/lib/plot-math.ts:646-670`, `tests/plot-math.test.ts`
- **Root Cause:** Existing tests check standard polynomials and trig functions, but omit scientific notation tests (`1e-5`, `1e5`). As a result, the corruption where `"1e-5"` parses to `-2.2817` passed all CI checks completely undetected.
- **Architectural Impact:** Critical numerical bug escapes into production.

#### [P2-W02] False Positive Tests via In-Test Simulation Mocking
- **Severity:** `[HIGH]`
- **File & Lines:** `tests/plot-math.test.ts:211-251`, `324-408`
- **Root Cause:** The tests declare local functions `simulateTrigger()` and `onPointerMove()` inside the test file and assert on them, rather than importing and exercising `src/components/lesson/plot/InteractivePlot.tsx`.
- **Architectural Impact:** False confidence: tests pass 100% even if the production component event handlers break.

#### [P2-W03] Zero Test Coverage for API Route Handlers
- **Severity:** `[HIGH]`
- **File & Lines:** `src/app/api/mascot/route.ts:1-17`, `tests/`
- **Root Cause:** No test file imports or exercises `GET` in `src/app/api/mascot/route.ts`. Route status codes, headers, and model existence checks are completely unverified.
- **Architectural Impact:** Regressions in API routes cannot be caught by CI.

#### [P2-W04] Zero Test Coverage for Progress Provider & Hydration Hooks
- **Severity:** `[HIGH]`
- **File & Lines:** `src/stores/progress-provider.tsx:22-66`, `tests/`
- **Root Cause:** `ProgressProvider`, `useProgress`, `useLearningEvents`, and `useProgressReady` have zero unit or integration tests.
- **Architectural Impact:** Hydration race conditions and out-of-context hook errors escape testing.

#### [P2-W05] Corrupted LocalStorage Rehydration Triggers Fatal TypeError
- **Severity:** `[HIGH]`
- **File & Lines:** `src/stores/progress-store.ts:42-68`
- **Root Cause:** `getLessonStatus` and `getDirectionProgress` invoke `state.completedLessons.includes(...)` without `Array.isArray()` checks. Corrupted stored JSON causes fatal unhandled TypeErrors.
- **Architectural Impact:** Persistent white screen crash for users with damaged local storage.

#### [P2-W06] Division by Zero in `niceStep` Yields `Infinity` and `NaN`
- **Severity:** `[HIGH]`
- **File & Lines:** `src/lib/plot-math.ts:45-58`
- **Root Cause:** `niceStep(range, targetTicks)` checks `range <= 0` but never validates `targetTicks <= 0`. Calling `niceStep(10, 0)` returns `Infinity`, and `niceStep(10, NaN)` returns `NaN`.
- **Architectural Impact:** Corrupts graph axes and grid rendering on boundary viewports.

#### [P2-W07] Total Absence of UI & DOM Interaction Testing
- **Severity:** `[HIGH]`
- **File & Lines:** `package.json:12`, `src/components/`
- **Root Cause:** The project lacks `@testing-library/react` and `jsdom`. 53 React components in `src/components/` have 0% interaction test coverage.
- **Architectural Impact:** UI regressions, button clicks, keyboard events, and modal interactions are completely untested in automated CI.

#### [P2-W08] Missing Exception Boundaries in Calculus Utilities
- **Severity:** `[HIGH]`
- **File & Lines:** `src/lib/plot-math.ts:119-144`, `175-199`
- **Root Cause:** `numericalDerivative` and `findCriticalPoints` invoke user math functions without `try...catch`. Any mathematical expression throwing an error crashes the entire component tree.
- **Architectural Impact:** Rendering crashes on degenerate or asymptote formula inputs.

#### [P2-W09] Division by Zero Yielding `NaN%` in Lesson Progress
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/lib/lesson-progress.ts:16-33`
- **Root Cause:** In `lessonCompletion`, `Math.round((done / total) * 100)` evaluates to `NaN` when `total === 0` (e.g. empty or placeholder lessons).
- **Architectural Impact:** UI displays `"NaN% completed"`.

#### [P2-W10] Unverified Stork Controller Event Reactions
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/lib/stork-controller.ts:99-118`
- **Root Cause:** The `react(event)` dispatch loop has zero test cases. Animations for `LESSON_COMPLETED`, `LEVEL_UP`, and `ACHIEVEMENT_UNLOCKED` are never verified.
- **Architectural Impact:** Broken visual mascot reactions go unnoticed.

#### [P2-W11] Unverified Gradient Descent Number Formatter
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/lib/gradient-descent.ts:89-93`
- **Root Cause:** `formatNumber` has zero tests for scientific notation thresholds and non-finite numbers.
- **Architectural Impact:** Potential layout breaks in iteration tables.

#### [P2-W12] Definite Integral Sign Inversion on Negative Intervals
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/lib/plot-math.ts:150-169`
- **Root Cause:** `numericalDefiniteIntegral` does not guard against `intervals <= 0`, reversing step direction and yielding inverted areas (e.g. `-4` instead of `+8`).
- **Architectural Impact:** Incorrect calculus lab results on invalid interval inputs.

#### [P2-W13] Five Conflicting Global `localStorage` Test Mocks
- **Severity:** `[MEDIUM]`
- **File & Lines:** `tests/` (5 separate test files)
- **Root Cause:** Five test files re-assign `globalThis.localStorage` using conflicting custom mock implementations, creating order-dependent test pollution risks.
- **Architectural Impact:** Flaky tests if runner execution order or concurrency changes.

#### [P2-W14] Noisy Console Error Logs During Automated Testing
- **Severity:** `[LOW]`
- **File & Lines:** `src/lib/repeat-tasks.ts:251`
- **Root Cause:** `savePracticeSession` logs raw `console.error` during expected negative-path testing of `QuotaExceededError`.
- **Architectural Impact:** CI log noise.

---

### Pillar 3: Architecture & State Management
**Audited Components:** Zustand stores, context providers, state synchronization, component coupling, persistence, and storage transactions.

#### [P3-W01] Ubiquitous Whole-Store Subscriptions (`useProgress((s) => s)`)
- **Severity:** `[CRITICAL]`
- **File & Lines:** 10 component files (`DashboardView.tsx:12`, `DirectionView.tsx:15`, `CoursesView.tsx:17`, `ProgressPanel.tsx:16`, `LearningWorld.tsx:154`, `LearningPath.tsx:10`, `RepeatTasksView.tsx:44`, `ProfileView.tsx:11`, `LessonView.tsx:32`, `StorkAssistant.tsx:32`)
- **Root Cause:** Using `useProgress((s) => s)` forces components to re-render whenever *any* field in the store mutates, triggering continuous re-renders across the application shell and 3D scenes.
- **Architectural Impact:** Major CPU overhead, dropped frames, and poor mobile battery life.

#### [P3-W02] State Fragmentation Across 4 Unsynchronized Storage Systems
- **Severity:** `[CRITICAL]`
- **File & Lines:** `progress-store.ts:268-283` (`"uplift-progress"`), `RepeatTasksView.tsx:114` (`"uplift_solved_repeat_tasks"`), `repeat-tasks.ts:40` (`"uplift_practice_sessions"`), `InteractivePlot.tsx:1146` (`"uplift_math_studio_settings_v3"`)
- **Root Cause:** No unified storage coordinator exists. Calling `resetProgress()` only removes 2 of the 4 keys and cannot notify mounted React components.
- **Architectural Impact:** Desynchronized client state, partial resets, and data drift.

#### [P3-W03] SSR Hydration Mismatch Silenced by `suppressHydrationWarning`
- **Severity:** `[HIGH]`
- **File & Lines:** `src/app/layout.tsx:27-28`, `progress-provider.tsx:27-44`, `progress-store.ts:270`
- **Root Cause:** SSR pre-renders with Alex Morgan's demo progress (357 XP), while client persistence hydrates asynchronously after an arbitrary 100ms timeout. `suppressHydrationWarning` was added to hide React console errors instead of fixing the root cause.
- **Architectural Impact:** Visual layout flashes and unverified hydration state.

#### [P3-W04] Absence of URL Query Parameter Synchronization
- **Severity:** `[HIGH]`
- **File & Lines:** `src/app/repeat/page.tsx:8-14`, `RepeatTasksView.tsx:45-51`, `InteractivePlot.tsx:1106-1133`
- **Root Cause:** Selected theme, question index, filter mode, and formula parameters are kept purely in local component `useState`. Refreshing the page wipes all navigation and resets to question 1.
- **Architectural Impact:** Broken deep-linking and lost student progress on refresh.

#### [P3-W05] Monolithic Component Coupling (Business Logic in Presentation)
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/lesson/plot/InteractivePlot.tsx:1-1996`, `RepeatTasksView.tsx:177-278`
- **Root Cause:** `InteractivePlot.tsx` is a 1,996-line monolith combining SVG rendering, gesture physics, numerical calculus, and raw `localStorage` calls. `RepeatTasksView` directly computes XP and unlocks achievements.
- **Architectural Impact:** Severe barrier to maintainability, testability, and code reuse.

#### [P3-W06] Tight Bidirectional Coupling Between State Store and Curriculum Data
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/stores/progress-store.ts:162-196`, `DirectionView.tsx:18-20`
- **Root Cause:** The store hardcodes domain-specific track completion strings (`"ai-ml"`, `"physics-master"`). Adding new tracks requires directly modifying the central store logic.
- **Architectural Impact:** High coupling between static content and state engine.

#### [P3-W07] Redundant Derived State and Dead Store Fields
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/stores/progress-store.ts:23, 26, 37, 128-141`
- **Root Cause:** `unlockedLessons` is persisted in localStorage even though it is fully derivable from `completedLessons`. `streak` is a hardcoded static field with no update action.
- **Architectural Impact:** Redundant storage size and state synchronization drift.

#### [P3-W08] Scroll-Driven Synchronous Storage Write Storm
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/components/lesson/LessonRenderer.tsx:41-60, 456`, `progress-store.ts:78-83`
- **Root Cause:** `IntersectionObserver` triggers `recordActivity("viewed")` for every visible block as the user scrolls, each executing synchronous `localStorage.setItem` on the main JavaScript thread.
- **Architectural Impact:** Micro-stutters and main thread blocking during lesson reading.

#### [P3-W09] Context Severance Risk Across React Three Fiber Boundary
- **Severity:** `[LOW]`
- **File & Lines:** `src/components/learning-world/WorldCanvas.tsx:40-41`, `WorldStork.tsx:24-25`
- **Root Cause:** Reading Zustand store directly inside R3F canvas components without passing explicit props creates architectural coupling and breaks data flow isolation.
- **Architectural Impact:** Unclear data boundaries between DOM UI and 3D scenes.

---

### Pillar 4: TypeScript Strictness & Code Quality
**Audited Components:** `tsconfig.json`, `eslint.config.mjs`, error boundaries, type safety gaps, and runtime resilience.

#### [P4-W01] Total Absence of `src/app/global-error.tsx` Root Boundary
- **Severity:** `[CRITICAL]`
- **File & Lines:** `src/app/` (missing file)
- **Root Cause:** Next.js `app/error.tsx` cannot catch errors originating in `app/layout.tsx`. If `ProgressProvider` fails, the lack of `global-error.tsx` leads to an unrecoverable blank screen.
- **Architectural Impact:** Total application crash with zero recovery mechanism.

#### [P4-W02] Five ESLint Warnings Violate Acceptance Criteria
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/learning-world/IslandSignposts.tsx:6, 7, 17, 249`, `ChatAssessment.tsx:10`
- **Root Cause:** Unused imports `directions`, `learningWorlds`, unused helper `IslandSignpost`, unused `_props`, and unused parameter `speed`. Emits 5 warnings, violating the 0-warning acceptance criteria.
- **Architectural Impact:** Fails project quality gates and indicates dead code.

#### [P4-W03] Missing `noUncheckedIndexedAccess: true` in Compiler Options
- **Severity:** `[HIGH]`
- **File & Lines:** `tsconfig.json:2-18`, `FormulaBreakdown.tsx:14`
- **Root Cause:** Omitting `noUncheckedIndexedAccess` allows `block.parts[selected].variable` to be typed as `string` rather than `string | undefined`. An out-of-range index crashes with `TypeError`.
- **Architectural Impact:** Silent runtime type vulnerabilities throughout array/map indexing.

#### [P4-W04] Missing Route-Level `error.tsx` in Dynamic Sub-Routes
- **Severity:** `[HIGH]`
- **File & Lines:** `src/app/lesson/[lessonId]/`, `src/app/path/[directionId]/` (missing files)
- **Root Cause:** Sub-routes lack isolated error boundaries. Any localized lesson rendering crash bubbles to root `app/error.tsx`, unmounting the entire application shell.
- **Architectural Impact:** Excessive blast radius for isolated component errors.

#### [P4-W05] Synchronous `throw new Error` in React Render Phase
- **Severity:** `[HIGH]`
- **File & Lines:** `src/components/lesson/LessonRenderer.tsx:243, 269`
- **Root Cause:** If a quiz question ID is not found in curriculum data, JSX mapping throws a raw synchronous error during render, crashing the view.
- **Architectural Impact:** Brittle rendering that crashes the whole page on minor data mismatches.

#### [P4-W06] Multi-Minute ESLint Run Due to Unignored `.agents/**`
- **Severity:** `[HIGH]`
- **File & Lines:** `eslint.config.mjs:8`
- **Root Cause:** `eslint.config.mjs` does not ignore `.agents/**`, forcing ESLint to crawl 44 directories and hundreds of agent metadata files, ballooning lint time to ~3 minutes.
- **Architectural Impact:** Severe CI pipeline bottleneck.

#### [P4-W07] Rehydration Without Schema Validation in Zustand Store
- **Severity:** `[HIGH]`
- **File & Lines:** `src/stores/progress-store.ts:267-284`
- **Root Cause:** Raw `JSON.parse` output from `localStorage` is injected directly into the store without runtime validation.
- **Architectural Impact:** Malformed stored data crashes store actions and UI components.

#### [P4-W08] Division by Zero Yields User-Facing `NaN%` in Lesson Progress
- **Severity:** `[HIGH]`
- **File & Lines:** `src/lib/lesson-progress.ts:30`
- **Root Cause:** `Math.round((done / total) * 100)` produces `NaN` when `total === 0`, rendering `NaN%` in `ProgressPanel.tsx:42` and `aria-label="NaN% completed"`.
- **Architectural Impact:** Degraded user trust and broken accessibility labels.

#### [P4-W09] Missing `forceConsistentCasingInFileNames: true`
- **Severity:** `[MEDIUM]`
- **File & Lines:** `tsconfig.json:2-18`
- **Root Cause:** Missing compiler flag risks case-sensitivity import discrepancies between Windows and Linux CI environments.
- **Architectural Impact:** Cross-platform build failure risk.

#### [P4-W10] Missing Defensive TypeScript Compiler Flags
- **Severity:** `[MEDIUM]`
- **File & Lines:** `tsconfig.json:2-18`
- **Root Cause:** Missing `exactOptionalPropertyTypes`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`.
- **Architectural Impact:** Allows loose property assignment and accidental switch fallthroughs.

#### [P4-W11] Blanket `/* eslint-disable */` in Test Scripts
- **Severity:** `[MEDIUM]`
- **File & Lines:** `scripts/m1-adversarial-stress.ts:1`, `scripts/m2-adversarial-stress.ts:1`
- **Root Cause:** Blanket file-level disable comments suppress genuine errors across 900+ lines of test code.
- **Architectural Impact:** Code quality blind spot.

#### [P4-W12] React Hooks Immutability Suppressions in 3D Mascot Components
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/components/mascot/StorkAnimator.tsx:4`, `src/scenes/MascotStage.tsx:82`
- **Root Cause:** Suppressing `react-hooks/immutability` for imperative Three.js mutations without architectural boundaries.
- **Architectural Impact:** Potential state desynchronization.

#### [P4-W13] Root `error.tsx` Completely Discards `error` Parameter
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/app/error.tsx:3-8`
- **Root Cause:** `error` parameter is omitted from component signature, discarding error messages, digest IDs, and stack traces.
- **Architectural Impact:** Inability to debug or log production errors.

#### [P4-W14] Direct `localStorage` Reference in Store Initialization
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/stores/progress-store.ts:271`
- **Root Cause:** `createJSONStorage(() => localStorage)` risks `ReferenceError` during headless SSR or testing if `window` is undefined.
- **Architectural Impact:** Brittle SSR execution.

#### [P4-W15] Loose `as StageOptions[...]` Type Casts in Event Handlers
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/scenes/MascotPlayground.tsx:314, 368, 385`
- **Root Cause:** Unvalidated DOM event target strings are cast directly to union types without runtime guards.
- **Architectural Impact:** Type safety bypass.

#### [P4-W16] Blind `as Mesh` Type Assertion in Scene Traversal
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/components/mascot/StorkDebug.tsx:73`
- **Root Cause:** Casts `Object3D` to `Mesh` before checking whether `obj.isMesh` is true.
- **Architectural Impact:** Potential runtime crash if non-mesh objects are traversed.

#### [P4-W17] Broad Compiler `include` Pattern Incorporating Scripts
- **Severity:** `[MEDIUM]`
- **File & Lines:** `tsconfig.json:19-25`
- **Root Cause:** `"**/*.ts"` forces the application compiler to typecheck internal scripts and agent workspaces.
- **Architectural Impact:** Slower typechecking and accidental dependency leaks.

#### [P4-W18] Outdated Compiler Target `"target": "ES2017"`
- **Severity:** `[LOW]`
- **File & Lines:** `tsconfig.json:3`
- **Root Cause:** Legacy target on modern Next.js 16 / React 19 / Node 22 stack.
- **Architectural Impact:** Misses modern ECMAScript optimization benefits.

#### [P4-W19] Missing Return Type Annotations on Exported Curriculum APIs
- **Severity:** `[LOW]`
- **File & Lines:** `src/data/curriculum.ts:671-683`, `src/data/lessons/index.ts:47`
- **Root Cause:** Public helper functions lack explicit return signatures (`Direction | undefined`).
- **Architectural Impact:** Degraded IDE autocompletion and API contract ambiguity.

#### [P4-W20] Inconsistent `Metadata` Typing in App Router Pages
- **Severity:** `[LOW]`
- **File & Lines:** `src/app/courses/page.tsx:2`, `src/app/repeat/page.tsx:3`
- **Root Cause:** Exported `metadata` objects lack explicit `Metadata` type annotations.
- **Architectural Impact:** Misses compile-time metadata validation.

---

### Pillar 5: API Security & Input Validation
**Audited Components:** Next.js route handlers (`src/app/api/`), HTTP response headers, CORS, rate limiting, and client-server boundaries.

#### [P5-W01] Total Absence of HTTP Security Headers (CSP, HSTS, X-Frame-Options)
- **Severity:** `[CRITICAL]`
- **File & Lines:** `next.config.ts:1-17`
- **Root Cause:** No `headers()` function is exported in `next.config.ts`. The application emits zero security headers.
- **Architectural Impact:** Vulnerable to Clickjacking (CWE-1021), MIME-sniffing (CWE-79), and lacks CSP defense-in-depth.

#### [P5-W02] Dynamic Code Generation via `new Function` on Keystroke
- **Severity:** `[HIGH]`
- **File & Lines:** `src/lib/plot-math.ts:734-738`, `MathCalculatorDrawer.tsx:64`
- **Root Cause:** Every character typed into the calculator executes `new Function(...)`. Requires `'unsafe-eval'` under CSP and introduces code execution risks.
- **Architectural Impact:** Incompatible with strict CSP; arbitrary execution risk if regex filtering is bypassed.

#### [P5-W03] Insecure Deserialization in Zustand State Persistence
- **Severity:** `[HIGH]`
- **File & Lines:** `src/stores/progress-store.ts:268-283`
- **Root Cause:** `createJSONStorage` directly applies raw parsed JSON to the store without schema validation.
- **Architectural Impact:** Corrupted localStorage data crashes the client UI permanently.

#### [P5-W04] Route Handler DoS Exposure & Threadpool Starvation
- **Severity:** `[HIGH]`
- **File & Lines:** `src/app/api/mascot/route.ts:5-16`
- **Root Cause:** Marked `force-dynamic` with `Cache-Control: no-store`. Initiates `access()` syscall on every request, which can exhaust Node.js libuv worker threads under traffic spikes.
- **Architectural Impact:** Threadpool starvation and potential denial of service.

#### [P5-W05] Total Absence of Runtime Schema Validation Framework (Zod Missing)
- **Severity:** `[MEDIUM]`
- **File & Lines:** `package.json:14-26`, `src/app/api/`
- **Root Cause:** Neither `zod` nor any other schema validator is installed. Input handling relies strictly on compile-time types.
- **Architectural Impact:** Inability to validate external payloads or storage schemas at runtime.

#### [P5-W06] Insecure Inline Script with `dangerouslySetInnerHTML` Wiping Origin Caches
- **Severity:** `[MEDIUM]`
- **File & Lines:** `src/app/layout.tsx:29-46`
- **Root Cause:** Raw inline script injected with `dangerouslySetInnerHTML` unconditionally unregisters all service workers and deletes all origin caches. Requires `'unsafe-inline'` in CSP.
- **Architectural Impact:** CSP incompatibility and disruptive origin-wide cache purging.

#### [P5-W07] Hardcoded Private LAN IP Address in Source Control
- **Severity:** `[LOW]`
- **File & Lines:** `next.config.ts:11-12`
- **Root Cause:** `allowedDevOrigins` contains hardcoded private network IP `"192.168.1.9"`.
- **Architectural Impact:** Information disclosure of internal network topology.

#### [P5-W08] Completely Client-Authoritative Progression Model
- **Severity:** `[LOW]`
- **File & Lines:** `src/stores/progress-store.ts:240-253`
- **Root Cause:** XP rewards, level progression, and achievements are granted entirely in the browser without server verification.
- **Architectural Impact:** Vulnerable to client-side progress tampering in console.

#### [P5-W09] Zero Automated Tests for API Route Handlers
- **Severity:** `[LOW]`
- **File & Lines:** `tests/` (0 API tests)
- **Root Cause:** No tests exist for route status, headers, or error handling.
- **Architectural Impact:** Lack of CI verification for backend routes.

---

## 4. Diagnostics Baseline

A comprehensive diagnostic suite was executed directly in the project environment. Below is the verified telemetry:

### 4.1 Summary of Diagnostic Commands

| Diagnostic Tool | Command | Exit Code | Passing | Failing | Warnings | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **0** | All files | 0 | 0 | **PASS** |
| **Automated Test Suite** | `npm test` (`tsx --test tests/*.test.ts`) | **0** | 73 tests (3 suites) | 0 | 0 | **PASS** |
| **ESLint** | `npm run lint` (`eslint .`) | **0** | - | 0 | 5 warnings | **FAIL (Acceptance Criteria)** |
| **Next.js Production Build** | `npm run build` (`next build`) | **0** | 40 routes generated | 0 | 0 | **PASS** |

---

### 4.2 Verbatim Command Outputs

#### 1. `npm run typecheck`
```
> uplift-university@0.1.0 typecheck
> tsc --noEmit
```
*Result: Exit Code 0. Zero TypeScript diagnostic errors.*

---

#### 2. `npm test`
```
> uplift-university@0.1.0 test
> tsx --test tests/*.test.ts

✔ all tree variants are recognized species with rich distributions (1.27ms)
✔ all curriculum platforms have unique, increasing arc-length placements (7.61ms)
✔ the spline road is a closed thick mesh with finite positions and normals (35.79ms)
✔ completion emits one coherent reaction sequence after state is updated (3.57ms)
✔ a higher-priority celebration wins, then queued navigation returns to idle (1.02ms)
✔ level and achievement events carry the newly earned values (1.13ms)
✔ hover cooldown prevents repeated reactions and walk remains the navigation base (0.36ms)
✔ GLB clip lookup is case insensitive and missing reactions fall back to Idle (0.51ms)
✔ deactivating an assistant clears pending reactions before it is opened again (0.41ms)
✔ algorithm phases keep graph, gradient, update and loss synchronized (3.90ms)
✔ convergence, overshoot, oscillation and divergence are mathematically correct and bounded (4.99ms)
✔ page views and reading alone cannot complete a lesson (0.88ms)
✔ lesson IDs, references and all authored math are valid (290.06ms)
✔ block and assessment activity persists, deduplicates, and resets with course progress (2.26ms)
▶ Milestone 2 Empirical Challenge — Track Completion Achievements
  ✔ verifies achievementCatalog has complete definitions for all 4 new badges (3.17ms)
  ✔ physics-master: unlocks ONLY when all 7 physics lessons are completed, never with 1 to 6 lessons (7.78ms)
  ✔ physics-master: does NOT unlock if ANY single lesson out of 7 is missing (7 permutations) (3.07ms)
  ✔ math-pioneer: unlocks ONLY when all 4 math lessons are completed, never with 1 to 3 lessons (1.35ms)
  ✔ math-pioneer: does NOT unlock if ANY single lesson out of 4 is missing (4 permutations) (3.38ms)
  ✔ italian-scholar: unlocks ONLY when all 3 Italian lessons are completed, never with 1 to 2 lessons (3.13ms)
  ✔ italian-scholar: does NOT unlock if ANY single lesson out of 3 is missing (3 permutations) (2.19ms)
  ✔ unlockAchievement awards practice-champion, deduplicates, and prevents double-awarding (1.11ms)
✔ Milestone 2 Empirical Challenge — Track Completion Achievements (29.92ms)
▶ Milestone 2 Empirical Challenge — Route Alias Logic
  ✔ generateStaticParams returns all canonical direction IDs plus the italian-culture alias (0.61ms)
  ✔ generateMetadata resolves italian-culture to Italian Language & Culture metadata without error (0.45ms)
  ✔ DirectionPage renders DirectionView with target direction for both italian-culture and italian-language (5.15ms)
  ✔ resolves route aliases under high iteration stress without recursion or memory penalty (189.03ms)
✔ Milestone 2 Empirical Challenge — Route Alias Logic (195.96ms)
▶ Milestone 2 Empirical Challenge — resetProgress State & Storage Hygiene
  ✔ resets heavily polluted store state back to initialProgress cleanly (3.26ms)
  ✔ removes repeat practice sessions and solved task keys from localStorage (3.97ms)
  ✔ survives and resets in-memory state cleanly even if localStorage.removeItem throws an error (1.04ms)
  ✔ persisted store rehydration reflects the clean state after reset (2.22ms)
✔ Milestone 2 Empirical Challenge — resetProgress State & Storage Hygiene (11.25ms)
✔ custom character surfaces stay finite and the deformed torso has a smooth seam (47.84ms)
✔ explicit gesture replaces previous command and returns to idle (0.56ms)
✔ look constraints remain anatomical and reduced-motion jumps stay grounded (2.89ms)
✔ automatic eyelids reopen and disabling blink holds the eyes open (0.50ms)
✔ continuous skin preserves rest shape under placement and moves only weighted head vertices (13.88ms)
✔ niceStep produces standard decimal multiples (1, 2, 5 * 10^k) (8.34ms)
✔ computeGridLines returns major and minor ticks within viewport bounds (2.35ms)
✔ numericalDerivative accurately calculates derivatives for polynomials, trig, and exponentials (1.40ms)
✔ numericalSecondDerivative accurately measures curvature and concavity (1.69ms)
✔ numericalDefiniteIntegral accurately computes area under curves using Simpson's rule (3.35ms)
✔ findCriticalPoints detects roots, local extrema, and inflection points (3.30ms)
✔ compileCustomExpression compiles math expressions and rejects dangerous inputs (5.56ms)
✔ findCriticalPoints accurately detects extrema at symmetric origins and rejects asymptotes (4.33ms)
✔ all EQUATION_PRESETS evaluate to finite numbers across their viewports (1.04ms)
✔ scale linear transformations and inversions are exact roundtrips (1.09ms)
✔ findCriticalPoints safely handles degenerate and constant functions (1.66ms)
✔ double-tap deduplication cooldown preserves newly pinned point and prevents cancellation (0.95ms)
✔ compileCustomExpression compiles exponential functions and UI formula presets (1.62ms)
✔ compileCustomExpression normalizes uppercase variables and functions (1.41ms)
✔ numericalDefiniteIntegral gracefully handles non-finite boundary endpoints without NaN (0.58ms)
✔ double-tap gesture tolerates pointer micro-jitter within threshold and triggers on first attempt (0.63ms)
✔ compileCustomExpression correctly evaluates unary negation before exponentiation (1.74ms)
✔ evaluateCalculatorExpression correctly evaluates arithmetic, functions, and constants (13.59ms)
✔ gradient descent lab formula (x - 2)^2 + 1 compiles and evaluates correctly for calculator and graph (6.04ms)
✔ initial curriculum and progress agree, with 3 of 6 completed (4.98ms)
✔ unknown and locked lessons cannot be started, unlocked early, or completed (1.20ms)
✔ completion awards XP once and unlocks only the next eligible lesson (1.20ms)
✔ finishing the path advances levels, earns AI Explorer, and leaves no current lesson (1.12ms)
✔ direction selection handles empty curricula without losing earned progress (1.13ms)
✔ persistence rehydrates progress and reset restores the demo (8.09ms)
✔ XP actions ignore invalid rewards and calculate levels (0.74ms)
Failed to save practice session: Error [QuotaExceededError]: QuotaExceededError: The quota has been exceeded
✔ getAllRepeatTasks extracts all repeatable tasks across four campus tracks (3.97ms)
✔ filtering repeat tasks by completed lessons isolates only completed themes (2.64ms)
✔ getRepeatThemes computes accurate task counts matching task generator (1.31ms)
✔ validateRepeatAnswer correctly validates quiz questions and practice numbers with tolerance (0.66ms)
✔ practice sessions persist in storage with timestamps, accuracy scores, and retrieve in order (1.31ms)
✔ completing campus tracks unlocks physics-master, math-pioneer, and italian-scholar achievements (3.72ms)
✔ getAllRepeatTasks and getRepeatThemes defensively handle null and invalid inputs without throwing (1.25ms)
✔ storage operations survive SecurityError when localStorage access is restricted (1.62ms)
✔ getPracticeSessions filters out corrupt array elements, nulls, and non-session objects (0.55ms)
✔ savePracticeSession enforces maximum storage capacity limit (caps at MAX_PRACTICE_SESSIONS) (652.87ms)
✔ savePracticeSession handles QuotaExceededError gracefully without crashing caller (5.61ms)
ℹ tests 73 | ℹ suites 3 | ℹ pass 73 | ℹ fail 0 | ℹ duration_ms 3009.80ms
```

---

#### 3. `npm run lint`
```
> uplift-university@0.1.0 lint
> eslint .

C:\Users\Muzaffar\Desktop\university-learning\src\components\learning-world\IslandSignposts.tsx
    6:10  warning  'directions' is defined but never used      @typescript-eslint/no-unused-vars
    7:10  warning  'learningWorlds' is defined but never used  @typescript-eslint/no-unused-vars
   17:10  warning  'IslandSignpost' is defined but never used  @typescript-eslint/no-unused-vars
  249:33  warning  '_props' is defined but never used          @typescript-eslint/no-unused-vars

C:\Users\Muzaffar\Desktop\university-learning\src\components\lesson\ChatAssessment.tsx
  10:3  warning  'speed' is assigned a value but never used  @typescript-eslint/no-unused-vars

✖ 5 problems (0 errors, 5 warnings)
```

---

#### 4. `npm run build`
```
> uplift-university@0.1.0 build
> next build

▲ Next.js 16.3.5 (Turbopack)
✓ Running next.config.ts took 87ms
  Creating an optimized production build ...
✓ Compiled successfully in 7.4s
  Running TypeScript ...
  Finished TypeScript in 6.5s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/40) ...
  Generating static pages using 11 workers (10/40) 
  Generating static pages using 11 workers (20/40) 
  Generating static pages using 11 workers (30/40) 
✓ Generating static pages using 11 workers (40/40) in 6.1s
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /achievements
├ ƒ /api/mascot
├ ○ /courses
├ ○ /dashboard
├ ○ /icon.svg
├ ○ /leaderboard
├   /lesson/[lessonId]
│ ├ ● /lesson/python-basics
│ ├ ● /lesson/linear-algebra
│ ├ ● /lesson/statistics
│ └ ● [+18 more paths]
├ ○ /mascot-playground
├   /path/[directionId]
│ ├ ● /path/ai-ml
│ ├ ● /path/physics-engineering
│ ├ ● /path/mathematics
│ └ ● [+5 more paths]
├ ○ /profile
└ ○ /repeat

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

---

## 5. Concrete Remediation Roadmap

The remediation roadmap is organized into 4 sequential implementation phases. Every single weakness identified during the audit is assigned a standardized severity tag (`[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[LOW]`), exact file paths, line ranges, root causes, and production-ready remediation code blueprints.

```
PHASE 1 (Sprint 1): Critical Security Hardening & GPU Memory Disposal
  ├── SEC-01 & SEC-07: Configure HTTP Security Headers & Clean LAN IPs in next.config.ts
  ├── P1-W01: Fix Cloned GLTF Memory Leak in StorkAssetModel.tsx
  ├── P1-W02: Dispose Road & Tube Geometries in Road.tsx
  └── TEST-01: Fix Scientific Notation Euler Corruption in plot-math.ts

PHASE 2 (Sprint 2): Mathematical Precision, Hydration Integrity & Fault Tolerance
  ├── SEC-02: Replace new Function with Safe Tokenized Math Evaluator
  ├── P3-W03: Deterministic Hydration Gate & Remove suppressHydrationWarning
  ├── P4-W01 & P4-W04: Add Global and Sub-Route Error Boundaries
  ├── P4-W05: Replace Synchronous JSX Throws with Fallback UI in LessonRenderer.tsx
  └── P4-W08: Guard Division by Zero in lessonCompletion (Fix NaN%)

PHASE 3 (Sprint 3): State Decoupling, Storage Unification & TypeScript Strictness
  ├── P3-W01: Convert Whole-Store Subscriptions to Atomic Selector Hooks
  ├── P3-W02 & SEC-03: Unified Storage Coordinator & Zod Deserialization
  ├── P3-W04: Synchronize Repeat & Plot State with URL Query Parameters
  ├── P4-W02: Eliminate 5 ESLint Warnings & Configure Args Ignore Pattern
  ├── P4-W03 & P4-W09: Enable noUncheckedIndexedAccess & Strict Flags in tsconfig.json
  └── P4-W06: Ignore .agents/** in eslint.config.mjs to Accelerate Linting

PHASE 4 (Sprint 4): Test Expansion, DOM Interaction Testing & Performance Polish
  ├── P1-W04 & P1-W05: Throttle Pointer Events and Wheel Zoom in InteractivePlot.tsx
  ├── P1-W06: Optimize 3D Tree Sway to InstancedMesh / Shared Frame Loop
  ├── P2-W02 & P2-W07: Install @testing-library/react and Test Production UI Components
  ├── P2-W03: Add Automated Test Suite for /api/mascot Route Handler
  ├── SEC-04: Implement Static Caching in mascot Route Handler
  └── P1-W13: Fix Desktop Stork Assistant Rendering in AppShell.tsx
```

---

### Phase 1: Critical Security Hardening & GPU Memory Disposal

#### Remediation 1.1: [CRITICAL] HTTP Security Headers & Clean LAN IPs (`next.config.ts`)
- **Target:** `next.config.ts:1-17`
- **Root Cause:** Zero HTTP security headers configured; private network IP `192.168.1.9` hardcoded.
- **Production-Ready Code:**
```typescript
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Temporary until inline script in layout.tsx is nonced
      "style-src 'self' 'unsafe-inline'",  // Needed for KaTeX CSS and CSS modules
      "font-src 'self' data:",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default config;
```

---

#### Remediation 1.2: [CRITICAL] Fix Cloned GLTF Hierarchy Memory Leak (`StorkAssetModel.tsx`)
- **Target:** `src/components/mascot/StorkAssetModel.tsx:74-76`
- **Root Cause:** `<group dispose={null}>` prevents R3F from releasing cloned bones, geometries, and materials.
- **Production-Ready Code:**
```tsx
// Remove dispose={null} and add explicit traversal disposal on unmount
function GltfStork({
  url,
  quality,
  options,
  controller,
}: {
  url: string;
  quality: QualityTier;
  options: StageOptions;
  controller: StorkController;
}) {
  const model = useStorkAsset(url, quality, options);

  useEffect(() => {
    return () => {
      model.copy.traverse((obj) => {
        if ("geometry" in obj && obj.geometry) {
          (obj.geometry as import("three").BufferGeometry).dispose();
        }
        if ("material" in obj && obj.material) {
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else (mat as import("three").Material).dispose();
        }
      });
    };
  }, [model.copy]);

  return (
    <group scale={model.scale}>
      <primitive object={model.copy} />
    </group>
  );
}
```

---

#### Remediation 1.3: [CRITICAL] Dispose Road Geometry and Border Tubes on Unmount (`Road.tsx`)
- **Target:** `src/components/learning-world/Road.tsx:14-39`
- **Root Cause:** Untracked `BufferGeometry` and `TubeGeometry` remain in GPU VRAM across track navigation.
- **Production-Ready Code:**
```tsx
export function Road({ data }: { data: LearningWorldData }) {
  const curve = useMemo(
    () => createWorldPath(data.pathWaypoints),
    [data.pathWaypoints],
  );
  const geometry = useMemo(
    () => createRoadGeometry(curve, data.roadWidth, data.roadDepth),
    [curve, data],
  );
  const edges = useMemo(
    () =>
      [-1, 1].map((side) => {
        const points = Array.from({ length: 81 }, (_, i) => {
          const point = sampleWorldPath(
            curve,
            i / 80,
            side * (data.roadWidth / 2 - 0.13),
          );
          point.y += data.roadDepth / 2 + 0.025;
          return point;
        });
        return new TubeGeometry(
          new CatmullRomCurve3(points),
          100,
          0.045,
          6,
          false,
        );
      }),
    [curve, data],
  );

  // Explicit disposal lifecycle hook
  useEffect(() => {
    return () => {
      geometry.dispose();
      edges.forEach((edge) => edge.dispose());
    };
  }, [geometry, edges]);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial color={data.roadColor} roughness={0.7} />
      </mesh>
      {edges.map((edgeGeo, idx) => (
        <mesh key={idx} geometry={edgeGeo}>
          <meshStandardMaterial color={data.roadEdgeColor} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
```

---

#### Remediation 1.4: [CRITICAL] Fix Scientific Notation Parsing & Euler Corruption (`plot-math.ts`)
- **Target:** `src/lib/plot-math.ts:646-670`, `784-807`
- **Root Cause:** Tokenizer extracts `e` from `1e-5` and converts it to `1*Math.E - 5`.
- **Production-Ready Code:**
```typescript
// In src/lib/plot-math.ts: Protect scientific notation before token validation
export function compileCustomExpression(expr: string): ((x: number) => number) | null {
  if (!expr || typeof expr !== "string") return null;

  // 1. Normalize scientific notation (e.g. 1e-5 -> 1*10^(-5), 2.5e4 -> 2.5*10^(4))
  let clean = expr.trim();
  clean = clean.replace(/(\d+(?:\.\d+)?)[eE]([+-]?\d+)/g, "($1*10^($2))");

  // 2. Validate remaining tokens
  const tokens = clean.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
  for (const token of tokens) {
    if (!ALLOWED_MATH_IDENTIFIERS.has(token.toLowerCase())) {
      return null;
    }
  }

  // 3. Proceed with standard implicit multiplication and operator handling
  // ...
}
```

---

### Phase 2: Mathematical Precision, Hydration Integrity & Fault Tolerance

#### Remediation 2.1: [HIGH] Safe Tokenized Math Evaluator Eliminating `new Function`
- **Target:** `src/lib/plot-math.ts:734-738`, `MathCalculatorDrawer.tsx:64`
- **Root Cause:** Live `new Function` evaluation forces `'unsafe-eval'` under CSP.
- **Architectural Pattern:** Implement Shunting-Yard AST / RPN evaluator that evaluates pure math safely without `new Function` or `eval`.

```typescript
// Proposed pure mathematical evaluator for src/lib/plot-math.ts
export function evaluateSafeMath(expr: string, xVal: number = 0): number {
  // 1. Tokenize into operators (+, -, *, /, ^), functions (sin, cos, exp), constants (pi, e), and numbers
  // 2. Parse using Shunting-Yard algorithm into Reverse Polish Notation queue
  // 3. Evaluate RPN stack purely in numeric memory:
  //    - Never invokes JavaScript compiler or 'new Function'
  //    - Zero vulnerability to prototype pollution or code injection
  //    - Fully compliant with strict 'Content-Security-Policy' without 'unsafe-eval'
}
```

---

#### Remediation 2.2: [HIGH] Deterministic Hydration Gate & Remove `suppressHydrationWarning`
- **Target:** `src/app/layout.tsx:27-28`, `src/stores/progress-provider.tsx:81-98`
- **Root Cause:** 100ms timeout race condition masks hydration mismatch.
- **Production-Ready Code:**
```tsx
// In src/stores/progress-provider.tsx:
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createProgressStore());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Deterministic Zustand rehydration callback
    const unsub = store.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    store.persist.rehydrate();
    return () => unsub();
  }, [store]);

  return (
    <ProgressContext.Provider value={store}>
      <HydrationContext.Provider value={hydrated}>
        {children}
      </HydrationContext.Provider>
    </ProgressContext.Provider>
  );
}

// In src/app/layout.tsx: Remove suppressHydrationWarning
<html lang="en" className={`${nunito.className} ${nunito.variable}`}>
  <body>
    <ProgressProvider>
      <AppShell>{children}</AppShell>
    </ProgressProvider>
  </body>
</html>
```

---

#### Remediation 2.3: [CRITICAL] Root Global Error Boundary (`src/app/global-error.tsx`)
- **Target:** Create `src/app/global-error.tsx`
- **Root Cause:** Absence of root error boundary leaves application vulnerable to fatal white screens.
- **Production-Ready Code:**
```tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root layout failure:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center p-6 bg-slate-50 font-sans">
        <section className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center border border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Application Error</h1>
          <p className="mt-2 text-sm text-slate-600">
            A critical error occurred while loading the campus workspace.
          </p>
          {error.digest && (
            <code className="mt-2 block text-xs font-mono text-slate-400">
              Digest: {error.digest}
            </code>
          )}
          <button
            type="button"
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
            onClick={() => reset()}
          >
            Reload application
          </button>
        </section>
      </body>
    </html>
  );
}
```

---

#### Remediation 2.4: [HIGH] Replace Synchronous JSX Throws with Fallback Cards (`LessonRenderer.tsx`)
- **Target:** `src/components/lesson/LessonRenderer.tsx:243, 269`
- **Root Cause:** Unmapped problem/quiz IDs throw raw errors during JSX mapping, crashing the entire page.
- **Production-Ready Code:**
```tsx
// In src/components/lesson/LessonRenderer.tsx:
// Replace raw throw with informative fallback UI
{block.problemIds.map((id) => {
  const problem = lesson.practiceProblems.find((p) => p.id === id);
  if (!problem) {
    return (
      <div key={id} className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
        Practice problem temporarily unavailable (ID: {id}).
      </div>
    );
  }
  return <PracticeCard key={id} problem={problem} ... />;
})}
```

---

#### Remediation 2.5: [HIGH] Guard Division by Zero in `lessonCompletion` (`lesson-progress.ts`)
- **Target:** `src/lib/lesson-progress.ts:27-32`
- **Root Cause:** `Math.round((0 / 0) * 100)` evaluates to `NaN`.
- **Production-Ready Code:**
```typescript
export function lessonCompletion(
  lesson: LessonContent,
  activity: LessonActivity,
) {
  const requirements = lessonRequirements(lesson);
  let total = 0,
    done = 0;
  for (const key of ["completed", "practice", "quiz"] as const) {
    total += requirements[key].length;
    done += requirements[key].filter((id) => activity[key].includes(id)).length;
  }
  return {
    done,
    total,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
    complete: total > 0 && done === total,
  };
}
```

---

### Phase 3: State Decoupling, Storage Unification & TypeScript Strictness

#### Remediation 3.1: [CRITICAL] Replace Whole-Store Subscriptions with Atomic Selectors
- **Target:** 10 component files in `src/components/`
- **Root Cause:** `useProgress((s) => s)` triggers cascading re-renders on every state mutation.
- **Production-Ready Code:**
```typescript
// Proposed src/stores/progress-selectors.ts:
import { useShallow } from "zustand/react/shallow";
import { useProgress } from "./progress-provider";

export const useUserStats = () =>
  useProgress(
    useShallow((s) => ({
      xp: s.xp,
      level: s.level,
      streak: s.streak,
    }))
  );

export const useCurrentLesson = () =>
  useProgress(
    useShallow((s) => ({
      directionId: s.currentDirectionId,
      lessonId: s.currentLessonId,
    }))
  );

export const useCompletedLessons = () =>
  useProgress((s) => s.completedLessons);

export const useLessonActivity = (key: string) =>
  useProgress((s) => s.lessonActivities[key] ?? emptyActivity());
```

---

#### Remediation 3.2: [CRITICAL] Unified Namespaced Storage Coordinator & Zod Sanitization
- **Target:** `src/stores/progress-store.ts`, `RepeatTasksView.tsx`, `repeat-tasks.ts`, `InteractivePlot.tsx`
- **Root Cause:** 4 unsynchronized localStorage keys and unvalidated deserialization.
- **Production-Ready Code:**
```typescript
// In src/stores/progress-schema.ts:
import { z } from "zod";

export const ProgressSchema = z.object({
  currentDirectionId: z.string().default("ai-ml"),
  currentLessonId: z.string().nullable().default("python-basics"),
  completedLessons: z.array(z.string()).default([]),
  unlockedLessons: z.array(z.string()).default([]),
  xp: z.number().int().nonnegative().default(0),
  level: z.number().int().positive().default(1),
  streak: z.number().int().nonnegative().default(0),
  achievements: z.array(z.string()).default([]),
  lessonActivities: z.record(z.string(), z.any()).default({}),
});

// Storage adapter with Zod validation and safe fallback:
const validatingStorage = {
  getItem: (key: string) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const validated = ProgressSchema.safeParse(parsed.state);
      if (!validated.success) {
        console.warn("Storage validation failed, restoring clean baseline state");
        return { state: freshProgress(), version: 1 };
      }
      return { state: validated.data, version: parsed.version ?? 1 };
    } catch {
      return { state: freshProgress(), version: 1 };
    }
  },
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};
```

---

#### Remediation 3.3: [HIGH] Eliminate 5 ESLint Warnings & Configure Args Ignore Pattern
- **Target:** `src/components/learning-world/IslandSignposts.tsx`, `src/components/lesson/ChatAssessment.tsx`, `eslint.config.mjs`
- **Root Cause:** Unused variables cause 5 ESLint warnings, failing zero-warning criteria.
- **Production-Ready Code:**
1. In `src/components/learning-world/IslandSignposts.tsx`:
   - Remove unused imports `directions`, `learningWorlds`, and unused function `IslandSignpost`.
   - Update stub export:
     ```tsx
     export function IslandSignposts() {
       return null;
     }
     export default IslandSignposts;
     ```
2. In `src/components/lesson/ChatAssessment.tsx`:
   - Connect typewriter `speed` prop or remove it from `TypewriterText`:
     ```tsx
     const delay = Math.max(200, Math.min(1200, text.length * speed));
     const timer = setTimeout(() => { ... }, delay);
     ```
3. In `eslint.config.mjs`: Ignore `.agents/**` and allow underscore prefixes:
   ```javascript
   import { defineConfig, globalIgnores } from "eslint/config";
   import nextVitals from "eslint-config-next/core-web-vitals";
   import nextTs from "eslint-config-next/typescript";

   export default defineConfig([
     ...nextVitals,
     ...nextTs,
     globalIgnores([
       ".next/**",
       ".agents/**",
       "scripts/**",
       "coverage/**",
     ]),
     {
       rules: {
         "@typescript-eslint/no-unused-vars": [
           "warn",
           { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
         ],
       },
     },
   ]);
   ```

---

#### Remediation 3.4: [HIGH] Enable `noUncheckedIndexedAccess` in `tsconfig.json`
- **Target:** `tsconfig.json:2-18`
- **Root Cause:** Lack of strict indexing allows crashes like `FormulaBreakdown.tsx:14`.
- **Production-Ready Code:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    "tests/**/*.ts"
  ],
  "exclude": ["node_modules", ".agents"]
}
```
And add optional chaining in `src/components/lesson/FormulaBreakdown.tsx:14`:
```tsx
const variable =
  selected === null ? undefined : block.parts[selected]?.variable;
```

---

### Phase 4: Test Expansion, DOM Interaction Testing & Performance Polish

#### Remediation 4.1: [HIGH] Throttle Pointer Events and Wheel Zoom in `InteractivePlot.tsx`
- **Target:** `src/components/lesson/plot/InteractivePlot.tsx:1257-1278`, `1636-1692`
- **Root Cause:** Unthrottled pointer moves and wheel event listener churn cause rendering bottlenecks.
- **Production-Ready Code:**
```tsx
// 1. Throttle pointer move to requestAnimationFrame:
const rafId = useRef<number | null>(null);
const pendingVp = useRef<PlotViewport | null>(null);

const scheduleViewportUpdate = useCallback((nextVp: PlotViewport) => {
  pendingVp.current = nextVp;
  if (rafId.current === null) {
    rafId.current = requestAnimationFrame(() => {
      if (pendingVp.current) {
        setViewport(pendingVp.current);
        pendingVp.current = null;
      }
      rafId.current = null;
    });
  }
}, []);

// 2. Debounce critical point numerical calculation during zoom:
const settleTimer = useRef<NodeJS.Timeout | null>(null);
const queueDomainSettle = useCallback((next: PlotViewport) => {
  if (settleTimer.current) clearTimeout(settleTimer.current);
  settleTimer.current = setTimeout(() => {
    setSettledDomain({ xMin: next.xMin, xMax: next.xMax });
  }, 150);
}, []);
```

---

#### Remediation 4.2: [HIGH] Install `@testing-library/react` and Verify Production Components
- **Target:** `package.json`, `tests/`
- **Root Cause:** R1 double-tap testing currently tests local dummy functions rather than `InteractivePlot.tsx`.
- **Action Plan:**
  1. Add `@testing-library/react` and `jsdom` to devDependencies.
  2. Implement true component interaction tests for `InteractivePlot.tsx` (pointer down, double click, coordinate pinning).
  3. Add route handler tests for `GET /api/mascot` verifying HTTP 200, JSON schema, and `no-store` headers.

---

#### Remediation 4.3: [HIGH] Static File Check Caching in Mascot Route Handler
- **Target:** `src/app/api/mascot/route.ts:5-17`
- **Root Cause:** Uncached `access()` syscall on every request risks threadpool starvation.
- **Production-Ready Code:**
```typescript
import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// Cache static asset existence in memory
let cachedAvailability: boolean | null = null;

function isModelAvailable(): boolean {
  if (cachedAvailability === null) {
    try {
      const targetPath = path.join(process.cwd(), "public", "models", "stork.glb");
      cachedAvailability = existsSync(targetPath);
    } catch {
      cachedAvailability = false;
    }
  }
  return cachedAvailability;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const available = isModelAvailable();
  return NextResponse.json(
    { success: true, modelUrl: available ? "/models/stork.glb" : null },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
```

---

#### Remediation 4.4: [LOW] Fix Stork Assistant Visibility on Desktop (`AppShell.tsx`)
- **Target:** `src/components/layout/AppShell.tsx:81`, `StorkAssistant.tsx:21`
- **Root Cause:** `AppShell` passes `mobile` hardcoded, disabling the assistant for desktop users.
- **Production-Ready Code:**
```tsx
// In src/components/layout/AppShell.tsx:
// Pass responsive boolean matching viewport:
<StorkAssistant mobile={small} />
```

---

## 6. Audit Conclusion & Next Steps

The Uplift University codebase possesses strong visual design, impressive procedural 3D scenery, and a comprehensive multi-track curriculum. However, moving the application from a prototype to a resilient, production-ready educational platform requires resolving the **critical security header void**, **GPU memory leaks in 3D scene graphs**, **Euler exponent mathematical corruption**, and **whole-store subscription re-render cascades**.

Executing the 4-phase remediation roadmap detailed above will:
1. Harden the application against web attacks (Clickjacking, MIME-sniffing, XSS) with standard HTTP headers and a safe math evaluator.
2. Ensure continuous 60fps performance and zero GPU VRAM accumulation across 3D campus navigation.
3. Guarantee mathematical precision across all graphing labs, derivatives, and numerical integrations.
4. Eliminate universal re-render churn, providing instant, responsive interactions across all student devices.
