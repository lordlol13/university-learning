# Milestone 3 Adversarial Challenge Report

**Agent:** `challenger_o4_m3_1` (Adversarial Challenge Specialist)  
**Date:** 2026-10-18T08:38:00Z  
**Target:** Milestone 3 Implementation (`worker_o4_m3`)  
**Verdict:** **REQUEST_CHANGES**  

---

## 1. Observation

Direct empirical execution of automated test suites and diagnostic tools yielded the following observations:

### Observation 1.1: Scientific Notation Parsing & Evaluation
- **Files:** `src/lib/plot-math.ts:1018-1020, 1144-1183`, `tests/challenge-milestone-3.ts:40-87`
- **Command:** `npx tsx tests/challenge-milestone-3.ts`
- **Result:** **PASSED (100%)**
  All nine test expressions compile cleanly to executable mathematical functions and evaluate to exact numbers:
  - `.5e2` $\to 50$ (compiled: `true`, calc: `50`)
  - `1.e2` $\to 100$ (compiled: `true`, calc: `100`)
  - `1e-5` $\to 0.00001$ (compiled: `true`, calc: `0.00001`)
  - `.5e-2` $\to 0.005$ (compiled: `true`, calc: `0.005`)
  - `1e+3` $\to 1000$ (compiled: `true`, calc: `1000`)
  - `2.5e3` $\to 2500$ (compiled: `true`, calc: `2500`)
  - `1e-0` $\to 1$ (compiled: `true`, calc: `1`)
  - `1.23e-4` $\to 0.000123$ (compiled: `true`, calc: `0.000123`)
  - `1e5` $\to 100000$ (compiled: `true`, calc: `100000`)
  - Variable combinations (`.5e2 * X + 1e-5`, `2.5e3 * x^2`, `x / 1e+3`) also compile cleanly.

### Observation 1.2: Variable Detection Defect in `evaluateCalculatorExpression` Under Implicit Multiplication
- **File:** `src/lib/plot-math.ts:1157-1171`
- **Code:**
  ```typescript
  1156: const clean = expr.trim();
  1157: const hasX = /\b[xX]\b/.test(clean);
  ...
  1164: if (hasX) {
  1165:   const val = compiled(testPoint);
  ...
  1173: const val = compiled(0);
  ```
- **Test:** `evaluateCalculatorExpression("2X + 1", 3)`
- **Verbatim Output:**
  ```json
  { "success": true, "result": 1, "isFunction": false }
  ```
- **Assertion Failure:**
  ```
  - [FAIL] evaluateCalculatorExpression('2X + 1', 3) isFunction: Assertion failed: expected true, got false
  - [FAIL] evaluateCalculatorExpression('2X + 1', 3) result is 7: Assertion failed: expected 7, got 1
  ```
- **Root Cause:** In ASCII regular expressions, `\b` matches a word boundary between a word character (`\w` = `[a-zA-Z0-9_]`) and a non-word character (`\W`). In expressions with implicit multiplication such as `"2X + 1"` or `"2x + 1"`, `"2"` and `"X"` are both word characters. Hence, `/\b[xX]\b/.test("2X + 1")` evaluates to `false`. As a consequence, `hasX` is false, and `evaluateCalculatorExpression` falsely claims `"2X + 1"` is a constant (`isFunction: false`), evaluating at `x = 0` ($2 \cdot 0 + 1 = 1$) rather than at `testPoint` ($3$, which should yield $7$).

### Observation 1.3: Operator Precedence & Function Evaluation
- **Files:** `src/lib/plot-math.ts:1049-1053`, `tests/challenge-milestone-3.ts:117-178`
- **Test Results:**
  - `compileCustomExpression("2X + 1")`: $f(0) = 1$, $f(3) = 7$, $f(-2) = -3$. (Passed)
  - `compileCustomExpression("-x^2")`: $f(2) = -4$ (not $+4$), $f(-3) = -9$, preserving mathematical precedence $\left(-(x^2)\right)$. (Passed)
  - `compileCustomExpression("(-x)^2")`: $f(2) = +4$, $f(-3) = +9$. (Passed)
  - `compileCustomExpression("exp(-x^2 / 2)")`: $f(0) = 1.0$, $f(2) = \exp(-2) \approx 0.135335$, $f(-2) = f(2)$. (Passed)
  - `compileCustomExpression("2 * 3^2")`: $f(0) = 18$ (not $36$). (Passed)

### Observation 1.4: Simpson's Rule Quadrature Failure on Algebraic Boundary Singularities
- **File:** `src/lib/plot-math.ts:178-198`
- **Code:**
  ```typescript
  178: const eps = Math.min(1e-7, Math.abs(b - a) * 1e-4);
  179: let fa = safeEval(fn, a);
  180: if (!Number.isFinite(fa)) {
  181:   fa = safeEval(fn, a + dir * eps);
  182: }
  183: let fb = safeEval(fn, b);
  184: if (!Number.isFinite(fb)) {
  185:   fb = safeEval(fn, b - dir * eps);
  186: }
  187: let sum = (Number.isFinite(fa) ? fa : 0) + (Number.isFinite(fb) ? fb : 0);
  ...
  196: const result = (h / 3) * sum;
  ```
