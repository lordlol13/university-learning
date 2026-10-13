import { test } from "node:test";
import assert from "node:assert/strict";
import {
  niceStep,
  computeGridLines,
  numericalDerivative,
  numericalSecondDerivative,
  numericalDefiniteIntegral,
  findCriticalPoints,
  compileCustomExpression,
  evaluateCalculatorExpression,
  EQUATION_PRESETS,
} from "../src/lib/plot-math";

test("niceStep produces standard decimal multiples (1, 2, 5 * 10^k)", () => {
  assert.equal(niceStep(10, 10), 1);
  assert.equal(niceStep(20, 10), 2);
  assert.equal(niceStep(50, 10), 5);
  assert.equal(niceStep(100, 10), 10);
  assert.equal(niceStep(1, 10), 0.1);
  assert.equal(niceStep(0.2, 10), 0.02);
});

test("computeGridLines returns major and minor ticks within viewport bounds", () => {
  const vp = { xMin: -5, xMax: 5, yMin: -2, yMax: 8 };
  const grid = computeGridLines(vp, 8, 6, 5);

  assert.ok(grid.majorX.length >= 4);
  assert.ok(grid.majorY.length >= 4);
  assert.ok(grid.minorX.length > grid.majorX.length);
  assert.ok(grid.minorY.length > grid.majorY.length);

  grid.majorX.forEach((x) => {
    assert.ok(x >= vp.xMin - 0.1 && x <= vp.xMax + 0.1);
  });
});

test("numericalDerivative accurately calculates derivatives for polynomials, trig, and exponentials", () => {
  // f(x) = x^2, f'(x) = 2x => at x = 3, f'(3) = 6
  const fSquare = (x: number) => x * x;
  assert.ok(Math.abs(numericalDerivative(fSquare, 3) - 6) < 1e-4);

  // f(x) = sin(x), f'(x) = cos(x) => at x = 0, f'(0) = 1
  assert.ok(Math.abs(numericalDerivative(Math.sin, 0) - 1) < 1e-4);

  // f(x) = (x - 2)^2 + 1 => at x = 2, f'(2) = 0 (minimum)
  const fParabola = (x: number) => (x - 2) * (x - 2) + 1;
  assert.ok(Math.abs(numericalDerivative(fParabola, 2)) < 1e-4);
});

test("numericalSecondDerivative accurately measures curvature and concavity", () => {
  // f(x) = x^3, f''(x) = 6x => at x = 2, f''(2) = 12
  const fCubic = (x: number) => Math.pow(x, 3);
  assert.ok(Math.abs(numericalSecondDerivative(fCubic, 2) - 12) < 1e-3);

  // f(x) = (x - 2)^2 + 1, f''(x) = 2 (concave up everywhere)
  const fParabola = (x: number) => (x - 2) * (x - 2) + 1;
  assert.ok(Math.abs(numericalSecondDerivative(fParabola, 2) - 2) < 1e-3);
});

test("numericalDefiniteIntegral accurately computes area under curves using Simpson's rule", () => {
  // ∫[0, 2] 3x^2 dx = [x^3]_0^2 = 8
  const f3x2 = (x: number) => 3 * x * x;
  const area1 = numericalDefiniteIntegral(f3x2, 0, 2, 60);
  assert.ok(Math.abs(area1 - 8) < 1e-4);

  // ∫[0, π] sin(x) dx = [-cos(x)]_0^π = 2
  const areaSin = numericalDefiniteIntegral(Math.sin, 0, Math.PI, 60);
  assert.ok(Math.abs(areaSin - 2) < 1e-4);

  // Bounds equal => integral is 0
  assert.equal(numericalDefiniteIntegral(f3x2, 3, 3), 0);
});

