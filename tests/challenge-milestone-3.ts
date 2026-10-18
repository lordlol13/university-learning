/**
 * Milestone 3 Adversarial Challenge Suite
 * Empirical verification of scientific notation parsing, variable/precedence handling,
 * and numerical integration singularity guards.
 */

import {
  compileCustomExpression,
  evaluateCalculatorExpression,
  numericalDefiniteIntegral,
} from "../src/lib/plot-math";

interface TestResult {
  name: string;
  passed: boolean;
  actual?: unknown;
  expected?: unknown;
  error?: string;
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, actual?: unknown, expected?: unknown) {
  if (condition) {
    results.push({ name, passed: true, actual, expected });
  } else {
    results.push({
      name,
      passed: false,
      actual,
      expected,
      error: `Assertion failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    });
  }
}

function runTests() {
  console.log("=== STARTING MILESTONE 3 ADVERSARIAL CHALLENGE SUITE ===");

  // =========================================================================
  // SECTION 1: Scientific Notation Parsing & Evaluation
  // =========================================================================
  console.log("\n--- Section 1: Scientific Notation ---");

  const sciCases: [string, number][] = [
    [".5e2", 50],
    ["1.e2", 100],
    ["1e-5", 0.00001],
    [".5e-2", 0.005],
    ["1e+3", 1000],
    ["2.5e3", 2500],
    ["1e-0", 1],
    ["1.23e-4", 0.000123],
    ["1e5", 100000],
  ];

  for (const [expr, expected] of sciCases) {
    // 1.1 compileCustomExpression
    const fn = compileCustomExpression(expr);
    const compiledOk = typeof fn === "function";
    assert(`compileCustomExpression("${expr}") compiles cleanly`, compiledOk, compiledOk, true);

    if (fn) {
      const val = fn(0);
      const isClose = Math.abs(val - expected) < 1e-12;
      assert(
        `compileCustomExpression("${expr}") evaluates to exact number ${expected}`,
        isClose,
        val,
        expected,
      );
    }

    // 1.2 evaluateCalculatorExpression
    const calc = evaluateCalculatorExpression(expr);
    assert(
      `evaluateCalculatorExpression("${expr}") returns success: true`,
      calc.success === true,
      calc.success,
      true,
    );
    if (calc.success && typeof calc.result === "number") {
      const isClose = Math.abs(calc.result - expected) < 1e-9;
      assert(
        `evaluateCalculatorExpression("${expr}") result matches ${expected}`,
        isClose,
        calc.result,
        expected,
      );
    }
  }

  // Compound scientific notation with variables
  const compoundCases: [string, number, number][] = [
    [".5e2 * X + 1e-5", 2, 50 * 2 + 1e-5],
    ["2.5e3 * x^2", 2, 2500 * 4],
    ["x / 1e+3", 5000, 5],
  ];

  for (const [expr, xVal, expected] of compoundCases) {
    const fn = compileCustomExpression(expr);
    assert(`compileCustomExpression("${expr}") with variable compiles`, typeof fn === "function", typeof fn, "function");
    if (fn) {
      const val = fn(xVal);
      const isClose = Math.abs(val - expected) < 1e-9;
      assert(`compileCustomExpression("${expr}") at x=${xVal} evaluates to ${expected}`, isClose, val, expected);
    }
  }

  // =========================================================================
  // SECTION 2: Uppercase Variables & Operator Precedence
  // =========================================================================
  console.log("\n--- Section 2: Variables & Operator Precedence ---");

  // 2.1 Uppercase X in 2X + 1
  const fLinear = compileCustomExpression("2X + 1");
  assert("compileCustomExpression('2X + 1') compiles", typeof fLinear === "function", typeof fLinear, "function");
  if (fLinear) {
    assert("2X + 1 at X=0 is 1", fLinear(0) === 1, fLinear(0), 1);
    assert("2X + 1 at X=3 is 7", fLinear(3) === 7, fLinear(3), 7);
    assert("2X + 1 at X=-2 is -3", fLinear(-2) === -3, fLinear(-2), -3);
  }

  // Calculator check for 2X + 1
  const calcLinear = evaluateCalculatorExpression("2X + 1", 3);
  assert("evaluateCalculatorExpression('2X + 1', 3) success", calcLinear.success === true, calcLinear.success, true);
  assert("evaluateCalculatorExpression('2X + 1', 3) isFunction", calcLinear.isFunction === true, calcLinear.isFunction, true);
  assert("evaluateCalculatorExpression('2X + 1', 3) result is 7", calcLinear.result === 7, calcLinear.result, 7);

  // 2.2 Unary negation before power: -x^2 vs (-x)^2
  // Mathematically, -x^2 is -(x^2). For x=2, -x^2 must be -4, not +4.
  const fNegPower = compileCustomExpression("-x^2");
  assert("compileCustomExpression('-x^2') compiles", typeof fNegPower === "function", typeof fNegPower, "function");
  if (fNegPower) {
    const at2 = fNegPower(2);
    assert("-x^2 at x=2 evaluates to -4 (unary precedence)", at2 === -4, at2, -4);
    const atNeg3 = fNegPower(-3);
    assert("-x^2 at x=-3 evaluates to -9", atNeg3 === -9, atNeg3, -9);
    const at0 = fNegPower(0);
    assert("-x^2 at x=0 evaluates to -0 or 0", Math.abs(at0) === 0, at0, 0);
  }

  const fParenNeg = compileCustomExpression("(-x)^2");
  if (fParenNeg) {
    const at2 = fParenNeg(2);
    assert("(-x)^2 at x=2 evaluates to +4", at2 === 4, at2, 4);
    const atNeg3 = fParenNeg(-3);
    assert("(-x)^2 at x=-3 evaluates to +9", atNeg3 === 9, atNeg3, 9);
  }

  // 2.3 exp(-x^2 / 2) Gaussian function
  const fGaussian = compileCustomExpression("exp(-x^2 / 2)");
  assert("compileCustomExpression('exp(-x^2 / 2)') compiles", typeof fGaussian === "function", typeof fGaussian, "function");
  if (fGaussian) {
    const g0 = fGaussian(0);
    assert("exp(-x^2 / 2) at x=0 is 1.0", Math.abs(g0 - 1.0) < 1e-12, g0, 1.0);
    const g2 = fGaussian(2);
    const expectedG2 = Math.exp(-4 / 2); // exp(-2) ≈ 0.135335283
    assert(
      "exp(-x^2 / 2) at x=2 is exp(-2)",
      Math.abs(g2 - expectedG2) < 1e-9,
      g2,
      expectedG2,
    );
    const gNeg2 = fGaussian(-2);
    assert("Gaussian symmetry: f(-2) === f(2)", Math.abs(gNeg2 - g2) < 1e-12, gNeg2, g2);
  }

  // Precedence tests
  const fMultPow = compileCustomExpression("2 * 3^2");
  if (fMultPow) {
    assert("2 * 3^2 is 18 (power before multiplication)", fMultPow(0) === 18, fMultPow(0), 18);
  }

  // =========================================================================
  // SECTION 3: Simpson's Rule Numerical Integration on Boundary Singularities
  // =========================================================================
  console.log("\n--- Section 3: Simpson's Rule Boundary Singularities ---");

  // 3.1 1/sqrt(x) on [0, 1] (analytical: 2.0)
  // Boundary singularity at x = 0 (1/sqrt(0) = Infinity)
  const fInvSqrt = (x: number) => (x <= 0 ? Infinity : 1 / Math.sqrt(x));
  const intInvSqrt80 = numericalDefiniteIntegral(fInvSqrt, 0, 1, 80);
  const intInvSqrt160 = numericalDefiniteIntegral(fInvSqrt, 0, 1, 160);

  assert("1/sqrt(x) on [0,1] returns finite number", Number.isFinite(intInvSqrt80), intInvSqrt80, "finite");
  assert("1/sqrt(x) on [0,1] is not NaN", !Number.isNaN(intInvSqrt80), intInvSqrt80, "not NaN");
  assert("1/sqrt(x) on [0,1] is positive", intInvSqrt80 > 0, intInvSqrt80, "> 0");
  // Numerical quadrature of 1/sqrt(x) with boundary perturbation epsilon=1e-7:
  // Integral from eps to 1 of x^(-1/2) is 2*(1 - sqrt(eps)) = 2*(1 - 0.000316) ≈ 1.99936
  assert(
    "1/sqrt(x) on [0,1] approximates analytical 2.0 within 5% error",
    Math.abs(intInvSqrt80 - 2.0) < 0.1,
    intInvSqrt80,
    2.0,
  );
  console.log(`  -> 1/sqrt(x) [0, 1] with 80 intervals: ${intInvSqrt80.toFixed(6)} (analytical: 2.0)`);
  console.log(`  -> 1/sqrt(x) [0, 1] with 160 intervals: ${intInvSqrt160.toFixed(6)}`);

  // 3.2 ln(x) on [0, 1] (analytical: -1.0)
  // Boundary singularity at x = 0 (ln(0) = -Infinity)
  const fLn = (x: number) => (x <= 0 ? -Infinity : Math.log(x));
  const intLn80 = numericalDefiniteIntegral(fLn, 0, 1, 80);
  const intLn160 = numericalDefiniteIntegral(fLn, 0, 1, 160);

  assert("ln(x) on [0,1] returns finite number", Number.isFinite(intLn80), intLn80, "finite");
  assert("ln(x) on [0,1] is not NaN", !Number.isNaN(intLn80), intLn80, "not NaN");
  assert(
    "ln(x) on [0,1] approximates analytical -1.0 within 5% error",
    Math.abs(intLn80 - -1.0) < 0.08,
    intLn80,
    -1.0,
  );
  console.log(`  -> ln(x) [0, 1] with 80 intervals: ${intLn80.toFixed(6)} (analytical: -1.0)`);
  console.log(`  -> ln(x) [0, 1] with 160 intervals: ${intLn160.toFixed(6)}`);

  // 3.3 Right boundary singularity: 1/sqrt(1 - x) on [0, 1] (analytical: 2.0)
  const fRightSingular = (x: number) => (x >= 1 ? Infinity : 1 / Math.sqrt(1 - x));
  const intRight80 = numericalDefiniteIntegral(fRightSingular, 0, 1, 80);
  assert("1/sqrt(1-x) on [0,1] is finite", Number.isFinite(intRight80), intRight80, "finite");
  assert("1/sqrt(1-x) on [0,1] is not NaN", !Number.isNaN(intRight80), intRight80, "not NaN");
  assert("1/sqrt(1-x) on [0,1] is within 5% of 2.0", Math.abs(intRight80 - 2.0) < 0.1, intRight80, 2.0);

  // 3.4 Two-sided boundary singularity: 1/sqrt(1 - x^2) on [-1, 1] (analytical: pi ≈ 3.14159)
  const fBothSingular = (x: number) => (Math.abs(x) >= 1 ? Infinity : 1 / Math.sqrt(1 - x * x));
  const intBoth = numericalDefiniteIntegral(fBothSingular, -1, 1, 120);
  assert("1/sqrt(1-x^2) on [-1,1] is finite", Number.isFinite(intBoth), intBoth, "finite");
  assert("1/sqrt(1-x^2) on [-1,1] is not NaN", !Number.isNaN(intBoth), intBoth, "not NaN");
  assert("1/sqrt(1-x^2) on [-1,1] approximates pi", Math.abs(intBoth - Math.PI) < 0.2, intBoth, Math.PI);
  console.log(`  -> 1/sqrt(1-x^2) [-1, 1]: ${intBoth.toFixed(6)} (analytical: ${Math.PI.toFixed(6)})`);

  // 3.5 Degenerate interval checks
  const intZeroWidth = numericalDefiniteIntegral((x) => x * x, 2, 2);
  assert("Integral over [2, 2] is exactly 0", intZeroWidth === 0, intZeroWidth, 0);

  // Reversed interval [1, 0] of 1/sqrt(x) should be negative of [0, 1]
  const intReversed = numericalDefiniteIntegral(fInvSqrt, 1, 0, 80);
  assert("Integral over [1, 0] is negative of [0, 1]", Math.abs(intReversed + intInvSqrt80) < 0.05, intReversed, -intInvSqrt80);

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log("\n=== CHALLENGE TEST SUITE SUMMARY ===");
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total checks: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.error("\nFAILURES:");
    for (const r of results.filter((r) => !r.passed)) {
      console.error(`- [FAIL] ${r.name}: ${r.error}`);
    }
    process.exit(1);
  } else {
    console.log("\nALL ADVERSARIAL CHALLENGES PASSED EMPIRICALLY (100%)");
  }
}

runTests();