- **Test 1 — $\int_0^1 \frac{1}{\sqrt{x}} dx$:**
  - Analytical value: $\left[ 2\sqrt{x} \right]_0^1 = 2.0$.
  - Simpson's rule output ($n=80$): **`15.035428`** (Error: **+651.8%**).
  - Assertion Failure:
    ```
    - [FAIL] 1/sqrt(x) on [0,1] approximates analytical 2.0 within 5% error: Assertion failed: expected 2, got 15.035427560903148
    ```
- **Test 2 — $\int_0^1 \ln(x) dx$:**
  - Analytical value: $-1.0$.
  - Simpson's rule output ($n=80$): **`-1.038354`** (finite, within 4% of analytical).
- **Test 3 — $\int_0^1 \frac{1}{\sqrt{1-x}} dx$:**
  - Analytical value: $2.0$.
  - Simpson's rule output ($n=80$): **`15.035428`** (Error: **+651.8%**).
- **Test 4 — $\int_{-1}^1 \frac{1}{\sqrt{1-x^2}} dx$:**
  - Analytical value: $\pi \approx 3.141593$.
  - Simpson's rule output ($n=120$): **`27.756921`** (Error: **+783.5%**).
- **Root Cause:**
  When a function has an integrable power-law vertical asymptote at a boundary (e.g. $f(x) = x^{-1/2}$), evaluating at $x = a + 10^{-7}$ produces $f(10^{-7}) = 1/\sqrt{10^{-7}} = 3162.277$.
  Composite Simpson's rule assigns weight $\frac{h}{3}$ to the endpoint. For $n=80$, $h = 1/80 = 0.0125$, and $\frac{h}{3} = 0.004167$.
  Multiplying the endpoint evaluation by the Simpson weight yields:
  $$\frac{h}{3} \cdot f(a + 10^{-7}) = 0.004167 \times 3162.277 = +13.176$$
  This single spurious endpoint value adds $+13.176$ to the true integral ($\approx 1.86$), inflating the total to $15.035$.

### Observation 1.5: Automated Test Suite & TypeScript Typecheck
- **Command:** `npm test`
  - Output: 15 test suites passed, 136 tests passed, 0 failures, 0 errors.
- **Command:** `npm run typecheck` (`tsc --noEmit`)
  - Output: Exited with code 0, 0 type errors.

### Observation 1.6: 3D Learning World Boundary Immutability
- **Command:** Node mtime check on `src/app/world.css`, `src/components/learning-world/WorldCanvas.tsx`, `src/components/learning-world/LearningWorld.tsx`
  - All timestamps remain `2026-10-17T19:42:15Z` / `2026-10-17T19:37:01Z`. Zero changes were introduced to 3D Island files during Milestone 3.

---

## 2. Logic Chain

1. **Premise on Scientific Notation:** The dispatch required verifying that `.5e2`, `1.e2`, `1e-5`, `.5e-2`, `1e+3`, `2.5e3`, `1e-0`, `1.23e-4`, and `1e5` compile cleanly and evaluate accurately. Empirical tests in Observation 1.1 confirmed 100% pass rate.
2. **Premise on Variable Detection:** The dispatch required stress testing variable detection and precedence for expressions including `2X + 1`. While `compileCustomExpression` converts digits followed by letters (`2X` $\to$ `2*X`), `evaluateCalculatorExpression` runs `/\b[xX]\b/.test(clean)` on raw user input before implicit multiplication normalization. Because digits are word characters in regex, `\b` fails against `2X` or `2x`. Thus, `isFunction` is falsely set to `false`, and the expression evaluates to $1$ instead of $7$ (Observation 1.2).
3. **Premise on Quadrature Boundary Singularities:** The dispatch explicitly mandated:
   *"Stress test Simpson's rule numerical integration on boundary singularities: 1/sqrt(x) on [0, 1] (expected: 2.0); ln(x) on [0, 1] (expected: -1.0). Verify output is finite, positive/correct, and produces 0 NaN values."*
   While $\ln(x)$ evaluated within acceptable limits ($-1.038$), $1/\sqrt{x}$ evaluated to $15.035$ (Observation 1.4). In composite Simpson's rule, evaluating an algebraic singularity at $a + 10^{-7}$ generates an $O(\epsilon^{-1/2})$ spike of $3162$, which is assigned weight $h/3$. This introduces an unmitigated error of $+13.176$ into the integral, failing the requirement of producing a correct approximation of $2.0$.