test("findCriticalPoints detects roots, local extrema, and inflection points", () => {
  // Parabola f(x) = (x - 2)^2 + 1 has minimum at (2, 1), no real roots, y-intercept at (0, 5)
  const fParabola = (x: number) => (x - 2) * (x - 2) + 1;
  const ptsParabola = findCriticalPoints(fParabola, -1, 5);

  const minPt = ptsParabola.find((p) => p.type === "local-min");
  assert.ok(minPt, "Local minimum must be detected");
  assert.ok(Math.abs(minPt.x - 2) < 0.1);
  assert.ok(Math.abs(minPt.y - 1) < 0.1);

  const yInt = ptsParabola.find((p) => p.type === "y-intercept");
  assert.ok(yInt, "Y-intercept must be detected");
  assert.equal(yInt.x, 0);
  assert.ok(Math.abs(yInt.y - 5) < 0.1);

  // Cubic f(x) = x^3 - 3x has:
  // Roots at -sqrt(3) (~ -1.73), 0, sqrt(3) (~ 1.73)
  // Local Max at x = -1 (y = 2)
  // Local Min at x = 1 (y = -2)
  // Inflection point at x = 0
  const fCubic = (x: number) => Math.pow(x, 3) - 3 * x;
  const ptsCubic = findCriticalPoints(fCubic, -3, 3);

  const roots = ptsCubic.filter((p) => p.type === "root");
  assert.ok(roots.length >= 2, "Must detect roots of cubic");

  const localMax = ptsCubic.find((p) => p.type === "local-max");
  assert.ok(localMax, "Local maximum must be detected");
  assert.ok(Math.abs(localMax.x - -1) < 0.1);

  const localMin = ptsCubic.find((p) => p.type === "local-min");
  assert.ok(localMin, "Local minimum must be detected");
  assert.ok(Math.abs(localMin.x - 1) < 0.1);

  const inf = ptsCubic.find((p) => p.type === "inflection");
  assert.ok(inf, "Inflection point must be detected");
  assert.ok(Math.abs(inf.x - 0) < 0.15);
});

test("compileCustomExpression compiles math expressions and rejects dangerous inputs", () => {
  const f1 = compileCustomExpression("x^2 + 3");
  assert.ok(f1);
  assert.equal(f1(2), 7);

  const f2 = compileCustomExpression("2*sin(x)");
  assert.ok(f2);
  assert.ok(Math.abs(f2(Math.PI / 2) - 2) < 1e-4);

  // Advanced expression syntax: implicit multiplication, casing, prefix stripping
  const f3 = compileCustomExpression("2sin(x)");
  assert.ok(f3);
  assert.ok(Math.abs(f3(Math.PI / 2) - 2) < 1e-4);

  const f4 = compileCustomExpression("Cos(x)");
  assert.ok(f4);
  assert.equal(f4(0), 1);

  const f5 = compileCustomExpression("f(x) = x^2 + 1");
  assert.ok(f5);
  assert.equal(f5(3), 10);

  const f6 = compileCustomExpression("(x+1)(x-1)");
  assert.ok(f6);
  assert.equal(f6(3), 8);

  const f7 = compileCustomExpression("x(x-2)");
  assert.ok(f7);
  assert.equal(f7(4), 8);

  // Invalid / non-math strings return null
  assert.equal(compileCustomExpression(""), null);
  assert.equal(compileCustomExpression("alert('hack')"), null);
  assert.equal(compileCustomExpression("process.exit()"), null);
  assert.equal(compileCustomExpression("globalThis.bad"), null);
});

test("findCriticalPoints accurately detects extrema at symmetric origins and rejects asymptotes", () => {
  // f(x) = x^2 has local minimum at (0, 0)
  const ptsX2 = findCriticalPoints((x) => x * x, -2, 2);
  const minX2 = ptsX2.find((p) => p.type === "local-min");
  assert.ok(minX2, "x^2 must detect local minimum at (0,0)");
  assert.ok(Math.abs(minX2.x) < 0.05);
  assert.ok(Math.abs(minX2.y) < 0.05);

  // f(x) = 1/x has a vertical asymptote at x = 0 and NO local extrema
  const ptsInv = findCriticalPoints((x) => 1 / x, -2, 2);
  const falseExtrema = ptsInv.filter((p) => p.type === "local-min" || p.type === "local-max");
  assert.equal(falseExtrema.length, 0, "1/x must not produce false local extrema across asymptote");
});

test("all EQUATION_PRESETS evaluate to finite numbers across their viewports", () => {
  assert.ok(EQUATION_PRESETS.length >= 5);
  for (const preset of EQUATION_PRESETS) {
    const vp = preset.defaultViewport;
    assert.ok(vp.xMax > vp.xMin);
    assert.ok(vp.yMax > vp.yMin);

    for (let x = vp.xMin; x <= vp.xMax; x += (vp.xMax - vp.xMin) / 10) {
      const y = preset.fn(x);
      assert.ok(Number.isFinite(y), `Preset ${preset.id} returned non-finite at ${x}`);
    }
  }
});

