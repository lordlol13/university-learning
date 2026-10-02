/* eslint-disable */
/**
 * Milestone 1 Adversarial Challenge & Stress-Test Harness
 * Evaluates src/lib/plot-math.ts and interactive plotting behaviors under extreme conditions.
 */

import {
  compileCustomExpression,
  numericalDefiniteIntegral,
  numericalDerivative,
  findCriticalPoints,
} from "../src/lib/plot-math.js";

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  input: unknown;
  output: unknown;
  expected?: unknown;
  error?: string;
  notes?: string;
}

const results: TestResult[] = [];

function record(res: TestResult) {
  results.push(res);
  const mark = res.passed ? "✔ PASS" : "✖ FAIL";
  console.log(`${mark} [${res.category}] ${res.name}`);
  if (!res.passed) {
    console.log(`   Input:    ${JSON.stringify(res.input)}`);
    console.log(`   Expected: ${JSON.stringify(res.expected)}`);
    console.log(`   Actual:   ${JSON.stringify(res.output)}`);
    if (res.error) console.log(`   Error:    ${res.error}`);
    if (res.notes) console.log(`   Notes:    ${res.notes}`);
  }
}

console.log("=================================================================");
console.log("=== M1 ADVERSARIAL STRESS TEST SUITE EXECUTION ===");
console.log("=================================================================\n");

// =================================================================
// 1. compileCustomExpression Stress Testing
// =================================================================
console.log("--- 1. Testing compileCustomExpression ---");

// 1.1 Standard transcendental functions
const transcendentals = [
  { expr: "sin(x)", testX: Math.PI / 2, expected: 1 },
  { expr: "cos(x)", testX: Math.PI, expected: -1 },
  { expr: "tan(x)", testX: 0, expected: 0 },
  { expr: "asin(x)", testX: 1, expected: Math.PI / 2 },
  { expr: "acos(x)", testX: 1, expected: 0 },
  { expr: "atan(x)", testX: 1, expected: Math.PI / 4 },
  { expr: "sinh(x)", testX: 0, expected: 0 },
  { expr: "cosh(x)", testX: 0, expected: 1 },
  { expr: "tanh(x)", testX: 0, expected: 0 },
  { expr: "exp(x)", testX: 1, expected: Math.E },
  { expr: "log(x)", testX: Math.E, expected: 1 },
  { expr: "ln(x)", testX: Math.E, expected: 1 },
  { expr: "sqrt(x)", testX: 9, expected: 3 },
  { expr: "cbrt(x)", testX: 27, expected: 3 },
  { expr: "abs(x)", testX: -5, expected: 5 },
];

for (const t of transcendentals) {
  try {
    const fn = compileCustomExpression(t.expr);
    if (!fn) {
      record({
        name: `Transcendental: ${t.expr}`,
        category: "compileCustomExpression",
        passed: false,
        input: t.expr,
        output: null,
        expected: `Function evaluating to ${t.expected}`,
      });
      continue;
    }
    const val = fn(t.testX);
    const ok = Math.abs(val - t.expected) < 1e-4;
    record({
      name: `Transcendental: ${t.expr}`,
      category: "compileCustomExpression",
      passed: ok,
      input: { expr: t.expr, x: t.testX },
      output: val,
      expected: t.expected,
    });
  } catch (err: any) {
    record({
      name: `Transcendental: ${t.expr}`,
      category: "compileCustomExpression",
      passed: false,
      input: t.expr,
      output: null,
      error: err.message,
    });
  }
}

// 1.2 Complex nested expressions
const nested = [
  { expr: "sin(cos(x))", testX: 0, expected: Math.sin(1) },
  { expr: "sqrt(1 + x^2)", testX: 0, expected: 1 },
  { expr: "exp(-x^2 / 2)", testX: 0, expected: 1 },
  { expr: "log(abs(x) + 1)", testX: 0, expected: 0 },
  { expr: "tan(x / 2)", testX: 0, expected: 0 },
  { expr: "sqrt(abs(sin(x)))", testX: Math.PI / 2, expected: 1 },
  { expr: "exp(sin(x) + cos(x))", testX: 0, expected: Math.E },
];