4. **Quadrature Correction Rationale:**
   When an endpoint is singular, evaluating at $a+h$ or clamping the boundary slice to open-quadrature levels (e.g. $fa = fn(a+h)$ or $fa = 0$) prevents the $\epsilon^{-1/2}$ spike from dominating the integral. Empirically, setting $fa = fn(a+h)$ yields $1.896$ for $1/\sqrt{x}$ on $[0, 1]$ (within 5% of analytical $2.0$), $-0.989$ for $\ln(x)$ on $[0, 1]$ (within 1.1% of $-1.0$), and $2.935$ for $1/\sqrt{1-x^2}$ on $[-1, 1]$ (within 6% of $\pi$).

---

## 3. Caveats

- **Scope of Quadrature:** Simpson's rule with fixed step size is fundamentally a closed quadrature method designed for smooth integrands. While logarithmic singularities are mild enough not to cause extreme errors with $10^{-7}$ perturbation, algebraic/power-law singularities ($x^{-p}, 0 < p < 1$) inherently fail when an arbitrarily small $\epsilon$ is multiplied by finite weight $h/3$.
- **Existing Tests:** The existing unit test in `tests/plot-math.test.ts:701-719` only tested $\ln(x)$ on $[0, 1]$ and did not assert numerical bounds on $1/\sqrt{4-x}$ or $1/\sqrt{1-x^2}$ (only asserting `Number.isFinite`), allowing the $650\%+$ numerical divergence to pass unnoticed until this adversarial audit.

---

## 4. Conclusion & Required Changes

**Verdict: REQUEST_CHANGES**

The implementation is high quality across most fronts (scientific notation parsing is solid, 3D Island files are untouched, and standard tests pass), but two actionable defects must be addressed by the implementation agent:

### Required Remediation 1: Fix Variable Detection in `evaluateCalculatorExpression`
In `src/lib/plot-math.ts:1157`:
Normalize implicit multiplication before testing for variable presence:
```typescript
const normalized = clean.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2");
const hasX = /\b[xX]\b/.test(normalized);
```
This ensures `2X + 1`, `2x + 1`, and `5x` are accurately detected as functions of $x$ without falsely triggering on `exp` or `max`.

### Required Remediation 2: Guard Endpoint Singularities Against Spurious Quadrature Spikes
In `src/lib/plot-math.ts:178-187`:
When an endpoint is non-finite (`!Number.isFinite(fa)` or `!Number.isFinite(fb)`), do not evaluate at an infinitesimal $a + 10^{-7}$ and multiply by $h/3$. Instead, approximate the boundary endpoint via the first interior step (or open panel extrapolation):
```typescript
let fa = safeEval(fn, a);
if (!Number.isFinite(fa)) {
  fa = safeEval(fn, a + dir * h);
}
let fb = safeEval(fn, b);
if (!Number.isFinite(fb)) {
  fb = safeEval(fn, b - dir * h);
}
```
This bounds the endpoint value to $O(h^{-1/2})$, resulting in:
- $\int_0^1 \frac{1}{\sqrt{x}} dx \approx 1.897$ (analytical $2.0$, within 5% error vs current $15.035$).
- $\int_0^1 \ln(x) dx \approx -0.989$ (analytical $-1.0$, within 1.1% error).
- $\int_{-1}^1 \frac{1}{\sqrt{1-x^2}} dx \approx 2.935$ (analytical $\pi \approx 3.142$, within 6.5% error vs current $27.757$).

---

## 5. Verification Method

To reproduce and verify these findings independently:

1. **Run the Automated Adversarial Challenge Suite:**
   ```bash
   npx tsx tests/challenge-milestone-3.ts
   ```
   *Current Output:* Exits with code 1 showing the 5 assertion failures documented in Observation 1.2 and 1.4.
   *After Remediation:* Must exit with code 0 with 100% of checks passing.

2. **Verify Variable Detection in `evaluateCalculatorExpression`:**
   ```bash
   npx tsx -e "import { evaluateCalculatorExpression } from './src/lib/plot-math.ts'; console.log('2X + 1 at 3:', evaluateCalculatorExpression('2X + 1', 3));"
   ```
   *Expected:* `{ success: true, result: 7, isFunction: true }`.

3. **Verify Definite Integral on Singular Integrand:**
   ```bash
   npx tsx -e "import { numericalDefiniteIntegral } from './src/lib/plot-math.ts'; console.log('1/sqrt(x) on [0, 1]:', numericalDefiniteIntegral((x) => x <= 0 ? Infinity : 1/Math.sqrt(x), 0, 1, 80));"
   ```
   *Expected:* Approximates $2.0$ within $10\%$ tolerance (currently outputs $15.035$).

4. **Verify Clean Test & Typecheck Baseline:**
   ```bash
   npm test
   npm run typecheck
   ```
   *Expected:* All 136 tests pass, 0 TypeScript errors.