test("scale linear transformations and inversions are exact roundtrips", () => {
  const vp = { xMin: -10, xMax: 10, yMin: -5, yMax: 15 };
  const W = 800, H = 500, L = 50, R = 30, T = 20, B = 40;
  const xSpan = vp.xMax - vp.xMin;
  const ySpan = vp.yMax - vp.yMin;

  const toPxX = (v: number) => L + ((v - vp.xMin) / xSpan) * (W - L - R);
  const toPxY = (v: number) => H - B - ((v - vp.yMin) / ySpan) * (H - T - B);
  const invertX = (px: number) => vp.xMin + ((px - L) / (W - L - R)) * xSpan;
  const invertY = (py: number) => vp.yMax - ((py - T) / (H - T - B)) * ySpan;

  for (const testVal of [-10, -5, 0, 3.1415, 7.89, 10]) {
    assert.ok(Math.abs(invertX(toPxX(testVal)) - testVal) < 1e-9);
  }
  for (const testVal of [-5, 0, 5, 10, 15]) {
    assert.ok(Math.abs(invertY(toPxY(testVal)) - testVal) < 1e-9);
  }
});

test("findCriticalPoints safely handles degenerate and constant functions", () => {
  const fConst = () => 5;
  const pts = findCriticalPoints(fConst, -5, 5);
  // Constant function has no isolated extrema or roots
  assert.ok(Array.isArray(pts));

  const fLinear = (x: number) => 2 * x - 4;
  const ptsLinear = findCriticalPoints(fLinear, -1, 5);
  const root = ptsLinear.find((p) => p.type === "root");
  assert.ok(root, "Must find root for linear function 2x - 4");
  assert.ok(Math.abs(root.x - 2) < 0.1);
});

test("double-tap deduplication cooldown preserves newly pinned point and prevents cancellation", () => {
  // Simulates the double-tap trigger logic with 250ms cooldown and 35px tolerance
  let lastTrigger: { time: number; x: number; y: number } | null = null;
  let pinnedPoints: Array<{ id: string; x: number; y: number }> = [];

  function simulateTrigger(now: number, clientX: number, clientY: number, graphX: number, graphY: number) {
    if (
      lastTrigger &&
      now - lastTrigger.time < 250 &&
      Math.hypot(clientX - lastTrigger.x, clientY - lastTrigger.y) < 35
    ) {
      return false; // deduplicated & ignored
    }
    lastTrigger = { time: now, x: clientX, y: clientY };

    const threshold = 0.35;
    const exists = pinnedPoints.find((p) => Math.abs(p.x - graphX) < threshold);
    if (exists) {
      pinnedPoints = pinnedPoints.filter((p) => p.id !== exists.id);
    } else {
      pinnedPoints = [...pinnedPoints, { id: `pt-${now}`, x: graphX, y: graphY }];
    }
    return true;
  }

  // 1. First double-click gesture:
  // Pointerdown double-tap fires at t=200ms
  const tap1 = simulateTrigger(200, 150, 100, 2.5, 6.25);
  assert.equal(tap1, true, "Pointerdown double-tap must add point on first try");
  assert.equal(pinnedPoints.length, 1, "Point must be pinned on first try");

  // Native browser dblclick fires immediately after at t=205ms (5ms later)
  const dblClickNative = simulateTrigger(205, 150, 100, 2.5, 6.25);
  assert.equal(dblClickNative, false, "Native dblclick must be deduplicated and NOT remove point");
  assert.equal(pinnedPoints.length, 1, "Point must remain pinned after first double-click");

  // 2. Second double-click gesture 1.5 seconds later to toggle off
  const tap2 = simulateTrigger(1700, 150, 100, 2.5, 6.25);
  assert.equal(tap2, true, "Subsequent double-click after cooldown must trigger");
  assert.equal(pinnedPoints.length, 0, "Point must now be removed (toggled off)");
});