for (const t of nested) {
  try {
    const fn = compileCustomExpression(t.expr);
    if (!fn) {
      record({
        name: `Nested: ${t.expr}`,
        category: "compileCustomExpression",
        passed: false,
        input: t.expr,
        output: null,
        expected: "Function",
      });
      continue;
    }
    const val = fn(t.testX);
    const ok = Math.abs(val - t.expected) < 1e-4;
    record({
      name: `Nested: ${t.expr}`,
      category: "compileCustomExpression",
      passed: ok,
      input: { expr: t.expr, x: t.testX },
      output: val,
      expected: t.expected,
    });
  } catch (err: any) {
    record({
      name: `Nested: ${t.expr}`,
      category: "compileCustomExpression",
      passed: false,
      input: t.expr,
      output: null,
      error: err.message,
    });
  }
}

// 1.3 Implicit multiplication patterns
const implicitCases = [
  { expr: "(x+1)(x-1)", testX: 3, expected: 8 },
  { expr: "2(x+3)", testX: 2, expected: 10 },
  { expr: "x(x+1)", testX: 4, expected: 20 },
  { expr: "(x+1)x", testX: 4, expected: 20 },
  { expr: "(x+1)2", testX: 3, expected: 8 },
  { expr: "2x(x+1)", testX: 3, expected: 24 },
  { expr: "x sin(x)", testX: Math.PI / 2, expected: Math.PI / 2 },
  { expr: "sin(x)cos(x)", testX: Math.PI / 4, expected: 0.5 },
  { expr: "(x+1)(x+2)(x+3)", testX: 1, expected: 24 },
  { expr: "2x", testX: 5, expected: 10 },
  { expr: "3x^2", testX: 2, expected: 12 },
  { expr: "4exp(-x)", testX: 0, expected: 4 },
];

for (const t of implicitCases) {
  try {
    const fn = compileCustomExpression(t.expr);
    if (!fn) {
      record({
        name: `Implicit Mult: ${t.expr}`,
        category: "compileCustomExpression",
        passed: false,
        input: t.expr,
        output: null,
        expected: "Function",
      });
      continue;
    }
    const val = fn(t.testX);
    const ok = Math.abs(val - t.expected) < 1e-4;
    record({
      name: `Implicit Mult: ${t.expr}`,
      category: "compileCustomExpression",
      passed: ok,
      input: { expr: t.expr, x: t.testX },
      output: val,
      expected: t.expected,
    });
  } catch (err: any) {
    record({
      name: `Implicit Mult: ${t.expr}`,
      category: "compileCustomExpression",
      passed: false,
      input: t.expr,
      output: null,
      error: err.message,
    });
  }
}

// 1.4 Exponents with negative and fractional powers & unary minus
const exponentCases = [
  { expr: "x^2", testX: 3, expected: 9 },
  { expr: "x^3", testX: 2, expected: 8 },
  { expr: "x^(1/2)", testX: 4, expected: 2 },
  { expr: "x^0.5", testX: 9, expected: 3 },
  { expr: "x^(-1)", testX: 2, expected: 0.5 },
  { expr: "x^(-2)", testX: 2, expected: 0.25 },
  { expr: "x^-1", testX: 2, expected: 0.5 },
  { expr: "x^-2", testX: 2, expected: 0.25 },
  { expr: "-x^2", testX: 3, expected: -9, notes: "Leading unary minus before power - standard algebra notation" },
  { expr: "-x^3", testX: 2, expected: -8 },
  { expr: "-(x^2)", testX: 3, expected: -9 },
  { expr: "(-x)^2", testX: 3, expected: 9 },
  { expr: "-1*x^2", testX: 3, expected: -9 },
  { expr: "-x + 4", testX: 3, expected: 1 },
  { expr: "-sin(x)", testX: Math.PI / 2, expected: -1 },
  { expr: "4 - x^2", testX: 1, expected: 3 },
  { expr: "2^-x", testX: 1, expected: 0.5 },
  { expr: "2^(-x)", testX: 1, expected: 0.5 },
];

for (const t of exponentCases) {
  try {
    const fn = compileCustomExpression(t.expr);
    if (!fn) {
      record({
        name: `Exponent / Unary: ${t.expr}`,
        category: "compileCustomExpression",
        passed: false,
        input: t.expr,
        output: null,
        expected: `Function evaluating to ${t.expected}`,
        notes: t.notes,
      });
      continue;
    }
    const val = fn(t.testX);
    const ok = Math.abs(val - t.expected) < 1e-4;
    record({
      name: `Exponent / Unary: ${t.expr}`,
      category: "compileCustomExpression",
      passed: ok,
      input: { expr: t.expr, x: t.testX },
      output: val,
      expected: t.expected,
      notes: t.notes,
    });
  } catch (err: any) {
    record({
      name: `Exponent / Unary: ${t.expr}`,
      category: "compileCustomExpression",
      passed: false,
      input: t.expr,
      output: null,
      error: err.message,
      notes: t.notes,
    });
  }
}

