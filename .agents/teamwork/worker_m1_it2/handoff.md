# Milestone 1 Iteration 2 Handoff Report: Unary Negation Before Exponentiation Fix

## 1. Observation

Direct observations prior to remediation:
1. `scripts/m1-adversarial-stress.ts` execution initially failed 5 tests:
   ```
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
   ✖ FAIL [compileCustomExpression] Rejection: Malformed operators +++ (x +++ 2)
      Input:    "x +++ 2"
      Expected: null
      Actual:   "Function"
   ✖ FAIL [numericalDerivative] Derivative: 1/x at x=0 (non-finite guard returns 0)
      Input:    0
      Expected: 0
      Actual:   100000000
   ```
2. In `src/lib/plot-math.ts:compileCustomExpression`, converting `^` to `**` produced `-x**2`. Under ECMAScript grammar, unary negation immediately before an exponentiation base throws:
   ```
   SyntaxError: Unary operator used immediately before exponentiation expression. Parenthesis must be used to disambiguate operator precedence
   ```
   The enclosing `try...catch` swallowed the error and returned `null`.
3. In `src/lib/plot-math.ts:numericalDerivative`, `fn(x)` was not guarded against non-finite values (such as `1/0 = Infinity`), while `numericalSecondDerivative` already guarded `y0 = fn(x)`.
4. In `src/lib/plot-math.ts:compileCustomExpression`, consecutive operator sequences like `+++` were parsed by JavaScript as repeated unary pluses (`x + + + 2`), bypassing rejection.

---

## 2. Logic Chain

1. **Premise 1**: In standard mathematics, negation before exponentiation denotes $-(\text{base}^{\text{exp}})$. For example, $-x^2$ at $x=3$ is $-9$, $-x^3$ at $x=2$ is $-8$, and $\exp(-x^2 / 2)$ at $x=0$ is $1$.
2. **Premise 2**: JavaScript disallows unary operators directly preceding `**` (`-x**2`), but permits parenthesized or multiplied forms such as `(-1 * (x**2))` and `-(x**2)`.
3. **Inference 1**: By introducing `transformUnaryPower` in `src/lib/plot-math.ts`, any unary `-` or `+` (occurring at the beginning of an expression, after `(`, `,`, or an operator `+`, `-`, `*`, `/`, `^`, `%`) immediately preceding a base followed by `^` is identified and transformed into `(${sign} * (${transformUnaryPower(fullPower)}))`.
4. **Inference 2**: The transformation accurately handles:
   - Atomic variables and constants: `-x^2`, `-x^3`, `-pi^2`, `-e^x`
   - Numeric bases: `-2^x`, `-2.5^x`
   - Parenthesized bases: `-(x)^2`, `-(x + 1)^2`
   - Function call bases: `-sin(x)^2`, `-cos(x)^2`
   - Nested function arguments: `exp(-x^2 / 2)`, `log(-x^2 + 10)`
   - Chained exponentiation: `-2^3^2` evaluates as $-(2^{3^2}) = -512$
   - Negative exponents: `-x^-1`, `-x^(-2)`, `2^-x`
   - Distinguishes inner negation: `(-x)^2` preserves inner negation and evaluates to $+9$ at $x=3$.
   - Distinguishes binary minus: `4 - x^2` retains binary subtraction and evaluates to $3$ at $x=1$ and $-5$ at $x=3$.
5. **Inference 3**: Checking `const y0 = fn(x); if (!Number.isFinite(y0)) return 0;` in `numericalDerivative` guarantees safety at vertical asymptotes like $1/x$ at $x=0$.
6. **Inference 4**: Adding validation for consecutive malformed operators (`\+{2,}`, `\-{3,}`, `[*\/^%]\s*[*\/^%]`, `[+\-*/^%]\s*[+\-*/^%]\s*[+\-*/^%]`) correctly rejects inputs such as `x +++ 2`.

---

## 3. Caveats

- Write boundaries were strictly respected: only `src/lib/plot-math.ts` and `tests/plot-math.test.ts` were edited.
- No third-party parser dependencies were introduced; implementation utilizes zero-dependency recursive scanning with parenthesis depth tracking.
- No caveats.

---

## 4. Conclusion

**Verdict: PASS / COMPLETE**

All objectives specified in the dispatch have been fully satisfied:
1. `src/lib/plot-math.ts:compileCustomExpression`:
   - Pre-processes unary negation immediately preceding an exponentiation base into valid JavaScript syntax.
   - Accurately compiles and evaluates expressions including `-x^2`, `-x^3`, `exp(-x^2 / 2)`, `-x^2 + 4`, `-(x)^2`, `-2^x`.
2. `tests/plot-math.test.ts`:
   - Added test suite `test("compileCustomExpression correctly evaluates unary negation before exponentiation")` asserting:
     - `compileCustomExpression("-x^2")(3) === -9`
     - `compileCustomExpression("-x^3")(2) === -8`
     - `compileCustomExpression("exp(-x^2 / 2)")(0) === 1`
     - `compileCustomExpression("-x^2 + 4")(1) === 3`
     - Additional assertions for `-(x)^2`, `-2^x`, `(-x)^2`, `2^-x`, `4 - x^2`, and operator rejection.
3. Verification results:
   - `npx tsx scripts/m1-adversarial-stress.ts`: 116 / 116 tests PASS (100%).
   - `npm test`: 44 / 44 tests PASS (100%).
   - `npm run typecheck`: 0 diagnostics.
   - `npm run lint`: 0 errors, 0 warnings.

---

## 5. Verification Method

To independently verify the implementation:

1. **Adversarial Stress Test**:
   ```powershell
   npx tsx scripts/m1-adversarial-stress.ts
   ```
   *Expected Output*: `Total tests executed: 116`, `Passed: 116`, `Failed / Bugs found: 0`.

2. **Automated Platform Test Suite**:
   ```powershell
   npm test
   ```
   *Expected Output*: All 44 test cases pass cleanly with zero failures.

3. **TypeScript Typecheck**:
   ```powershell
   npm run typecheck
   ```
   *Expected Output*: Exits with code 0, 0 diagnostics.

4. **ESLint Static Analysis**:
   ```powershell
   npm run lint
   ```
   *Expected Output*: Exits with code 0, 0 errors or warnings.