test("compileCustomExpression compiles exponential functions and UI formula presets", () => {
  const fExp = compileCustomExpression("exp(x)");
  assert.ok(fExp, "exp(x) must compile");
  assert.equal(fExp(0), 1);
  assert.ok(Math.abs(fExp(1) - Math.E) < 1e-4);

  // Gaussian curve sample chip from UI: 4*exp(-0.5*x^2)
  const fGauss = compileCustomExpression("4*exp(-0.5*x^2)");
  assert.ok(fGauss, "4*exp(-0.5*x^2) must compile");
  assert.equal(fGauss(0), 4);
  assert.ok(Math.abs(fGauss(2) - 4 * Math.exp(-2)) < 1e-4);

  // Sigmoid formula placeholder from UI: 4/(1+exp(-2x))
  const fSigmoid = compileCustomExpression("4/(1+exp(-2x))");
  assert.ok(fSigmoid, "4/(1+exp(-2x)) must compile");
  assert.equal(fSigmoid(0), 2);
  assert.ok(Math.abs(fSigmoid(5) - 4) < 1e-3);

  // Variable multiplied by exponential
  const fProduct = compileCustomExpression("x*exp(x)");
  assert.ok(fProduct, "x*exp(x) must compile");
  assert.equal(fProduct(0), 0);
  assert.ok(Math.abs(fProduct(1) - Math.E) < 1e-4);
});

test("compileCustomExpression normalizes uppercase variables and functions", () => {
  const fUpper = compileCustomExpression("X^2");
  assert.ok(fUpper, "X^2 must compile");
  assert.equal(fUpper(3), 9);

  const fCoeff = compileCustomExpression("2X");
  assert.ok(fCoeff, "2X must compile");
  assert.equal(fCoeff(4), 8);

  const fSum = compileCustomExpression("X + 5");
  assert.ok(fSum, "X + 5 must compile");
  assert.equal(fSum(2), 7);

  const fTrigUpper = compileCustomExpression("Cos(X)");
  assert.ok(fTrigUpper, "Cos(X) must compile");
  assert.equal(fTrigUpper(0), 1);

  const fExpUpper = compileCustomExpression("EXP(X)");
  assert.ok(fExpUpper, "EXP(X) must compile");
  assert.equal(fExpUpper(0), 1);

  const fComplexUpper = compileCustomExpression("4/(1+exp(-2X))");
  assert.ok(fComplexUpper, "4/(1+exp(-2X)) must compile");
  assert.equal(fComplexUpper(0), 2);
});

test("numericalDefiniteIntegral gracefully handles non-finite boundary endpoints without NaN", () => {
  // Singularity at left endpoint a=0: ln(x) -> -Infinity at 0
  const fSingularA = (x: number) => (x <= 0 ? -Infinity : Math.log(x));
  const resA = numericalDefiniteIntegral(fSingularA, 0, 1, 80);
  assert.ok(Number.isFinite(resA), "Integral with singular left endpoint must be finite");
  assert.ok(!Number.isNaN(resA), "Integral must not be NaN");

  // Singularity at right endpoint b=2: 1/(2-x) -> Infinity or NaN at 2
  const fSingularB = (x: number) => (x >= 2 ? NaN : 1 / (2.0001 - x));
  const resB = numericalDefiniteIntegral(fSingularB, 0, 2, 80);
  assert.ok(Number.isFinite(resB), "Integral with singular right endpoint must be finite");
  assert.ok(!Number.isNaN(resB), "Integral must not be NaN");

  // Infinite function guarded at both ends
  const fBothInf = (x: number) => (x === 0 || x === 2 ? Infinity : 3 * x * x);
  const resBoth = numericalDefiniteIntegral(fBothInf, 0, 2, 60);
  assert.ok(Number.isFinite(resBoth), "Integral must remain finite");
  assert.ok(Math.abs(resBoth - 8) < 0.5, "Simpson's rule should remain approximately correct");
});