// 1.5 Edge case formulas and syntax variations
const edgeCases = [
  { expr: "X^2 + 2X + 1", testX: 2, expected: 9, label: "Uppercase X in multiple terms" },
  { expr: "f(x) = x^2 - 4", testX: 3, expected: 5, label: "Leading f(x) = prefix" },
  { expr: "y = 2*x + 1", testX: 3, expected: 7, label: "Leading y = prefix" },
  { expr: "F(X) = 3X", testX: 2, expected: 6, label: "Uppercase prefix F(X) = 3X" },
  { expr: "  x^2  ", testX: 3, expected: 9, label: "Surrounding whitespace" },
  { expr: "4/(1+exp(-2x))", testX: 0, expected: 2, label: "Logistic formula preset" },
  { expr: "4*exp(-0.5*x^2)", testX: 0, expected: 4, label: "Gaussian formula preset" },
  { expr: "3.5*exp(-0.25*x)*cos(2.4*x)", testX: 0, expected: 3.5, label: "Damped oscillator preset" },
  { expr: "pi * x", testX: 2, expected: 2 * Math.PI, label: "Constant pi multiplication" },
  { expr: "2pi", testX: 0, expected: 2 * Math.PI, label: "Implicit 2pi" },
  { expr: "e^x", testX: 1, expected: Math.E, label: "Constant e to power x" },
];

for (const t of edgeCases) {
  try {
    const fn = compileCustomExpression(t.expr);
    if (!fn) {
      record({
        name: `Edge Case: ${t.label} (${t.expr})`,
        category: "compileCustomExpression",
        passed: false,
        input: t.expr,
        output: null,
        expected: "Function",
      });
      continue;
    }
    const val = fn(t.testX);
    const ok = Math.abs(val - t.expected) < 1e-4;
    record({
      name: `Edge Case: ${t.label} (${t.expr})`,
      category: "compileCustomExpression",
      passed: ok,
      input: { expr: t.expr, x: t.testX },
      output: val,
      expected: t.expected,
    });
  } catch (err: any) {
    record({
      name: `Edge Case: ${t.label} (${t.expr})`,
      category: "compileCustomExpression",
      passed: false,
      input: t.expr,
      output: null,
      error: err.message,
    });
  }
}

// 1.6 Invalid/Dangerous/Malformed inputs (should safely return null)
const rejectionCases = [
  { expr: "", label: "Empty string" },
  { expr: "   ", label: "Whitespace only" },
  { expr: "alert('xss')", label: "XSS payload" },
  { expr: "process.exit()", label: "Node process access" },
  { expr: "globalThis.location", label: "Global scope access" },
  { expr: "console.log(x)", label: "Console access" },
  { expr: "require('fs')", label: "Module require" },
  { expr: "import('foo')", label: "Dynamic import" },
  { expr: "eval('1')", label: "Eval injection" },
  { expr: "x @ 2", label: "Disallowed character @" },
  { expr: "x $ 2", label: "Disallowed character $" },
  { expr: "x # 2", label: "Disallowed character #" },
  { expr: "x +++ 2", label: "Malformed operators +++" },
  { expr: "((x + 1)", label: "Unclosed parentheses" },
  { expr: "1 / (x - x)", label: "Always NaN / non-finite function" },
];

for (const t of rejectionCases) {
  try {
    const fn = compileCustomExpression(t.expr);
    const passed = fn === null;
    record({
      name: `Rejection: ${t.label} (${t.expr})`,
      category: "compileCustomExpression",
      passed,
      input: t.expr,
      output: fn ? "Function" : null,
      expected: null,
    });
  } catch (err: any) {
    record({
      name: `Rejection: ${t.label} (${t.expr})`,
      category: "compileCustomExpression",
      passed: false,
      input: t.expr,
      output: null,
      error: err.message,
    });
  }
}

// =================================================================
// 2. numericalDefiniteIntegral Stress Testing
// =================================================================
console.log("\n--- 2. Testing numericalDefiniteIntegral ---");

