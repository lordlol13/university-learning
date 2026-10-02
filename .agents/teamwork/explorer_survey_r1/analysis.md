# Deep Technical Analysis: Desmos Graphics & Interactive Plotting (Requirement R1)

## Executive Summary
This report presents an exhaustive investigation of the Desmos interactive plotting system across the Uplift University learning platform. The investigation focused on `src/components/lesson/plot/InteractivePlot.tsx`, `src/lib/plot-math.ts`, all related lesson components (`GradientDescentLab.tsx`, `LessonRenderer.tsx`, `LessonView.tsx`), lesson data across the four campus tracks, and existing automated tests in `tests/plot-math.test.ts`.

Several critical defects were identified:
1. **Double-click & double-tap pinning failure on first attempt**: Micro-movement jitter during clicking/tapping breaches an aggressive 4-pixel drag threshold, wiping the tap history reference and triggering browser drag suppression of the native `dblclick` event.
2. **Custom expression compiler broken on `exp(x)` and uppercase `X`**: The implicit multiplication regex improperly corrupts `exp(x)` into `ex*p(x)`, causing compilation failure on exponential formulas—including the UI's sample chip `"4*exp(-0.5*x^2)"` and placeholder `"4/(1+exp(-2x))"`. Case sensitivity also breaks uppercase `X`.
3. **Definite integral NaN boundary infection**: `numericalDefiniteIntegral` does not guard `fn(a)` and `fn(b)` against non-finite evaluations, poisoning Simpson's rule.
4. **Layout jump and toolbar overlap**: `.desmos-active-formula-chip` is hard-coded with `top: 50px` relative to the root container, causing it to overlap integral and formula toolbars when expanded.
5. **Pan/zoom performance lag**: `findCriticalPoints` (evaluating ~1500+ mathematical operations) is recalculated synchronously on every single pixel of mouse/touch drag without throttling.
6. **Non-finite coordinate pinning**: `triggerDoubleTapAt` lacks validation for non-finite values, allowing `NaN` coordinates to be pinned and corrupting SVG paths.

---

## 1. Inventory of Interactive Plot Architecture & Components

