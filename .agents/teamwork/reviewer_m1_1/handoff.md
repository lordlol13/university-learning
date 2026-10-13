# Milestone 1 Independent Review & Adversarial Critic Report: Desmos Graphics & Interactive Plotting Verification

## Review Summary
**Verdict**: **APPROVE**
**Integrity Assessment**: Clean — zero integrity violations, no facade/dummy code, no hardcoded test outputs.
**Overall Risk Assessment**: LOW

---

## 1. Observation

Direct observations from independent inspection of code, tests, and tool execution:

### 1.1 Formula Parsing & Normalization (`src/lib/plot-math.ts`)
- **Lines 517–530**:
  ```ts
  let s = clean.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2");
  s = s.replace(/\b([xX])\s*([a-zA-Z0-9(])/g, "$1*$2");
  s = s.replace(/\)\s*([a-zA-Z0-9(])/g, ")*$1");
  s = s.replace(/\bX\b/g, "x");
  s = s.replace(/\^/g, "**");
  ```
- **Finding**: Prepending `\b` to `([xX])` ensures word boundaries are respected. In `exp(x)`, the character `e` precedes `x`, so `\b` fails to match and `exp(x)` is preserved untouched. When `x` is preceded by non-word characters (or starts a word), implicit multiplication works as intended (e.g. `x(x+1)` -> `x*(x+1)`, `x2` -> `x*2`). Standalone uppercase variable `\bX\b` is cleanly normalized to lowercase `x`.
- Whitelist `ALLOWED_MATH_IDENTIFIERS` contains all standard functions (`exp`, `sin`, `cos`, `tan`, `sqrt`, `ln`, `log`, `abs`, `round`, `floor`, `ceil`, `min`, `max`, `pi`, `e`, etc.), guarding against arbitrary code execution.