// 2.1 Standard integrals
const standardIntegrals = [
  { fn: (x: number) => 3 * x * x, a: 0, b: 2, expected: 8, label: "∫[0,2] 3x^2 dx = 8" },
  { fn: Math.sin, a: 0, b: Math.PI, expected: 2, label: "∫[0,π] sin(x) dx = 2" },
  { fn: Math.cos, a: 0, b: Math.PI / 2, expected: 1, label: "∫[0,π/2] cos(x) dx = 1" },
  { fn: Math.exp, a: 0, b: 1, expected: Math.E - 1, label: "∫[0,1] e^x dx = e - 1" },
  { fn: (x: number) => 1 - x * x, a: -1, b: 1, expected: 4 / 3, label: "∫[-1,1] (1-x^2) dx = 4/3" },
];

for (const t of standardIntegrals) {
  const res = numericalDefiniteIntegral(t.fn, t.a, t.b, 80);
  const ok = Math.abs(res - t.expected) < 1e-3;
  record({
    name: `Standard: ${t.label}`,
    category: "numericalDefiniteIntegral",
    passed: ok,
    input: { a: t.a, b: t.b },
    output: res,
    expected: t.expected,
  });
}

// 2.2 Intervals with singular boundaries
const singularBoundaryIntegrals = [
  {
    fn: (x: number) => (x <= 0 ? -Infinity : Math.log(x)),
    a: 0,
    b: 1,
    expectedApprox: -1,
    label: "Left boundary singularity: ln(x) at 0",
  },
  {
    fn: (x: number) => (x <= 0 ? Infinity : 1 / Math.sqrt(x)),
    a: 0,
    b: 1,
    expectedApprox: 2,
    label: "Left boundary singularity: 1/sqrt(x) at 0",
  },
  {
    fn: (x: number) => (x >= 2 ? Infinity : 1 / Math.sqrt(2 - x)),
    a: 0,
    b: 2,
    expectedApprox: 2 * Math.SQRT2,
    label: "Right boundary singularity: 1/sqrt(2-x) at 2",
  },
];

for (const t of singularBoundaryIntegrals) {
  const res = numericalDefiniteIntegral(t.fn, t.a, t.b, 100);
  const isFinite = Number.isFinite(res) && !Number.isNaN(res);
  record({
    name: `Singular Boundary: ${t.label}`,
    category: "numericalDefiniteIntegral",
    passed: isFinite,
    input: { a: t.a, b: t.b },
    output: res,
    expected: "Finite number (no NaN)",
    notes: `Approx calculated: ${res.toFixed(4)}, analytic: ${t.expectedApprox.toFixed(4)}`,
  });
}

// 2.3 Intervals spanning interior asymptotes
const interiorAsymptoteIntegrals = [
  {
    fn: (x: number) => (Math.abs(x) < 1e-12 ? Infinity : 1 / x),
    a: -1,
    b: 1,
    label: "Cauchy Principal Value: ∫[-1,1] 1/x dx (odd singularity at 0)",
  },
  {
    fn: (x: number) => (Math.abs(x - 1) < 1e-12 ? Infinity : 1 / (x - 1)),
    a: 0,
    b: 2,
    label: "Interior singularity: ∫[0,2] 1/(x-1) dx",
  },
  {
    fn: (x: number) => (Math.abs(x - Math.PI / 2) < 1e-4 ? Infinity : Math.tan(x)),
    a: 0,
    b: Math.PI,
    label: "Interior singularity: ∫[0,π] tan(x) dx",
  },
];

for (const t of interiorAsymptoteIntegrals) {
  const res = numericalDefiniteIntegral(t.fn, t.a, t.b, 80);
  const isFinite = Number.isFinite(res) && !Number.isNaN(res);
  record({
    name: `Interior Asymptote: ${t.label}`,
    category: "numericalDefiniteIntegral",
    passed: isFinite,
    input: { a: t.a, b: t.b },
    output: res,
    expected: "Finite number (gracefully guarded)",
  });
}

// 2.4 Zero width and inverted bounds
const boundCases = [
  { fn: (x: number) => x * x, a: 5, b: 5, expected: 0, label: "Zero width [5, 5]" },
  { fn: (x: number) => x * x, a: 5, b: 5 + 1e-10, expected: 0, label: "Sub-epsilon width < 1e-9" },
  { fn: (x: number) => 3 * x * x, a: 2, b: 0, expected: -8, label: "Inverted bounds [2, 0] = -∫[0,2] = -8" },
  { fn: Math.sin, a: Math.PI, b: 0, expected: -2, label: "Inverted bounds [π, 0] = -2" },
];