test("double-tap gesture tolerates pointer micro-jitter within threshold and triggers on first attempt", () => {
  interface TapRecord {
    time: number;
    x: number;
    y: number;
  }
  interface DragState {
    x: number;
    y: number;
    hasMoved: boolean;
  }

  const state: {
    lastTap: TapRecord | null;
    drag: DragState | null;
    pinnedPoints: Array<{ id: string; x: number; y: number }>;
  } = {
    lastTap: null,
    drag: null,
    pinnedPoints: [],
  };

  function onPointerDown(now: number, x: number, y: number, _pointerType: "mouse" | "touch" = "mouse") {
    void _pointerType;
    const dist = state.lastTap ? Math.hypot(x - state.lastTap.x, y - state.lastTap.y) : 999;
    if (state.lastTap && now - state.lastTap.time < 480 && dist < 32) {
      // Trigger double-tap: pin point
      state.pinnedPoints.push({ id: `pt-${now}`, x, y });
      state.lastTap = null;
    } else {
      state.lastTap = { time: now, x, y };
    }
    state.drag = { x, y, hasMoved: false };
  }

  function onPointerMove(x: number, y: number, pointerType: "mouse" | "touch" = "mouse") {
    if (!state.drag) return;
    const dist = Math.hypot(x - state.drag.x, y - state.drag.y);
    const threshold = pointerType === "touch" ? 12 : 10;
    if (!state.drag.hasMoved && dist < threshold) {
      return; // Jitter absorbed: do not abort tap
    }
    state.drag.hasMoved = true;
    state.lastTap = null;
  }

  function onPointerUp() {
    state.drag = null;
  }

  // Scenario 1: First click with natural 5px micro-jitter
  onPointerDown(1000, 100, 100, "mouse");
  assert.ok(state.lastTap, "Initial tap must be recorded");

  // Jitter during button down (e.g. 5px displacement)
  onPointerMove(104, 103, "mouse");
  assert.equal(state.drag?.hasMoved, false, "Micro-jitter under 10px must NOT be marked as moved");
  assert.ok(state.lastTap, "Micro-jitter must NOT clear lastTap");

  onPointerUp();
  assert.ok(state.lastTap, "lastTap must survive pointerup after micro-jitter");

  // Second click 200ms later at (105, 102) (displacement 5.4px < 32px)
  onPointerDown(1200, 105, 102, "mouse");
  assert.equal(state.pinnedPoints.length, 1, "Double-tap must succeed on the FIRST attempt despite micro-jitter");

  // Scenario 2: Touch pointer with 8px micro-jitter (< 12px)
  state.pinnedPoints = [];
  state.lastTap = null;
  onPointerDown(2000, 200, 200, "touch");
  onPointerMove(206, 205, "touch"); // hypot(6, 5) = 7.81px < 12px
  assert.equal(state.drag?.hasMoved, false, "Touch jitter under 12px must NOT be marked as moved");
  assert.ok(state.lastTap, "Touch jitter must preserve lastTap");
  onPointerUp();
  onPointerDown(2220, 208, 204, "touch"); // within 220ms and < 32px
  assert.equal(state.pinnedPoints.length, 1, "Touch double-tap must succeed on first attempt");

  // Scenario 3: Real drag intentional pan (15px >= 10px) cancels double tap
  state.pinnedPoints = [];
  state.lastTap = null;
  onPointerDown(3000, 100, 100, "mouse");
  onPointerMove(112, 110, "mouse"); // hypot(12, 10) = 15.6px >= 10px
  assert.equal(state.drag?.hasMoved, true, "Intentional movement >= 10px must be marked as moved");
  assert.equal(state.lastTap, null, "Intentional drag must clear lastTap");
});

test("compileCustomExpression correctly evaluates unary negation before exponentiation", () => {
  // -x^2 at x = 3 evaluates to -9
  const fNegSquare = compileCustomExpression("-x^2");
  assert.ok(fNegSquare, "-x^2 must compile successfully");
  assert.equal(fNegSquare(3), -9);

  // -x^3 at x = 2 evaluates to -8
  const fNegCube = compileCustomExpression("-x^3");
  assert.ok(fNegCube, "-x^3 must compile successfully");
  assert.equal(fNegCube(2), -8);

  // exp(-x^2 / 2) at x = 0 evaluates to 1
  const fGaussian = compileCustomExpression("exp(-x^2 / 2)");
  assert.ok(fGaussian, "exp(-x^2 / 2) must compile successfully");
  assert.ok(Math.abs(fGaussian(0) - 1) < 1e-6);

  // -x^2 + 4 at x = 1 evaluates to 3
  const fParabola = compileCustomExpression("-x^2 + 4");
  assert.ok(fParabola, "-x^2 + 4 must compile successfully");
  assert.equal(fParabola(1), 3);

  // Additional unary exponentiation variations
  const fParenBase = compileCustomExpression("-(x)^2");
  assert.ok(fParenBase, "-(x)^2 must compile successfully");
  assert.equal(fParenBase(3), -9);

  const fNegBase = compileCustomExpression("-2^x");
  assert.ok(fNegBase, "-2^x must compile successfully");
  assert.equal(fNegBase(3), -8);

  const fInnerNeg = compileCustomExpression("(-x)^2");
  assert.ok(fInnerNeg, "(-x)^2 must compile successfully");
  assert.equal(fInnerNeg(3), 9);

  const fNegativeExp = compileCustomExpression("2^-x");
  assert.ok(fNegativeExp, "2^-x must compile successfully");
  assert.equal(fNegativeExp(1), 0.5);

  const fBinaryMinus = compileCustomExpression("4 - x^2");
  assert.ok(fBinaryMinus, "4 - x^2 must compile successfully");
  assert.equal(fBinaryMinus(1), 3);
  assert.equal(fBinaryMinus(3), -5);

  // Malformed operators rejection
  assert.equal(compileCustomExpression("x +++ 2"), null);
  assert.equal(compileCustomExpression("x --- 2"), null);

  // Asymptote guard for numericalDerivative
  assert.equal(numericalDerivative((x) => 1 / x, 0), 0);
});