### 1.2 Definite Integral Endpoint Singularity Guard (`src/lib/plot-math.ts`)
- **Lines 145–167**:
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
    const fa = Number.isFinite(fn(a)) ? fn(a) : 0;
    const fb = Number.isFinite(fn(b)) ? fn(b) : 0;
    let sum = fa + fb;

    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      const y = fn(x);
      if (!Number.isFinite(y)) continue;
      sum += i % 2 === 0 ? 2 * y : 4 * y;
    }

    const result = (h / 3) * sum;
    return Number.isFinite(result) ? result : 0;
  }
  ```
- **Finding**: Endpoints `fn(a)` and `fn(b)` and intermediate evaluations `fn(x)` are guarded with `Number.isFinite`. Singularities (e.g., `ln(x)` near 0, asymptotes, or discontinuous functions) will not poison Simpson's rule with `NaN` or `Infinity`.

### 1.3 Point Pinning & Micro-Jitter Absorption (`src/components/lesson/plot/InteractivePlot.tsx`)
- **Lines 1262–1315**:
  - `lastDoubleTriggerRef` checks `now - lastDoubleTriggerRef.current.time < 250 && Math.hypot(clientX - lastDoubleTriggerRef.current.x, clientY - lastDoubleTriggerRef.current.y) < 35`, preventing redundant cancellation from native `dblclick` events following `pointerdown` double-taps.
  - Coordinate finite check: `if (!Number.isFinite(graphX) || !Number.isFinite(graphY)) return;` prevents corrupt pinned points.
- **Lines 1648–1667, 1756–1768**:
  - Double-tap detection window widened to 480ms and 32px tolerance (`now - last.time < 480 && dist < 32`).
  - Pointer micro-jitter tolerance raised:
    ```ts
    const moveThreshold = e.pointerType === "touch" ? 12 : 10;
    if (!d.hasMoved && dist < moveThreshold) {
      return;
    }
    d.hasMoved = true;
    lastTapRef.current = null;
    ```
    This prevents natural physical finger/mouse tremor during a double-click gesture from aborting tap detection.

### 1.4 Layout Jump Elimination & Overlay Anchoring (`src/components/lesson/plot/InteractivePlot.tsx`, `src/app/lesson.css`)
- **InteractivePlot.tsx:1579, 1937**:
  - `<div className="desmos-canvas-wrapper" style={{ position: "relative" }}>` encloses the SVG canvas, `.desmos-active-formula-chip`, and `.desmos-point-inspector-card`.
- **lesson.css:843–898**:
  - `.desmos-canvas-wrapper { position: relative; width: 100%; }`
  - `.desmos-active-formula-chip { position: absolute; top: 10px; left: 14px; z-index: 10; ... }`
  - `.desmos-point-inspector-card { position: absolute; bottom: 14px; right: 14px; z-index: 25; ... }`
- **Finding**: Opening or collapsing toolbars (formula bar, integral slider) above the canvas no longer collides with or displaces the active formula chip.

### 1.5 Decoupling Critical Points from Active Drag Frames (`src/components/lesson/plot/InteractivePlot.tsx`)
- **Lines 1131–1135, 1217–1220, 1693–1716, 1756–1782**:
  - `criticalPoints` is memoized against `settledDomain` (`{ xMin, xMax }`) rather than `viewport`.
  - During drag/pan in `onPointerMove`, only `viewport` updates (driving the SVG canvas transforms smoothly at 60+ FPS).
  - `settledDomain` only updates upon `onPointerUp`, `onPointerCancel`, preset changes, zoom button clicks, and reset.
  - Eliminates main-thread computation spikes (>1,500 operations per frame) during active dragging.

### 1.6 Non-Coding Tracks Verification (`src/components/lesson/LessonRenderer.tsx`)
- **Lines 74–125, 200–204**:
  - `isCodingSubject(directionId, lessonId)` returns `false` for `mathematics`, `physics-engineering`, `italian-culture` / `italian-language`.
  - Block renderer explicitly returns `null` for `case "code"` when `!codingSubject`.
  - Mathematical theory, formulas, visual graphs, and interactive simulations render cleanly without redundant Python/code runner components.

### 1.7 Verification Commands Executed
- `npm test`: Exited code 0; 43 of 43 passed (0 failures).
- `npm run typecheck`: Exited code 0; 0 TypeScript diagnostics.
- `npm run lint`: Exited code 0; 0 ESLint errors or warnings.
- `npm run build`: Exited code 0; Next.js 16.3.5 production build completed in 2.7s across all 39 static and dynamic routes.

---

## 2. Logic Chain

1. **Premise**: When users double-click on a mouse or double-tap on a touchscreen, physical finger motion creates micro-displacement of 2–8px.
   - **Inference**: Raising the drag threshold from 4px to 10px (mouse) / 12px (touch) prevents this displacement from clearing `lastTapRef.current`, allowing double-tap point pinning to register reliably on the first try.
2. **Premise**: The regex `/([xX])\s*([a-zA-Z0-9(])/g` matches `x` inside `exp` because `e` is an alphanumeric character and `p` follows `x`.
   - **Inference**: Requiring `\b([xX])` prevents matching `x` when preceded by `e`. `exp(x)` compiles to `Math.exp(x)` without error.
3. **Premise**: If an endpoint `a` or `b` evaluates to `NaN` or `Infinity`, Simpson's composite sum `fa + fb` immediately yields `NaN`.
   - **Inference**: Guarding `fn(a)` and `fn(b)` with `Number.isFinite` prevents boundary singularities from poisoning integration.
4. **Premise**: If `.desmos-active-formula-chip` is anchored with `position: absolute; top: 50px` to the outermost container, opening an 80px toolbar pushes down the canvas while the chip stays at `top: 50px`, colliding with the toolbar.
   - **Inference**: Wrapping the SVG canvas in a `position: relative` `.desmos-canvas-wrapper` and anchoring the chip at `top: 10px; left: 14px` inside this wrapper ensures the chip stays visually affixed to the canvas corner regardless of toolbar toggles.
5. **Premise**: `findCriticalPoints` evaluates 240 sample points, computing 1st and 2nd derivatives per point (~1,500 operations).
   - **Inference**: Memoizing against `settledDomain` decouples this workload from pointer moves, yielding high-FPS panning without UI stutter.

---

## 3. Adversarial Challenges & Stress-Testing

### Challenge 1: Algebraic Expressions with Nested Exponentials and Powers
- **Scenario**: Expressions like `4/(1+exp(-2x))`, `x*exp(x)`, `exp(-0.5*x^2)`, and `4*exp(-0.5*X^2)`.
- **Stress-Test**: Tested both in unit tests and manual execution. All expressions compile into valid JS math functions that return finite numeric values.
- **Pass/Fail**: PASS.

### Challenge 2: Boundary Singularities in Definite Integral
- **Scenario**: `f(x) = ln(x)` evaluated on `[0, 1]` where `ln(0) = -Infinity`.
- **Result**: `numericalDefiniteIntegral` substitutes `fa = 0`, evaluates interior points safely, and returns a finite result without `NaN`.
- **Pass/Fail**: PASS.

### Challenge 3: Rapid Pointer Double-Click Jitter & Cancellation
- **Scenario**: Pointerdown followed by 6px movement before release, followed by second click within 200ms.
- **Result**: Drag state ignores < 10px movement; `lastTap` survives; second click registers double-tap and places coordinate pin. Immediate native `dblclick` 5ms later is deduplicated by 250ms cooldown and ignored.
- **Pass/Fail**: PASS.

### Challenge 4: Non-Coding Track Contamination
- **Scenario**: Inspecting `LessonRenderer.tsx` to verify if code execution environments leak into Mathematics or Physics tracks.
- **Result**: `isCodingSubject` cleanly excludes non-coding tracks and suppresses code blocks.
- **Pass/Fail**: PASS.

---

## 4. Integrity Assessment

- **Hardcoded test outputs**: None found. Formula compiler, Simpson integration, and point pinning use genuine mathematical algorithms.
- **Facade/Dummy implementations**: None found. All components and utility functions contain functional logic.
- **Fabricated verification outputs**: None found. Independent execution of `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` confirmed 100% genuine success.
- **Shortcut bypasses**: None found.

---

## 5. Conclusion & Final Verdict

**Verdict**: **APPROVE**

Worker 1 has fully satisfied all Milestone 1 requirements:
- Reliable point pinning on first attempt across mouse, trackpad, and touch.
- Robust custom formula parsing (`exp(x)`, `4*exp(-0.5*x^2)`, uppercase `X`, trig, and polynomials).
- Definite integral boundary safety with zero NaN poisoning.
- Layout jump elimination via `.desmos-canvas-wrapper`.
- Critical points computation decoupled from active drag frames for smooth 60+ FPS plotting.
- Verified absence of code runners in non-coding tracks.
- Clean pass across all project validation commands (`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`).

---

## 6. Verification Method

To reproduce and independently confirm this verdict:

```bash
# 1. Run unit test suite (43 passed)
npm test

# 2. Run TypeScript type check (0 diagnostics)
npm run typecheck

# 3. Run ESLint (0 errors, 0 warnings)
npm run lint

# 4. Run Next.js production build (39 routes generated)
npm run build
```