for (const t of boundCases) {
  const res = numericalDefiniteIntegral(t.fn, t.a, t.b, 60);
  const ok = Math.abs(res - t.expected) < 1e-3;
  record({
    name: `Bound edge case: ${t.label}`,
    category: "numericalDefiniteIntegral",
    passed: ok,
    input: { a: t.a, b: t.b },
    output: res,
    expected: t.expected,
  });
}

// 2.5 Large ranges and non-smooth functions
const specialIntegrals = [
  { fn: (_x: number) => 1, a: 0, b: 10000, expected: 10000, label: "Large range ∫[0,10000] 1 dx = 10000" },
  { fn: (x: number) => Math.abs(x), a: -2, b: 2, expected: 4, label: "Non-smooth abs(x) ∫[-2,2] |x| dx = 4" },
  { fn: (x: number) => (x >= 0 ? 1 : 0), a: -1, b: 1, expected: 1, label: "Discontinuous Heaviside step ∫[-1,1] H(x) dx = 1" },
  { fn: (x: number) => Math.floor(x), a: 0, b: 3, expected: 3, label: "Floor step function ∫[0,3] floor(x) dx = 3" },
];

for (const t of specialIntegrals) {
  const res = numericalDefiniteIntegral(t.fn, t.a, t.b, 200);
  const ok = Math.abs(res - t.expected) < 0.1;
  record({
    name: `Special/Non-smooth: ${t.label}`,
    category: "numericalDefiniteIntegral",
    passed: ok,
    input: { a: t.a, b: t.b },
    output: res,
    expected: t.expected,
  });
}

// =================================================================
// 3. numericalDerivative & findCriticalPoints Stress Testing
// =================================================================
console.log("\n--- 3. Testing numericalDerivative & findCriticalPoints ---");

// 3.1 Derivatives on sharp turns, asymptotes, and non-smooth points
const derivCases = [
  {
    fn: (x: number) => Math.abs(x),
    x: 0,
    expected: 0,
    label: "abs(x) at x=0 (symmetric central difference yields 0)",
  },
  {
    fn: (x: number) => (x <= 0 ? 0 : x * x),
    x: 0,
    expected: 0,
    label: "C1 smooth junction at x=0",
  },
  {
    fn: (x: number) => 1 / x,
    x: 0,
    expected: 0,
    label: "1/x at x=0 (non-finite guard returns 0)",
  },
  {
    fn: (x: number) => Math.sqrt(x),
    x: -1,
    expected: 0,
    label: "sqrt(x) at negative x (NaN guard returns 0)",
  },
];

for (const t of derivCases) {
  const res = numericalDerivative(t.fn, t.x);
  const ok = Math.abs(res - t.expected) < 1e-3;
  record({
    name: `Derivative: ${t.label}`,
    category: "numericalDerivative",
    passed: ok,
    input: t.x,
    output: res,
    expected: t.expected,
  });
}

// 3.2 findCriticalPoints on diverse geometries
// Test A: Cubic polynomial f(x) = x^3 - 3x on [-2.5, 2.5]
const ptsCubic = findCriticalPoints((x) => x * x * x - 3 * x, -2.5, 2.5);
const rootCubic = ptsCubic.filter((p) => p.type === "root");
const maxCubic = ptsCubic.find((p) => p.type === "local-max");
const minCubic = ptsCubic.find((p) => p.type === "local-min");
const infCubic = ptsCubic.find((p) => p.type === "inflection");

record({
  name: "Cubic roots detected (roots at -√3, 0, √3)",
  category: "findCriticalPoints",
  passed: rootCubic.length >= 3,
  input: "x^3 - 3x on [-2.5, 2.5]",
  output: rootCubic.map((r) => r.x),
  expected: "[-1.732, 0, 1.732]",
});

record({
  name: "Cubic local max detected at x ≈ -1, y ≈ 2",
  category: "findCriticalPoints",
  passed: !!maxCubic && Math.abs(maxCubic.x - -1) < 0.05 && Math.abs(maxCubic.y - 2) < 0.05,
  input: "x^3 - 3x",
  output: maxCubic ? { x: maxCubic.x, y: maxCubic.y } : null,
  expected: "{ x: -1, y: 2 }",
});

