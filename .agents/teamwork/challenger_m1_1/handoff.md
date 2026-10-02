# Milestone 1 Adversarial Challenge Report: Desmos Graphics & Interactive Plotting Verification

## 1. Observation

An empirical stress-testing suite (`scripts/m1-adversarial-stress.ts`) was authored and executed against `src/lib/plot-math.ts` and `src/components/lesson/plot/InteractivePlot.tsx`, executing 116 test conditions across 4 primary domains.

### Obs 1: Parser Rejection of Unary Negation on Exponents (`-x^2`, `-x^3`, `exp(-x^2 / 2)`)
- **File**: `src/lib/plot-math.ts:528-574`
- **Observed Failure**:
  ```bash
  $ npx tsx scripts/m1-adversarial-stress.ts
  ✖ FAIL [compileCustomExpression] Exponent / Unary: -x^2
     Input:    "-x^2"
     Expected: "Function evaluating to -9"
     Actual:   null
  ✖ FAIL [compileCustomExpression] Exponent / Unary: -x^3
     Input:    "-x^3"
     Expected: "Function evaluating to -8"
     Actual:   null
  ✖ FAIL [compileCustomExpression] Nested: exp(-x^2 / 2)
     Input:    "exp(-x^2 / 2)"
     Expected: "Function"
     Actual:   null
  ```
- **Root Cause**:
  In `compileCustomExpression`, line 529 converts exponentiation using:
  ```ts
  // 2. Power operator: ^ -> **
  s = s.replace(/\^/g, "**");
  ```
  When the expression contains a unary minus directly preceding a power base (such as `-x^2` or inside `exp(-x^2 / 2)`), `s` becomes `-x**2`.
  Under JavaScript / ECMAScript (ES2016+ specification §12.6.3), unary expressions are explicitly prohibited as the base of an exponentiation operator `**`:
  ```
  SyntaxError: Unary operator used immediately before exponentiation expression. Parenthesis must be used to disambiguate operator precedence
  ```
  Because `new Function(...)` throws a `SyntaxError`, the enclosing `try...catch` in `compileCustomExpression` (lines 594-596) catches the error and silently returns `null`.
  In `InteractivePlot.tsx:1341-1348`, this causes the custom formula submit handler to set:
  ```ts
  setFormulaError("Invalid expression syntax. Check parentheses and variables.");
  ```
  Everyday algebraic and calculus equations like downward-facing parabolas ($y = -x^2$, $y = -x^2 + 4$) and standard Gaussian bell curves ($y = \exp(-x^2 / 2)$) are rejected as invalid syntax.

### Obs 2: Successful Verification of Double-Tap & Pointer Micro-Jitter Tolerance
- **File**: `src/components/lesson/plot/InteractivePlot.tsx:1260-1285, 1648-1690, 1755-1795`
- **Observed Behavior**:
  - Pointer micro-jitter tolerance (10px for mouse, 12px for touch) successfully ignores natural hand tremors (tested with 6px mouse jitter and 10.6px touch jitter). `lastTapRef.current` is preserved and `d.hasMoved` remains `false`.
  - Double-tap detection triggers point pinning on the very first attempt within 480ms and 32px tolerance.
  - Real drags (intentional movement $\ge 10\text{px}$) correctly set `d.hasMoved = true` and cancel `lastTapRef.current`.
  - Deduplication cooldown (250ms / 35px) cleanly filters out rapid duplicate events (e.g. browser native `dblclick` firing ~5ms after the second `pointerup`), preventing immediate point unpinning.
  - Coordinate guards (`!Number.isFinite(graphX) || !Number.isFinite(graphY)`) reject `NaN` and `Infinity` coordinates cleanly without state corruption.

### Obs 3: Successful Verification of Definite Integral Boundary Singularities
- **File**: `src/lib/plot-math.ts:145-167`
- **Observed Behavior**:
  - Zero-width intervals ($[5, 5]$ and sub-epsilon $< 10^{-9}$) evaluate to exactly $0$.
  - Inverted bounds ($[2, 0]$ and $[\pi, 0]$) correctly compute the signed negative integral (e.g. $\int_2^0 3x^2 dx = -8$).
  - Boundary singularities ($\int_0^1 \ln(x) dx$, $\int_0^1 \frac{1}{\sqrt{x}} dx$, and $\int_0^2 \frac{1}{\sqrt{2-x}} dx$) are safely handled by the `Number.isFinite(fn(a))` guards, preventing `NaN` accumulator poisoning.
  - Interior singularities ($\int_{-1}^1 \frac{1}{x} dx$, $\int_0^2 \frac{1}{x-1} dx$, $\int_0^\pi \tan(x) dx$) do not crash or produce `NaN`.