test("evaluateCalculatorExpression correctly evaluates arithmetic, functions, and constants", () => {
  // Pure arithmetic
  const res1 = evaluateCalculatorExpression("3 + 5 * 2");
  assert.equal(res1.success, true);
  assert.equal(res1.isFunction, false);
  assert.equal(res1.result, 13);

  // Powers and roots
  const resSqrt = evaluateCalculatorExpression("sqrt(144) + 4^2");
  assert.equal(resSqrt.success, true);
  assert.equal(resSqrt.isFunction, false);
  assert.equal(resSqrt.result, 28);

  // Constants
  const resPi = evaluateCalculatorExpression("sin(pi / 2)");
  assert.equal(resPi.success, true);
  assert.equal(resPi.isFunction, false);
  assert.equal(resPi.result, 1);

  const resLnE = evaluateCalculatorExpression("ln(e)");
  assert.equal(resLnE.success, true);
  assert.equal(resLnE.isFunction, false);
  assert.equal(resLnE.result, 1);

  // Function with variable x
  const resFn = evaluateCalculatorExpression("x^2 - 4");
  assert.equal(resFn.success, true);
  assert.equal(resFn.isFunction, true);
  // Evaluated at default testPoint x=1: 1^2 - 4 = -3
  assert.equal(resFn.result, -3);

  // Extended math functions: log10, log2, cot, sec, csc
  const resLog10 = evaluateCalculatorExpression("log10(100)");
  assert.equal(resLog10.success, true);
  assert.equal(resLog10.result, 2);

  const resLog2 = evaluateCalculatorExpression("log2(8)");
  assert.equal(resLog2.success, true);
  assert.equal(resLog2.result, 3);

  const resCot = evaluateCalculatorExpression("cot(pi / 4)");
  assert.equal(resCot.success, true);
  assert.ok(Math.abs((resCot.result ?? 0) - 1) < 1e-4);

  // Syntax errors and edge cases
  assert.equal(evaluateCalculatorExpression("").success, false);
  assert.equal(evaluateCalculatorExpression("+++").success, false);
  assert.equal(evaluateCalculatorExpression("invalidFunc(5)").success, false);
});

test("gradient descent lab formula (x - 2)^2 + 1 compiles and evaluates correctly for calculator and graph", () => {
  const labFormula = "(x - 2)^2 + 1";
  const compiled = compileCustomExpression(labFormula);
  assert.ok(compiled, "Compiled function should not be null");
  assert.equal(compiled(2), 1, "At x=2 (minimum), y must be 1");
  assert.equal(compiled(0), 5, "At x=0, y must be 5");
  assert.equal(compiled(4), 5, "At x=4, y must be 5");

  const calcEval = evaluateCalculatorExpression(labFormula);
  assert.equal(calcEval.success, true);
  assert.equal(calcEval.isFunction, true);
  // At default test point x=1: (1 - 2)^2 + 1 = 2
  assert.equal(calcEval.result, 2);

  // Normalize formula comparison regardless of whitespace or casing
  const normalizedInitial = labFormula.replace(/\s+/g, "").toLowerCase();
  const variations = [
    "(x-2)^2+1",
    "  ( x - 2 ) ^ 2 + 1  ",
    "(X - 2)^2 + 1",
  ];
  for (const v of variations) {
    assert.equal(
      v.replace(/\s+/g, "").toLowerCase(),
      normalizedInitial,
      `Formula variation '${v}' must normalize identically to initial formula`,
    );
  }
});