record({
  name: "Cubic local min detected at x ≈ 1, y ≈ -2",
  category: "findCriticalPoints",
  passed: !!minCubic && Math.abs(minCubic.x - 1) < 0.05 && Math.abs(minCubic.y - -2) < 0.05,
  input: "x^3 - 3x",
  output: minCubic ? { x: minCubic.x, y: minCubic.y } : null,
  expected: "{ x: 1, y: -2 }",
});

record({
  name: "Cubic inflection point detected at x ≈ 0",
  category: "findCriticalPoints",
  passed: !!infCubic && Math.abs(infCubic.x - 0) < 0.1,
  input: "x^3 - 3x",
  output: infCubic ? { x: infCubic.x, y: infCubic.y } : null,
  expected: "{ x: 0, y: 0 }",
});

// Test B: Flat regions and saddle points
// f(x) = x^3 has an inflection/saddle at x=0, but NOT a local min or local max.
const ptsSaddle = findCriticalPoints((x) => x * x * x, -2, 2);
const falseExtremaSaddle = ptsSaddle.filter((p) => p.type === "local-min" || p.type === "local-max");
record({
  name: "Saddle point f(x)=x^3 does not produce false extrema",
  category: "findCriticalPoints",
  passed: falseExtremaSaddle.length === 0,
  input: "x^3 on [-2, 2]",
  output: falseExtremaSaddle.map((p) => ({ type: p.type, x: p.x })),
  expected: "[] (no false local-min or local-max)",
});

// Test C: Constant function f(x) = 4
const ptsConst = findCriticalPoints(() => 4, -5, 5);
const falseExtremaConst = ptsConst.filter((p) => p.type === "local-min" || p.type === "local-max" || p.type === "root");
record({
  name: "Constant function f(x)=4 produces zero false extrema or roots",
  category: "findCriticalPoints",
  passed: falseExtremaConst.length === 0,
  input: "f(x) = 4 on [-5, 5]",
  output: falseExtremaConst,
  expected: "[]",
});

// Test D: Function with vertical asymptote f(x) = 1/x
const ptsAsymptote = findCriticalPoints((x) => 1 / x, -3, 3);
const falseExtremaAsymptote = ptsAsymptote.filter((p) => p.type === "local-min" || p.type === "local-max");
const falseRootsAsymptote = ptsAsymptote.filter((p) => p.type === "root");
record({
  name: "Asymptote f(x)=1/x produces zero false extrema",
  category: "findCriticalPoints",
  passed: falseExtremaAsymptote.length === 0,
  input: "1/x on [-3, 3]",
  output: falseExtremaAsymptote,
  expected: "[]",
});
record({
  name: "Asymptote f(x)=1/x produces zero false roots",
  category: "findCriticalPoints",
  passed: falseRootsAsymptote.length === 0,
  input: "1/x on [-3, 3]",
  output: falseRootsAsymptote,
  expected: "[]",
});

// Test E: Degenerate domains (xMin >= xMax, NaN)
const ptsInvertedDomain = findCriticalPoints((x) => x * x, 5, -5);
record({
  name: "Degenerate domain [5, -5] gracefully returns empty array",
  category: "findCriticalPoints",
  passed: Array.isArray(ptsInvertedDomain) && ptsInvertedDomain.length === 0,
  input: "[5, -5]",
  output: ptsInvertedDomain,
  expected: "[]",
});

// =================================================================
// 4. Pointer Micro-Jitter & Rapid Sequences Simulation
// =================================================================
console.log("\n--- 4. Testing Pointer Micro-Jitter Tolerance & Sequences ---");

interface MockTapRecord {
  time: number;
  x: number;
  y: number;
}
interface MockDragState {
  x: number;
  y: number;
  hasMoved: boolean;
}
interface MockPlotPoint {
  id: string;
  x: number;
  y: number;
}

class PointerSimulator {
  lastTap: MockTapRecord | null = null;
  drag: MockDragState | null = null;
  lastDoubleTrigger: { time: number; x: number; y: number } | null = null;
  pinnedPoints: MockPlotPoint[] = [];

  // Replicating InteractivePlot.tsx logic
  pointerDown(time: number, clientX: number, clientY: number, pointerType: "mouse" | "touch" = "mouse") {
    void pointerType;
    const now = time;
    const last = this.lastTap;
    const dist = last ? Math.hypot(clientX - last.x, clientY - last.y) : 999;

    if (last && now - last.time < 480 && dist < 32) {
      this.triggerDoubleTapAt(time, clientX, clientY);
      this.lastTap = null;
    } else {
      this.lastTap = { time: now, x: clientX, y: clientY };
    }
    this.drag = { x: clientX, y: clientY, hasMoved: false };
  }