| Component / Utility | File Path | Responsibilities & Core Features |
|---|---|---|
| `InteractivePlot` | `src/components/lesson/plot/InteractivePlot.tsx:1057-2036` | Main Desmos-like interactive plotting engine. Manages SVG viewport, coordinate transformations, preset switching, custom formula compilation, integral shading, crosshair tracing, point pinning, and settings popover. |
| `CoordinateSystem` | `src/components/lesson/plot/InteractivePlot.tsx:93-311` | Mathematical graph paper grid with major ticks, 5x subdivision minor ticks, bold X/Y axes, directional labels, and origin badge `(0,0)`. |
| `FunctionPlot` | `src/components/lesson/plot/InteractivePlot.tsx:314-402` | High-resolution SVG path generator for the mathematical curve. Includes glow layer, asymptote break detection, and vertical clamping. |
| `IntegralShadingLayer` | `src/components/lesson/plot/InteractivePlot.tsx:405-510` | Shaded area under the curve between bounds $[a, b]$, dynamic linear gradient, boundary lines, and live value badge. |
| `CriticalPointsLayer` | `src/components/lesson/plot/InteractivePlot.tsx:513-612` | Visual dots and hover cards for auto-detected roots, local minima, local maxima, and inflection points. |
| `CrosshairLayer` | `src/components/lesson/plot/InteractivePlot.tsx:615-784` | Real-time curve tracing crosshair with axis projection badges, tangent line preview, instantaneous derivative slope $dy/dx$, and concavity analysis. |
| `PinnedPointsLayer` | `src/components/lesson/plot/InteractivePlot.tsx:807-938` | Interactive sticky pins on the curve with slope vectors, coordinate badges, selection states, and removal triggers. |
| `PlotControls` | `src/components/lesson/plot/InteractivePlot.tsx:941-1049` | Toolbar for pan arrows, zoom in/out, view reset, theme toggle (dark/light), clear points, and settings toggle. |
| `plot-math.ts` | `src/lib/plot-math.ts:1-593` | Numerical calculus algorithms (central difference derivatives, Simpson's rule definite integrals, bisection root/extrema/inflection solvers), equation presets, and custom expression parser. |
| `GradientDescentLab` | `src/components/lesson/GradientDescentLab.tsx:1-433` | Interactive simulation hosting `InteractivePlot`, displaying loss landscape, step vector previews, and descent trajectory. |
| `LessonRenderer` | `src/components/lesson/LessonRenderer.tsx:1-830` | Core lesson engine renderer with subject-specific branching (`isCodingSubject`), stepper bar, formulas, and assessment tracking. |

---

## 2. In-Depth Root Cause Analysis: Point Pinning (Mouse, Trackpad & Touch)

### 2.1 The 4-Pixel Jitter Wipeout Bug
- **Location**: `src/components/lesson/plot/InteractivePlot.tsx:1718-1723`
- **Observed Code**:
  ```tsx
  // Single finger or mouse pan
  const rect = e.currentTarget.getBoundingClientRect();
  if (drag.current && activePointersRef.current.size === 1) {
    const d = drag.current;
    const dist = Math.hypot(e.clientX - d.x, e.clientY - d.y);
    if (!d.hasMoved && dist < 4) {
      return;
    }
    d.hasMoved = true;
    lastTapRef.current = null;
  ```
- **Failure Mechanism**:
  1. On Click 1 (`pointerdown`), `lastTapRef.current` is set to `{ time: now, x: e.clientX, y: e.clientY }`.
  2. While depressing the mouse button, clicking a physical trackpad, or touching a capacitive screen, human fingers inevitably wobble by 4–8 pixels.
  3. `dist >= 4` is immediately triggered on the very next `pointermove` event.
  4. The handler marks `d.hasMoved = true`, sets `lastTapRef.current = null`, and triggers graph panning via `setViewport`.
  5. Because `lastTapRef.current` was obliterated, when Click 2 arrives (`pointerdown`), the system treats it as an initial tap rather than the second half of a double tap.
  6. Furthermore, because browser engines detect a 4px drag sequence between `pointerdown` and `pointerup`, the native `dblclick` event is suppressed!
  7. **Result**: Both synthetic double-tap and native double-click fail on the first attempt. Users must click 3–4 times or hold their hand rigidly motionless to register a pin.

### 2.2 Inadequate Double-Tap Timing Window
- **Location**: `src/components/lesson/plot/InteractivePlot.tsx:1630`
- **Observed Code**:
  ```tsx
  if (last && now - last.time < 380 && dist < 25) {
  ```
- **Failure Mechanism**:
  - The threshold of 380ms is faster than the default double-click timing in standard operating systems (Windows: 500ms; macOS: 500ms).
  - Users clicking at standard speeds (e.g., 400ms interval) are rejected.
  - Spatial threshold of 25px is too tight for mobile touch input, where finger contact centers routinely vary by 25–35px between successive taps.

### 2.3 Excessive Cooldown Duration
- **Location**: `src/components/lesson/plot/InteractivePlot.tsx:1255-1264`
- **Observed Code**:
  ```tsx
  if (
    lastDoubleTriggerRef.current &&
    now - lastDoubleTriggerRef.current.time < 450 &&
    Math.hypot(clientX - lastDoubleTriggerRef.current.x, clientY - lastDoubleTriggerRef.current.y) < 35
  ) {
    return;
  }
  ```
- **Failure Mechanism**:
  - The cooldown is intended solely to prevent the native browser `dblclick` event (which fires 5–30ms after the second `pointerup`) from toggling off the point that was just pinned in `pointerdown`.
  - However, a 450ms cooldown is excessive. If a user quickly double-taps to remove a point, or double-taps another spot on the curve within 450ms, the interaction is swallowed.
  - A cooldown of 250ms is more than sufficient to absorb native `dblclick` (~20ms) while keeping the interface responsive to intentional rapid gestures.

### 2.4 Unchecked Non-Finite Values (NaN/Infinity) in Pinned Points
- **Location**: `src/components/lesson/plot/InteractivePlot.tsx:1273-1286`
- **Observed Code**:
  ```tsx
  const graphX = scale.invertX(px);
  const graphY = settings.snapToCurve ? activeFn(graphX) : scale.invertY(py);
  const slope = numericalDerivative(activeFn, graphX);
  const concavity = numericalSecondDerivative(activeFn, graphX);

  const newPoint: PinnedPlotPoint = {
    id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    x: Number(graphX.toFixed(3)),
    y: Number(graphY.toFixed(3)),
    slope: Number(slope.toFixed(3)),
    concavity: Number(concavity.toFixed(3)),
    source: "user",
  };
  ```
- **Failure Mechanism**:
  - If a user double-clicks where `activeFn(graphX)` is undefined or asymptotes (e.g., $\ln(x)$ at $x \le 0$ or $1/x$ at $x \approx 0$), `graphY` evaluates to `NaN` or `Infinity`.
  - `Number((NaN).toFixed(3))` evaluates to `NaN`.
  - The point is added to `pinnedPoints` with `NaN` coordinates.
  - In `PinnedPointsLayer`, `scale.y(pt.y)` returns `NaN`, generating invalid SVG attributes (`cy="NaN"`, `d="M 12.5,NaN..."`) and displaying `"NaN"` in the inspector card.
  - Fix: Check `if (!Number.isFinite(graphX) || !Number.isFinite(graphY)) return;` before creating or updating points.

---

## 3. In-Depth Root Cause Analysis: Mathematical Utilities & Calculus Engines

### 3.1 Custom Expression Compiler: The `exp(x)` Corruption Bug
- **Location**: `src/lib/plot-math.ts:519`
- **Observed Code**:
  ```ts
  // 1. Implicit multiplication:
  let s = clean.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2");
  s = s.replace(/([xX])\s*([a-zA-Z0-9(])/g, "$1*$2");
  s = s.replace(/\)\s*([a-zA-Z0-9(])/g, ")*$1");
  ```
- **Failure Mechanism**:
  - The second replacement rule targets any `[xX]` followed by an alphanumeric character.
  - In `exp(x)`, the letter `x` is immediately followed by `p`.
  - The replacement converts `exp(x)` into `ex*p(x)`!
  - When the compiler subsequently performs mathematical identifier replacement (`\bexp\b` -> `Math.exp`), `ex*p` does not match.
  - When passed to `new Function`, `ex*p(x)` throws `ReferenceError: ex is not defined`.
  - `compileCustomExpression("exp(x)")` returns `null`.
  - Every exponential equation—including the UI's sample chip `"4*exp(-0.5*x^2)"` and the input placeholder `"4/(1+exp(-2x))"`—fails with "Could not compile formula."
- **Verification via Node.js**:
  ```bash
  compileCustomExpression("exp(x)") -> null
  compileCustomExpression("4*exp(-0.5*x^2)") -> null
  compileCustomExpression("4/(1+exp(-2x))") -> null
  ```
- **Solution**:
  Use a word boundary on the variable identifier:
  ```ts
  s = s.replace(/\b([xX])\s*([a-zA-Z0-9(])/g, "$1*$2");
  ```
  Because the `x` in `exp` is preceded by `e` (a word character), `\bx` does not match, leaving `exp(...)` intact.

### 3.2 Custom Expression Compiler: Uppercase Variable `X`
- **Location**: `src/lib/plot-math.ts:564-568`
- **Observed Code**:
  ```ts
  const fn = new Function(
    "Math",
    "x",
    `"use strict"; return Number(${s});`,
  ).bind(null, Math) as (x: number) => number;
  ```
- **Failure Mechanism**:
  - JavaScript variables are case-sensitive. The formal parameter is lowercase `"x"`.
  - If a user enters `X^2` or `2X` or `Cos(X)`, `s` retains uppercase `X`.
  - Evaluating `new Function` throws `ReferenceError: X is not defined` and compilation returns `null`.
- **Solution**:
  Normalize uppercase standalone variable `X` to lowercase `x`:
  ```ts
  s = s.replace(/\bX\b/g, "x");
  ```

### 3.3 Simpson's Rule Integral NaN Boundary Infection
- **Location**: `src/lib/plot-math.ts:154`
- **Observed Code**:
  ```ts
  export function numericalDefiniteIntegral(
    fn: (x: number) => number,
    a: number,
    b: number,
    intervals: number = 80,
  ): number {
    if (Math.abs(b - a) < 1e-9) return 0;
    const n = intervals % 2 === 0 ? intervals : intervals + 1;
    const h = (b - a) / n;
    let sum = fn(a) + fn(b);
  ```
- **Failure Mechanism**:
  - Intermediate loop steps check `if (!Number.isFinite(y)) continue;`.
  - However, endpoints `fn(a)` and `fn(b)` are NOT guarded.
  - If `a` or `b` sits on an asymptote or boundary where `fn` evaluates to `NaN` or $\pm\infty$ (e.g. $\int_0^2 \ln(x) dx$), `sum` starts as `NaN`.
  - Adding finite numbers to `NaN` leaves `sum` as `NaN`.
- **Solution**:
  ```ts
  const fa = Number.isFinite(fn(a)) ? fn(a) : 0;
  const fb = Number.isFinite(fn(b)) ? fn(b) : 0;
  let sum = fa + fb;
  ```

---

## 4. UI/UX, Performance & Layout Jump Investigation

### 4.1 Layout Jump: Formula Chip Overlapping Toolbar Inputs
- **Locations**:
  - `src/components/lesson/plot/InteractivePlot.tsx:1556`
  - `src/app/lesson.css:844-860`
- **Observed Styles**:
  ```css
  .desmos-active-formula-chip {
    position: absolute;
    top: 50px;
    left: 14px;
    z-index: 10;
    ...
  }
  ```
- **Failure Mechanism**:
  - `.desmos-glass-hud` has a height of ~42px.
  - When `.desmos-integral-toolbar` (~40px) or `.desmos-formula-editor-bar` (~80px) is opened, it is inserted into the document flow *above* the SVG canvas.
  - The SVG canvas shifts down by 40–120px.
  - However, `.desmos-active-formula-chip` has `position: absolute; top: 50px;` anchored to `.interactive-plot`.
  - Consequently, the formula chip remains fixed at `top: 50px`, colliding directly with and obscuring the integral bounds inputs and formula text fields.
- **Solution**:
  Wrap the SVG canvas and its on-graph overlay badges in a dedicated container:
  ```tsx
  <div className="desmos-canvas-wrapper" style={{ position: "relative" }}>
    <div className="desmos-active-formula-chip">...</div>
    <svg>...</svg>
  </div>
  ```
  Anchor `.desmos-active-formula-chip` with `top: 10px; left: 14px;` relative to `.desmos-canvas-wrapper`. This ensures the chip stays anchored to the graph paper regardless of how many toolbars expand above it.

### 4.2 Performance Lag: Unthrottled Critical Points Detection During Dragging
- **Location**: `src/components/lesson/plot/InteractivePlot.tsx:1211-1214`
- **Observed Code**:
  ```tsx
  const criticalPoints = useMemo(() => {
    if (!settings.showCriticalPoints) return [];
    return findCriticalPoints(activeFn, viewport.xMin, viewport.xMax);
  }, [activeFn, viewport.xMin, viewport.xMax, settings.showCriticalPoints]);
  ```
- **Failure Mechanism**:
  - Panning triggers `onPointerMove`, updating `viewport` coordinates on every frame (60–120 FPS).
  - On every single frame, `findCriticalPoints` runs 240 sample steps $\times$ multiple derivative and second derivative evaluations, executing >1,500 math operations synchronously on the main UI thread.
  - This causes dropped frames and noticeable pan lag, particularly on mobile viewports.
- **Solution**:
  Skip or throttle `findCriticalPoints` while an active single-pointer drag is in progress (`if (drag.current?.hasMoved) return [];` or preserve last calculated points during pan and recalculate on `pointerup`).

---

## 5. Subject-Specific Rendering Analysis

Requirement R1 states:
> "Ensure explanations in non-coding tracks (Mathematics, Physics & Engineering, Italian Language & Culture) present rich mathematical and conceptual visualizations without superfluous code runner windows (which should only appear for coding tracks like ai-ml)."

### 5.1 Verification of `isCodingSubject` Logic
- **Location**: `src/components/lesson/LessonRenderer.tsx:74-129`
- **Observed Code**:
  - Correctly excludes any direction containing `"physics"`, `"math"`, `"italian"`, `"language"`.
  - Explicitly lists all 14 non-coding lesson IDs (`calc-derivatives`, `calc-integrals`, `discrete-logic`, `linear-systems`, `si-base-units`, `dimensional-scaling`, `water-equivalency`, `vector-components`, `vector-dot-product`, `vector-cross-product`, `physics-tactical-exam`, `italian-greetings`, `italian-numbers-time`, `italian-engineering-terms`).
  - Code blocks (`type: "code"`) in `ContentBlock` return `null` when `!codingSubject`.
  - Unviewed/uncompleted code blocks for non-coding tracks are auto-marked complete via `useEffect` (`LessonRenderer.tsx:464-475`), preventing progress lockouts.
  - Stage indicator stepper suppresses code icon for non-coding tracks (`getSectionStageKind`, lines 393-402).

### 5.2 Content Audit of Authored Lessons
- Verified all 21 lesson files in `src/data/lessons/`:
  - `type: "code"` blocks exist **only** in coding lessons: `python-basics.ts`, `linear-algebra.ts`, `statistics.ts`, `gradient-descent.ts`, `databases.ts`, `deep-learning.ts`.
  - Non-coding lessons (`calc-derivatives.ts`, `calc-integrals.ts`, `discrete-logic.ts`, `linear-systems.ts`, all 7 physics lessons, all 3 Italian lessons) contain strictly rich math formulas, formula breakdowns, worked examples with LaTeX, diagrams, practice problems, and conceptual reflections.
  - No superfluous code runner sandboxes appear in mathematics, physics, or Italian tracks.

---

## 6. Test Suite Analysis & Coverage Deficiencies

- Existing test suite: `tests/plot-math.test.ts` (12 tests).
- All 12 tests currently pass, but critical edge cases are completely untested:
  1. No test for `compileCustomExpression("exp(x)")`, `compileCustomExpression("4*exp(-0.5*x^2)")`, or `compileCustomExpression("4/(1+exp(-2x))")`.
  2. No test for uppercase variable inputs (`X^2`, `2X`, `Cos(X)`).
  3. No test for `numericalDefiniteIntegral` with endpoint non-finite evaluations.
  4. The double-tap test in `tests/plot-math.test.ts:210-250` only tests theoretical cooldown logic in isolation, but does not test pointer movement jitter tolerance (drag slop).

---

## 7. Recommended Implementation Actions

1. **`src/lib/plot-math.ts`**:
   - Change implicit multiplication for variable `x` to use word boundary:
     ```ts
     s = s.replace(/\b([xX])\s*([a-zA-Z0-9(])/g, "$1*$2");
     ```
   - Normalize uppercase `X` to `x`:
     ```ts
     s = s.replace(/\bX\b/g, "x");
     ```
   - In `numericalDefiniteIntegral`, guard `fn(a)` and `fn(b)` with `Number.isFinite`.

2. **`src/components/lesson/plot/InteractivePlot.tsx`**:
   - In `onPointerMove`, increase drag initiation threshold from 4px to 10px (touch: 12px) before setting `d.hasMoved = true` and wiping `lastTapRef.current`.
   - In `onPointerDown`, update double-tap timing threshold from 380ms to 480ms and distance tolerance from 25px to 32px.
   - In `triggerDoubleTapAt`, reduce deduplication cooldown from 450ms to 250ms.
   - In `triggerDoubleTapAt`, add finite coordinate guard `if (!Number.isFinite(graphX) || !Number.isFinite(graphY)) return;`.
   - Wrap the SVG and on-graph badges in `<div className="desmos-canvas-wrapper" style={{ position: "relative" }}>` to eliminate toolbar layout jump and overlap.
   - Throttle or freeze `criticalPoints` computation during active drag panning.

3. **`tests/plot-math.test.ts`**:
   - Add unit tests verifying `exp(x)`, `4*exp(-0.5*x^2)`, `4/(1+exp(-2x))`, and uppercase `X` compilation.
   - Add unit tests verifying `numericalDefiniteIntegral` safety with edge singularities.