### Obs 4: Successful Verification of Critical Points and Asymptotes
- **File**: `src/lib/plot-math.ts:173-393`
- **Observed Behavior**:
  - Detected all 3 roots, local maximum ($x \approx -1, y \approx 2$), local minimum ($x \approx 1, y \approx -2$), and inflection point ($x \approx 0$) on cubic polynomial $x^3 - 3x$.
  - Flat saddle points ($x^3$ at $x=0$) produced zero false extrema.
  - Constant function ($f(x) = 4$) produced zero false extrema and zero false roots.
  - Vertical asymptote ($f(x) = 1/x$) produced zero false extrema and zero false roots across $[-3, 3]$ due to the continuity jump guard `Math.abs(y2 - y1) < 200 * (dx + 1)` and slope threshold `Math.abs(slope) < 0.25`.
  - Degenerate domains ($[5, -5]$) return empty arrays safely.

---

## 2. Logic Chain

1. **Premise 1**: In standard mathematics and secondary/university curricula, $-x^2$ denotes $-(x^2)$ (negation of $x^2$). Students routinely input formulas such as $y = -x^2$, $y = -x^2 + 4$, or $y = \exp(-x^2 / 2)$.
2. **Observation**: `compileCustomExpression("-x^2")` and `compileCustomExpression("exp(-x^2 / 2)")` return `null`.
3. **Inference 1**: In JavaScript, `-x**2` violates syntax grammar (UnaryExpression before ExponentiationExpression), throwing a `SyntaxError`. Because `compileCustomExpression` merely replaces `^` with `**` without disambiguating leading unary negation, the evaluation throws and is caught by the fallback returning `null`.
4. **Premise 2**: A graphing calculator that fails to plot the canonical downward-opening parabola $-x^2$ or Gaussian exponential $\exp(-x^2/2)$ violates core usability requirements for the Mathematics, AI/ML, and Physics tracks.
5. **Inference 2**: `compileCustomExpression` requires a pre-processing step that transforms unary negation on powers (e.g. `-x^2`) into valid JavaScript syntax (e.g. `(-1 * x**2)` or `-(x**2)`).

---

## 3. Caveats

- All other areas of Milestone 1 (pointer micro-jitter tolerance, double-tap window, deduplication cooldown, canvas relative positioning, definite integral endpoint guards, and critical points detection) are robust, well-architected, and fully verified.
- The defect is isolated to `compileCustomExpression` in `src/lib/plot-math.ts` when handling unary negation immediately before an exponentiation base.

---

## 4. Conclusion

**Verdict: REQUEST_CHANGES**

Milestone 1 cannot be approved in its current state because `compileCustomExpression` rejects standard mathematical formulas containing negated powers (`-x^2`, `-x^3`, `exp(-x^2/2)`).

### Required Remediations for Milestone 1 Worker:
1. In `src/lib/plot-math.ts`, update `compileCustomExpression` so that unary negation preceding an exponentiation base is converted into valid syntax (e.g. `(-1 * <base>**<exp>)` or `-(<base>**<exp>)`) before passing to `new Function(...)`.
   Specifically, handle patterns where `-` is at the beginning of the expression, follows an open parenthesis, or follows an arithmetic operator/comma before a power base.
2. In `tests/plot-math.test.ts`, add test assertions verifying:
   - `compileCustomExpression("-x^2")` evaluates to `-9` at `x=3`.
   - `compileCustomExpression("-x^3")` evaluates to `-8` at `x=2`.
   - `compileCustomExpression("exp(-x^2 / 2)")` evaluates to `1` at `x=0`.
   - `compileCustomExpression("-x^2 + 4")` evaluates to `3` at `x=1`.
3. Run `npm test` and `npx tsx scripts/m1-adversarial-stress.ts` to confirm 100% pass rate.

---

## 5. Verification Method

To reproduce the bug and verify the fix:

1. **Direct Node/TSX Expression Reproduction**:
   ```bash
   npx tsx -e "import { compileCustomExpression } from './src/lib/plot-math.ts'; console.log('-x^2 =>', compileCustomExpression('-x^2')); console.log('exp(-x^2/2) =>', compileCustomExpression('exp(-x^2/2)'));"
   ```
   *Current Output (Bug)*:
   ```
   -x^2 => null
   exp(-x^2/2) => null
   ```
   *Required Output (After Fix)*:
   ```
   -x^2 => [Function (anonymous)]
   exp(-x^2/2) => [Function (anonymous)]
   ```

2. **Execute Full Adversarial Stress Harness**:
   ```bash
   npx tsx scripts/m1-adversarial-stress.ts
   ```
   *Expected Output after fix*: All 116 tests pass with 0 failures.

3. **Run Platform Automated Test Suite**:
   ```bash
   npm test
   ```
   *Expected Output*: All test suites pass cleanly.