  pointerMove(clientX: number, clientY: number, pointerType: "mouse" | "touch" = "mouse") {
    if (!this.drag) return;
    const d = this.drag;
    const dist = Math.hypot(clientX - d.x, clientY - d.y);
    const moveThreshold = pointerType === "touch" ? 12 : 10;
    if (!d.hasMoved && dist < moveThreshold) {
      return; // Jitter absorbed
    }
    d.hasMoved = true;
    this.lastTap = null;
  }

  pointerUp() {
    this.drag = null;
  }

  triggerDoubleTapAt(now: number, clientX: number, clientY: number, graphX: number = clientX / 10, graphY: number = clientY / 10) {
    if (
      this.lastDoubleTrigger &&
      now - this.lastDoubleTrigger.time < 250 &&
      Math.hypot(clientX - this.lastDoubleTrigger.x, clientY - this.lastDoubleTrigger.y) < 35
    ) {
      return false; // deduplicated cooldown
    }
    this.lastDoubleTrigger = { time: now, x: clientX, y: clientY };

    if (!Number.isFinite(graphX) || !Number.isFinite(graphY)) return false;

    const threshold = 0.35;
    const exists = this.pinnedPoints.find((p) => Math.abs(p.x - graphX) < threshold);
    if (exists) {
      this.pinnedPoints = this.pinnedPoints.filter((p) => p.id !== exists.id);
    } else {
      this.pinnedPoints.push({ id: `pt-${now}`, x: graphX, y: graphY });
    }
    return true;
  }
}

// 4.1 Micro-jitter within thresholds
{
  const sim = new PointerSimulator();
  // Click 1: down at t=1000, micro-jitter of 6px (dx=4, dy=4.5 -> hypot=6.02 < 10)
  sim.pointerDown(1000, 100, 100, "mouse");
  sim.pointerMove(104, 104.5, "mouse");
  sim.pointerUp();

  // Click 2: down at t=1200 (200ms later), micro-jitter 5px at (105, 103) -> dist from click 1 is hypot(5, 3) = 5.83 < 32
  sim.pointerDown(1200, 105, 103, "mouse");
  sim.pointerMove(107, 105, "mouse");
  sim.pointerUp();

  record({
    name: "Mouse 6px micro-jitter registers double-tap on FIRST attempt",
    category: "pointerJitter",
    passed: sim.pinnedPoints.length === 1,
    input: "Click 1 with 6px jitter, Click 2 at 200ms with 5px jitter",
    output: sim.pinnedPoints.length,
    expected: 1,
  });
}

// 4.2 Touch pointer with 11px micro-jitter (< 12px)
{
  const sim = new PointerSimulator();
  sim.pointerDown(2000, 200, 200, "touch");
  sim.pointerMove(207, 208, "touch"); // hypot(7, 8) = 10.63px < 12px
  sim.pointerUp();

  sim.pointerDown(2250, 212, 209, "touch"); // dist from first tap: hypot(12, 9) = 15px < 32px
  sim.pointerUp();

  record({
    name: "Touch 11px micro-jitter registers double-tap on FIRST attempt",
    category: "pointerJitter",
    passed: sim.pinnedPoints.length === 1,
    input: "Touch 1 with 10.6px jitter, Touch 2 at 250ms",
    output: sim.pinnedPoints.length,
    expected: 1,
  });
}

// 4.3 Intentional drag (11px mouse >= 10px) cancels double-tap
{
  const sim = new PointerSimulator();
  sim.pointerDown(3000, 100, 100, "mouse");
  sim.pointerMove(108, 108, "mouse"); // hypot(8, 8) = 11.31px >= 10px
  sim.pointerUp();

  // Second click should now be treated as a FIRST tap, not double-tap
  sim.pointerDown(3200, 100, 100, "mouse");
  sim.pointerUp();

  record({
    name: "Intentional mouse drag (11.3px) cancels double-tap eligibility",
    category: "pointerJitter",
    passed: sim.pinnedPoints.length === 0 && sim.lastTap !== null,
    input: "Mouse drag 11.3px then tap at 200ms",
    output: { pinned: sim.pinnedPoints.length, hasLastTap: sim.lastTap !== null },
    expected: "{ pinned: 0, hasLastTap: true }",
  });
}

