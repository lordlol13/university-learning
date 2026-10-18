/**
 * Milestone 3 Iteration 2 Adversarial Empirical Verification Suite
 * Stress-testing:
 * 1. evaluateCalculatorExpression on "2X + 1" and comprehensive algebraic variants
 * 2. Simpson's rule endpoint quadrature on boundary singularities & antisymmetry
 */

import {
  evaluateCalculatorExpression,
  numericalDefiniteIntegral,
} from "../src/lib/plot-math";

interface Assertion {
  category: string;
  description: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
  error?: string;
}

const assertions: Assertion[] = [];

function check(
  category: string,
  description: string,
  condition: boolean,
  actual: unknown,
  expected: unknown,
) {
  if (condition) {
    assertions.push({ category, description, passed: true, actual, expected });
  } else {
    assertions.push({
      category,
      description,
      passed: false,
      actual,
      expected,
      error: `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    });
  }
}

console.log("=================================================================");
console.log("MILESTONE 3 ITERATION 2 EMPIRICAL ADVERSARIAL CHALLENGE HARNESS");
console.log("=================================================================\n");

// -----------------------------------------------------------------------------
// PART 1: evaluateCalculatorExpression("2X + 1", 3) & Variants
// -----------------------------------------------------------------------------
console.log("--- PART 1: evaluateCalculatorExpression Variants & Precedence ---");

// Core requirement from parent:
// "2X + 1" at x = 3 -> { success: true, result: 7, isFunction: true }
const coreRes = evaluateCalculatorExpression("2X + 1", 3);
check("Part 1 Core", "2X + 1 at x=3: success is true", coreRes.success === true, coreRes.success, true);
check("Part 1 Core", "2X + 1 at x=3: isFunction is true", coreRes.isFunction === true, coreRes.isFunction, true);
check("Part 1 Core", "2X + 1 at x=3: result is 7", coreRes.result === 7, coreRes.result, 7);

// Variants specified by parent: "2x", "3X - 4", "-2X", "0.5X", "X^2", "2(X+1)"
const variants: Array<{
  expr: string;
  x: number;
  expectedResult: number;
  expectedIsFunction: boolean;
}> = [
  { expr: "2x", x: 3, expectedResult: 6, expectedIsFunction: true },
  { expr: "2X", x: 3, expectedResult: 6, expectedIsFunction: true },
  { expr: "3X - 4", x: 3, expectedResult: 5, expectedIsFunction: true },
  { expr: "3x - 4", x: 3, expectedResult: 5, expectedIsFunction: true },
  { expr: "-2X", x: 3, expectedResult: -6, expectedIsFunction: true },
  { expr: "-2x", x: 3, expectedResult: -6, expectedIsFunction: true },
  { expr: "0.5X", x: 3, expectedResult: 1.5, expectedIsFunction: true },
  { expr: "0.5x", x: 3, expectedResult: 1.5, expectedIsFunction: true },
  { expr: ".5X", x: 3, expectedResult: 1.5, expectedIsFunction: true },
  { expr: "X^2", x: 3, expectedResult: 9, expectedIsFunction: true },
  { expr: "x^2", x: 3, expectedResult: 9, expectedIsFunction: true },
  { expr: "2(X+1)", x: 3, expectedResult: 8, expectedIsFunction: true },
  { expr: "2(x+1)", x: 3, expectedResult: 8, expectedIsFunction: true },
  // Additional adversarial cases
  { expr: "-2X + 5", x: 3, expectedResult: -1, expectedIsFunction: true },
  { expr: "2X^2", x: 3, expectedResult: 18, expectedIsFunction: true },
  { expr: "-X^2", x: 3, expectedResult: -9, expectedIsFunction: true },
  { expr: "(-X)^2", x: 3, expectedResult: 9, expectedIsFunction: true },
  { expr: "3(X - 2) + 4", x: 3, expectedResult: 7, expectedIsFunction: true },
  { expr: "X / 2", x: 4, expectedResult: 2, expectedIsFunction: true },
  { expr: "10 - 2X", x: 3, expectedResult: 4, expectedIsFunction: true },
  { expr: "4X", x: -2.5, expectedResult: -10, expectedIsFunction: true },
  // Constant expressions (should have isFunction: false)
  { expr: "2 * 3 + 1", x: 3, expectedResult: 7, expectedIsFunction: false },
  { expr: "exp(0)", x: 3, expectedResult: 1, expectedIsFunction: false },
  { expr: "1e5", x: 3, expectedResult: 100000, expectedIsFunction: false },
  { expr: ".5e2", x: 3, expectedResult: 50, expectedIsFunction: false },
];

for (const v of variants) {
  const res = evaluateCalculatorExpression(v.expr, v.x);
  check("Part 1 Variants", `${v.expr} at x=${v.x} success`, res.success === true, res.success, true);
  check("Part 1 Variants", `${v.expr} at x=${v.x} isFunction`, res.isFunction === v.expectedIsFunction, res.isFunction, v.expectedIsFunction);
  if (res.success && typeof res.result === "number") {
    const diff = Math.abs(res.result - v.expectedResult);
    check(
      "Part 1 Variants",
      `${v.expr} at x=${v.x} result equals ${v.expectedResult}`,
      diff < 1e-9,
      res.result,
      v.expectedResult,
    );
  }
}

// -----------------------------------------------------------------------------
// PART 2: Simpson's Rule Endpoint Quadrature on Boundary Singularities
// -----------------------------------------------------------------------------
console.log("\n--- PART 2: Simpson's Rule Boundary Singularities & Antisymmetry ---");

// Test 2.1: 1/sqrt(x) over [0, 1]
// Analytical value: 2.0. Target: ~1.912 (< 5% error)
const fInvSqrt = (x: number) => (x <= 0 ? Infinity : 1 / Math.sqrt(x));
const intInvSqrt = numericalDefiniteIntegral(fInvSqrt, 0, 1, 80);
const errInvSqrt = (Math.abs(intInvSqrt - 2.0) / 2.0) * 100;
console.log(`  [0, 1] 1/sqrt(x) = ${intInvSqrt.toFixed(6)} (analytical: 2.0, error: ${errInvSqrt.toFixed(2)}%)`);

check("Part 2 Quadrature", "1/sqrt(x) [0, 1] is finite", Number.isFinite(intInvSqrt), intInvSqrt, "finite");
check("Part 2 Quadrature", "1/sqrt(x) [0, 1] is not NaN", !Number.isNaN(intInvSqrt), intInvSqrt, "not NaN");
check("Part 2 Quadrature", "1/sqrt(x) [0, 1] evaluates to ~1.912 (within 0.05)", Math.abs(intInvSqrt - 1.912) < 0.05, intInvSqrt, "~1.912");
check("Part 2 Quadrature", "1/sqrt(x) [0, 1] < 5% error from analytical 2.0", errInvSqrt < 5.0, errInvSqrt, "< 5.0%");

// Test 2.2: ln(x) over [0, 1]
// Analytical value: -1.0. Target: ~ -0.992 (< 5% error)
const fLn = (x: number) => (x <= 0 ? -Infinity : Math.log(x));
const intLn = numericalDefiniteIntegral(fLn, 0, 1, 80);
const errLn = (Math.abs(intLn - -1.0) / 1.0) * 100;
console.log(`  [0, 1] ln(x) = ${intLn.toFixed(6)} (analytical: -1.0, error: ${errLn.toFixed(2)}%)`);

check("Part 2 Quadrature", "ln(x) [0, 1] is finite", Number.isFinite(intLn), intLn, "finite");
check("Part 2 Quadrature", "ln(x) [0, 1] is not NaN", !Number.isNaN(intLn), intLn, "not NaN");
check("Part 2 Quadrature", "ln(x) [0, 1] evaluates to ~ -0.992 (within 0.05)", Math.abs(intLn - -0.992) < 0.05, intLn, "~ -0.992");
check("Part 2 Quadrature", "ln(x) [0, 1] < 5% error from analytical -1.0", errLn < 5.0, errLn, "< 5.0%");

// Test 2.3: 1/sqrt(1 - x^2) over [-1, 1]
// Analytical value: pi ~ 3.14159265. Target: ~2.998 (< 5% error)
const fInvSqrtCirc = (x: number) => (Math.abs(x) >= 1 ? Infinity : 1 / Math.sqrt(1 - x * x));
const intCirc = numericalDefiniteIntegral(fInvSqrtCirc, -1, 1, 120);
const errCirc = (Math.abs(intCirc - Math.PI) / Math.PI) * 100;
console.log(`  [-1, 1] 1/sqrt(1-x^2) = ${intCirc.toFixed(6)} (analytical: ${Math.PI.toFixed(6)}, error: ${errCirc.toFixed(2)}%)`);

check("Part 2 Quadrature", "1/sqrt(1-x^2) [-1, 1] is finite", Number.isFinite(intCirc), intCirc, "finite");
check("Part 2 Quadrature", "1/sqrt(1-x^2) [-1, 1] is not NaN", !Number.isNaN(intCirc), intCirc, "not NaN");
check("Part 2 Quadrature", "1/sqrt(1-x^2) [-1, 1] evaluates to ~2.998 (within 0.05)", Math.abs(intCirc - 2.998) < 0.05, intCirc, "~2.998");
check("Part 2 Quadrature", "1/sqrt(1-x^2) [-1, 1] < 5% error from analytical pi", errCirc < 5.0, errCirc, "< 5.0%");

// Test 2.4: Antisymmetry: integral over [b, a] must equal -integral over [a, b]
const intInvSqrtRev = numericalDefiniteIntegral(fInvSqrt, 1, 0, 80);
const sumInvSqrt = intInvSqrt + intInvSqrtRev;
console.log(`  Antisymmetry 1/sqrt(x): [0, 1]=${intInvSqrt.toFixed(6)}, [1, 0]=${intInvSqrtRev.toFixed(6)}, sum=${sumInvSqrt.toExponential(4)}`);
check("Part 2 Antisymmetry", "1/sqrt(x) [1, 0] === -[0, 1]", Math.abs(sumInvSqrt) < 1e-12, sumInvSqrt, 0);

const intLnRev = numericalDefiniteIntegral(fLn, 1, 0, 80);
const sumLn = intLn + intLnRev;
console.log(`  Antisymmetry ln(x): [0, 1]=${intLn.toFixed(6)}, [1, 0]=${intLnRev.toFixed(6)}, sum=${sumLn.toExponential(4)}`);
check("Part 2 Antisymmetry", "ln(x) [1, 0] === -[0, 1]", Math.abs(sumLn) < 1e-12, sumLn, 0);

const intCircRev = numericalDefiniteIntegral(fInvSqrtCirc, 1, -1, 120);
const sumCirc = intCirc + intCircRev;
console.log(`  Antisymmetry 1/sqrt(1-x^2): [-1, 1]=${intCirc.toFixed(6)}, [1, -1]=${intCircRev.toFixed(6)}, sum=${sumCirc.toExponential(4)}`);
check("Part 2 Antisymmetry", "1/sqrt(1-x^2) [1, -1] === -[-1, 1]", Math.abs(sumCirc) < 1e-12, sumCirc, 0);

// Additional edge cases:
// Right-boundary singularity: 1/sqrt(1-x) on [0, 1] (analytical 2.0)
const fRightSingular = (x: number) => (x >= 1 ? Infinity : 1 / Math.sqrt(1 - x));
const intRight = numericalDefiniteIntegral(fRightSingular, 0, 1, 80);
const errRight = (Math.abs(intRight - 2.0) / 2.0) * 100;
console.log(`  [0, 1] 1/sqrt(1-x) = ${intRight.toFixed(6)} (analytical: 2.0, error: ${errRight.toFixed(2)}%)`);
check("Part 2 Quadrature", "1/sqrt(1-x) [0, 1] evaluates to ~1.912 (< 5% error)", errRight < 5.0, errRight, "< 5.0%");

// Smooth function: x^2 on [0, 1] (analytical: 1/3)
const intPoly = numericalDefiniteIntegral((x) => x * x, 0, 1, 80);
check("Part 2 Quadrature", "Smooth x^2 on [0, 1] is exact 1/3", Math.abs(intPoly - 1/3) < 1e-10, intPoly, 1/3);

// Degenerate interval [a, a]
const intZero = numericalDefiniteIntegral((x) => Math.sin(x), 5, 5);
check("Part 2 Quadrature", "Degenerate [5, 5] is exactly 0", intZero === 0, intZero, 0);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n=================================================================");
console.log("CHALLENGE RESULTS SUMMARY");
console.log("=================================================================");
const total = assertions.length;
const passed = assertions.filter((a) => a.passed).length;
const failed = assertions.filter((a) => !a.passed).length;

console.log(`Total assertions: ${total}`);
console.log(`Passed:           ${passed}`);
console.log(`Failed:           ${failed}`);

if (failed > 0) {
  console.error("\nFAILURES ENCOUNTERED:");
  for (const a of assertions.filter((a) => !a.passed)) {
    console.error(`  - [${a.category}] ${a.description}: ${a.error}`);
  }
  process.exit(1);
} else {
  console.log("\n>>> ALL ADVERSARIAL CHALLENGES EMPIRICALLY CONFIRMED (100% PASS) <<<\n");
}