// 4.4 Boundary timing test: 479ms vs 481ms
{
  const sim1 = new PointerSimulator();
  sim1.pointerDown(4000, 100, 100, "mouse");
  sim1.pointerUp();
  sim1.pointerDown(4479, 100, 100, "mouse"); // 479ms < 480ms -> trigger!
  sim1.pointerUp();

  const sim2 = new PointerSimulator();
  sim2.pointerDown(4000, 100, 100, "mouse");
  sim2.pointerUp();
  sim2.pointerDown(4481, 100, 100, "mouse"); // 481ms > 480ms -> new first tap!
  sim2.pointerUp();

  record({
    name: "Timing window: 479ms triggers double-tap, 481ms expires",
    category: "pointerJitter",
    passed: sim1.pinnedPoints.length === 1 && sim2.pinnedPoints.length === 0,
    input: "sim1: 479ms gap, sim2: 481ms gap",
    output: { sim1: sim1.pinnedPoints.length, sim2: sim2.pinnedPoints.length },
    expected: "{ sim1: 1, sim2: 0 }",
  });
}

// 4.5 Rapid click barrage (5 double-clicks over 2.5 seconds)
{
  const sim = new PointerSimulator();
  // Rapid double-clicks toggling points
  // 1st double-click at t=0, t=150 -> pin point 1
  sim.pointerDown(1000, 50, 50, "mouse");
  sim.pointerUp();
  sim.pointerDown(1150, 50, 50, "mouse");
  sim.pointerUp();

  // Native dblclick at t=1155 (5ms later) -> deduplicated
  sim.triggerDoubleTapAt(1155, 50, 50);

  // 2nd double-click at t=1600, t=1750 on SAME point -> toggles OFF point 1
  sim.pointerDown(1600, 50, 50, "mouse");
  sim.pointerUp();
  sim.pointerDown(1750, 50, 50, "mouse");
  sim.pointerUp();

  // 3rd double-click at t=2200, t=2350 on DIFFERENT point -> pin point 2
  sim.pointerDown(2200, 80, 80, "mouse");
  sim.pointerUp();
  sim.pointerDown(2350, 80, 80, "mouse");
  sim.pointerUp();

  record({
    name: "Rapid click barrage toggles points cleanly with zero race conditions",
    category: "pointerJitter",
    passed: sim.pinnedPoints.length === 1 && sim.pinnedPoints[0].x === 8,
    input: "3 sequential double-click actions with native events",
    output: sim.pinnedPoints,
    expected: "1 point at x=8 (point 1 toggled off, point 2 pinned)",
  });
}

// 4.6 Non-finite coordinate guards
{
  const sim = new PointerSimulator();
  const resNaN = sim.triggerDoubleTapAt(5000, 100, 100, NaN, 5);
  const resInf = sim.triggerDoubleTapAt(5100, 100, 100, 5, Infinity);
  record({
    name: "Non-finite coordinates (NaN/Infinity) safely guarded",
    category: "pointerJitter",
    passed: resNaN === false && resInf === false && sim.pinnedPoints.length === 0,
    input: "NaN and Infinity coordinates",
    output: { resNaN, resInf, pinned: sim.pinnedPoints.length },
    expected: "{ resNaN: false, resInf: false, pinned: 0 }",
  });
}

// =================================================================
// Summary & Failure Analysis
// =================================================================
console.log("\n=================================================================");
console.log("=== ADVERSARIAL STRESS TEST SUMMARY ===");
console.log("=================================================================");

const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log(`Total tests executed: ${total}`);
console.log(`Passed:              ${passed}`);
console.log(`Failed / Bugs found: ${failed}`);

if (failed > 0) {
  console.log("\n--- DETAILED FAILURE BREAKDOWN ---");
  for (const f of results.filter((r) => !r.passed)) {
    console.log(`\n[${f.category}] ${f.name}`);
    console.log(`  Input:    ${JSON.stringify(f.input)}`);
    console.log(`  Expected: ${JSON.stringify(f.expected)}`);
    console.log(`  Output:   ${JSON.stringify(f.output)}`);
    if (f.error) console.log(`  Error:    ${f.error}`);
    if (f.notes) console.log(`  Notes:    ${f.notes}`);
  }
}
