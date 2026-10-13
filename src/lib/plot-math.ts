/**
 * High-precision mathematical utilities for the Desmos interactive plotting system.
 * Includes numerical calculus (derivative, curvature, definite integral),
 * critical point detection (roots, extrema, inflection points),
 * safe expression parsing, and human-friendly coordinate grid calculation.
 */

export interface PlotViewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type CriticalPointType =
  | "root"
  | "local-min"
  | "local-max"
  | "inflection"
  | "y-intercept";

export interface CriticalPoint {
  id: string;
  type: CriticalPointType;
  x: number;
  y: number;
  slope: number;
  label: string;
  description: string;
}

export interface EquationPreset {
  id: string;
  title: string;
  formula: string;
  latex: string;
  category: "polynomial" | "physics" | "ml" | "trig" | "special";
  fn: (x: number) => number;
  defaultViewport: PlotViewport;
  defaultIntegral?: [number, number];
  description: string;
}

/** Computes clean human-friendly step intervals (1, 2, 5 * 10^k). */
export function niceStep(range: number, targetTicks: number = 8): number {
  if (
    range <= 0 ||
    !Number.isFinite(range) ||
    targetTicks <= 0 ||
    !Number.isFinite(targetTicks)
  )
    return 1;
  const rawStep = range / targetTicks;
  const power = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const fraction = rawStep / power;

  let niceFraction: number;
  if (fraction <= 1.5) niceFraction = 1;
  else if (fraction <= 3.5) niceFraction = 2;
  else if (fraction <= 7.5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * power;
}

/** Computes major and minor grid lines for pristine mathematical graph paper. */
export function computeGridLines(
  viewport: PlotViewport,
  targetTicksX: number = 8,
  targetTicksY: number = 6,
  minorSubdivisions: number = 5,
) {
  const stepX = niceStep(viewport.xMax - viewport.xMin, targetTicksX);
  const stepY = niceStep(viewport.yMax - viewport.yMin, targetTicksY);

  const minorStepX = stepX / minorSubdivisions;
  const minorStepY = stepY / minorSubdivisions;

  const startMajorX = Math.floor(viewport.xMin / stepX) * stepX;
  const startMajorY = Math.floor(viewport.yMin / stepY) * stepY;

  const majorX: number[] = [];
  for (let v = startMajorX; v <= viewport.xMax + stepX * 0.001; v += stepX) {
    if (v >= viewport.xMin - stepX * 0.001) {
      majorX.push(Number(v.toFixed(6)));
    }
  }

  const majorY: number[] = [];
  for (let v = startMajorY; v <= viewport.yMax + stepY * 0.001; v += stepY) {
    if (v >= viewport.yMin - stepY * 0.001) {
      majorY.push(Number(v.toFixed(6)));
    }
  }

  const startMinorX = Math.floor(viewport.xMin / minorStepX) * minorStepX;
  const startMinorY = Math.floor(viewport.yMin / minorStepY) * minorStepY;

  const minorX: number[] = [];
  for (
    let v = startMinorX;
    v <= viewport.xMax + minorStepX * 0.001;
    v += minorStepX
  ) {
    if (v >= viewport.xMin - minorStepX * 0.001) {
      minorX.push(Number(v.toFixed(6)));
    }
  }

  const minorY: number[] = [];
  for (
    let v = startMinorY;
    v <= viewport.yMax + minorStepY * 0.001;
    v += minorStepY
  ) {
    if (v >= viewport.yMin - minorStepY * 0.001) {
      minorY.push(Number(v.toFixed(6)));
    }
  }

  return { majorX, majorY, minorX, minorY, stepX, stepY };
}

function safeEval(fn: (x: number) => number, x: number): number {
  try {
    const val = fn(x);
    return Number.isFinite(val) ? val : NaN;
  } catch {
    return NaN;
  }
}

/** Numerical first derivative f'(x) using central difference. */
export function numericalDerivative(
  fn: (x: number) => number,
  x: number,
  eps: number = 1e-4,
): number {
  const y0 = safeEval(fn, x);
  if (!Number.isFinite(y0)) return 0;
  const y1 = safeEval(fn, x - eps);
  const y2 = safeEval(fn, x + eps);
  if (!Number.isFinite(y1) || !Number.isFinite(y2)) return 0;
  return (y2 - y1) / (2 * eps);
}

/** Numerical second derivative f''(x) measuring curvature and concavity. */
export function numericalSecondDerivative(
  fn: (x: number) => number,
  x: number,
  eps: number = 1e-4,
): number {
  const ym = safeEval(fn, x - eps);
  const y0 = safeEval(fn, x);
  const yp = safeEval(fn, x + eps);
  if (!Number.isFinite(ym) || !Number.isFinite(y0) || !Number.isFinite(yp))
    return 0;
  return (yp - 2 * y0 + ym) / (eps * eps);
}

/** Composite Simpson's rule for numerical definite integration ∫[a,b] f(x) dx. */
export function numericalDefiniteIntegral(
  fn: (x: number) => number,
  a: number,
  b: number,
  intervals: number = 80,
): number {
  if (Math.abs(b - a) < 1e-9) return 0;
  const safeIntervals =
    intervals > 0 && Number.isFinite(intervals)
      ? intervals % 2 === 0
        ? intervals
        : intervals + 1
      : 80;
  const n = safeIntervals;
  const h = (b - a) / n;
  const fa = safeEval(fn, a);
  const fb = safeEval(fn, b);
  let sum = (Number.isFinite(fa) ? fa : 0) + (Number.isFinite(fb) ? fb : 0);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const y = safeEval(fn, x);
    if (!Number.isFinite(y)) continue;
    sum += i % 2 === 0 ? 2 * y : 4 * y;
  }

  const result = (h / 3) * sum;
  return Number.isFinite(result) ? result : 0;
}

/**
 * Auto-detects critical points (roots, local extrema, inflection points, y-intercept)
 * across the specified visible domain range.
 */
export function findCriticalPoints(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  samples: number = 240,
): CriticalPoint[] {
  const points: CriticalPoint[] = [];
  const range = xMax - xMin;
  if (range <= 0 || !Number.isFinite(range)) return points;

  const dx = range / samples;
  const xs: number[] = [];
  const ys: number[] = [];
  const d1s: number[] = [];
  const d2s: number[] = [];

  for (let i = 0; i <= samples; i++) {
    const x = xMin + i * dx;
    const y = safeEval(fn, x);
    xs.push(x);
    ys.push(y);
    d1s.push(numericalDerivative(fn, x));
    d2s.push(numericalSecondDerivative(fn, x));
  }

  // 1. Y-Intercept if 0 is in visible range
  if (xMin <= 0 && xMax >= 0) {
    const y0 = safeEval(fn, 0);
    if (Number.isFinite(y0)) {
      points.push({
        id: "y-intercept-0",
        type: "y-intercept",
        x: 0,
        y: Number(y0.toFixed(4)),
        slope: Number(numericalDerivative(fn, 0).toFixed(4)),
        label: "Y-Intercept",
        description: `f(0) = ${y0.toFixed(3)}`,
      });
    }
  }

  // 2. Scan intervals for roots, extrema, and inflection points
  for (let i = 0; i < samples; i++) {
    const x1 = xs[i];
    const x2 = xs[i + 1];
    const y1 = ys[i];
    const y2 = ys[i + 1];
    const d1_1 = d1s[i];
    const d1_2 = d1s[i + 1];
    const d2_1 = d2s[i];
    const d2_2 = d2s[i + 1];

    // Detect Root: sign change in f(x)
    if (Number.isFinite(y1) && Number.isFinite(y2)) {
      if ((y1 <= 0 && y2 >= 0) || (y1 >= 0 && y2 <= 0)) {
        // Continuity guard: not an asymptote crossing
        if (Math.abs(y2 - y1) < 200 * (dx + 1)) {
          let a = x1;
          let b = x2;
          let fa = y1;
          let fb = y2;
          for (let k = 0; k < 6; k++) {
            const denom = Math.abs(fa) + Math.abs(fb);
            const m = denom > 1e-12 ? a + (b - a) * (Math.abs(fa) / denom) : (a + b) / 2;
            const fm = fn(m);
            if (!Number.isFinite(fm)) break;
            if (Math.sign(fm) === Math.sign(fa)) {
              a = m;
              fa = fm;
            } else {
              b = m;
              fb = fm;
            }
          }
          const rootX = (a + b) / 2;
          const rootY = fn(rootX);
          const slope = numericalDerivative(fn, rootX);

          if (
            Number.isFinite(rootY) &&
            Math.abs(rootY) < 0.25 &&
            Number.isFinite(slope) &&
            Math.abs(slope) < 1e5
          ) {
            points.push({
              id: `root-${rootX.toFixed(3)}`,
              type: "root",
              x: Number(rootX.toFixed(4)),
              y: Number(rootY.toFixed(4)),
              slope: Number(slope.toFixed(4)),
              label: "Root (Zero)",
              description: `f(${rootX.toFixed(3)}) ≈ 0`,
            });
          }
        }
      }
    }

    // Detect Extrema: sign change in f'(x)
    if (Number.isFinite(d1_1) && Number.isFinite(d1_2) && Number.isFinite(y1) && Number.isFinite(y2)) {
      const isMaxCandidate = (d1_1 >= 0 && d1_2 < 0) || (d1_1 > 0 && d1_2 <= 0);
      const isMinCandidate = (d1_1 <= 0 && d1_2 > 0) || (d1_1 < 0 && d1_2 >= 0);

      if (isMaxCandidate || isMinCandidate) {
        let a = x1;
        let b = x2;
        let d1a = d1_1;
        for (let k = 0; k < 6; k++) {
          const m = (a + b) / 2;
          const dm = numericalDerivative(fn, m);
          if (!Number.isFinite(dm)) break;
          if (Math.sign(dm) === Math.sign(d1a)) {
            a = m;
            d1a = dm;
          } else {
            b = m;
          }
        }
        const extX = (a + b) / 2;
        const extY = fn(extX);
        const slope = numericalDerivative(fn, extX);
        const curv = numericalSecondDerivative(fn, extX);

        if (
          Number.isFinite(extY) &&
          Math.abs(slope) < 0.25 &&
          Number.isFinite(curv) &&
          Math.abs(curv) < 1e5
        ) {
          if (curv < 0 || (isMaxCandidate && curv <= 0)) {
            points.push({
              id: `max-${extX.toFixed(3)}`,
              type: "local-max",
              x: Number(extX.toFixed(4)),
              y: Number(extY.toFixed(4)),
              slope: Number(slope.toFixed(4)),
              label: "Local Maximum",
              description: `Peak at (${extX.toFixed(3)}, ${extY.toFixed(3)})`,
            });
          } else if (curv > 0 || (isMinCandidate && curv >= 0)) {
            points.push({
              id: `min-${extX.toFixed(3)}`,
              type: "local-min",
              x: Number(extX.toFixed(4)),
              y: Number(extY.toFixed(4)),
              slope: Number(slope.toFixed(4)),
              label: "Local Minimum",
              description: `Trough at (${extX.toFixed(3)}, ${extY.toFixed(3)})`,
            });
          }
        }
      }
    }

    // Detect Inflection: sign change in f''(x)
    if (Number.isFinite(d2_1) && Number.isFinite(d2_2) && Number.isFinite(y1) && Number.isFinite(y2)) {
      if ((d2_1 <= 0 && d2_2 > 0) || (d2_1 >= 0 && d2_2 < 0) || (d2_1 < 0 && d2_2 >= 0) || (d2_1 > 0 && d2_2 <= 0)) {
        let a = x1;
        let b = x2;
        let d2a = d2_1;
        for (let k = 0; k < 5; k++) {
          const m = (a + b) / 2;
          const d2m = numericalSecondDerivative(fn, m);
          if (!Number.isFinite(d2m)) break;
          if (Math.sign(d2m) === Math.sign(d2a)) {
            a = m;
            d2a = d2m;
          } else {
            b = m;
          }
        }
        const infX = (a + b) / 2;
        const infY = fn(infX);
        const slope = numericalDerivative(fn, infX);
        const curv = numericalSecondDerivative(fn, infX);

        if (
          Number.isFinite(infY) &&
          Math.abs(curv) < 0.35 &&
          Number.isFinite(slope) &&
          Math.abs(slope) < 1e5
        ) {
          points.push({
            id: `inf-${infX.toFixed(3)}`,
            type: "inflection",
            x: Number(infX.toFixed(4)),
            y: Number(infY.toFixed(4)),
            slope: Number(slope.toFixed(4)),
            label: "Inflection Point",
            description: `Curvature changes at (${infX.toFixed(3)}, ${infY.toFixed(3)})`,
          });
        }
      }
    }
  }

  // Deduplicate points within close proximity (tolerance 0.025 * range)
  const threshold = range * 0.025;
  const deduped: CriticalPoint[] = [];

  for (const pt of points) {
    const existing = deduped.find(
      (p) => p.type === pt.type && Math.abs(p.x - pt.x) < threshold,
    );
    if (!existing) {
      deduped.push(pt);
    } else {
      // Keep point with slope closer to 0 for extrema, or y closer to 0 for roots
      if (pt.type === "root" && Math.abs(pt.y) < Math.abs(existing.y)) {
        Object.assign(existing, pt);
      } else if (
        (pt.type === "local-min" || pt.type === "local-max") &&
        Math.abs(pt.slope) < Math.abs(existing.slope)
      ) {
        Object.assign(existing, pt);
      }
    }
  }

  return deduped;
}

/** Pre-configured equation library showcasing rich mathematical behaviors. */
export const EQUATION_PRESETS: EquationPreset[] = [
  {
    id: "cubic-poly",
    title: "Cubic Polynomial",
    formula: "f(x) = 0.1x³ - 0.5x² - x + 2",
    latex: "f(x) = 0.1x^3 - 0.5x^2 - x + 2",
    category: "polynomial",
    fn: (x) => 0.1 * Math.pow(x, 3) - 0.5 * Math.pow(x, 2) - x + 2,
    defaultViewport: { xMin: -4.5, xMax: 6.5, yMin: -5, yMax: 5.5 },
    defaultIntegral: [-1, 3],
    description: "Features distinct local maximum, local minimum, inflection point, and multiple real roots.",
  },
  {
    id: "gaussian-bell",
    title: "Gaussian Distribution",
    formula: "f(x) = 4 · exp(-0.5 · x²)",
    latex: "f(x) = 4e^{-0.5x^2}",
    category: "ml",
    fn: (x) => 4 * Math.exp(-0.5 * x * x),
    defaultViewport: { xMin: -4, xMax: 4, yMin: -0.8, yMax: 4.8 },
    defaultIntegral: [-1.96, 1.96],
    description: "The classic bell curve foundational to probability theory, machine learning, and statistics.",
  },
  {
    id: "damped-oscillator",
    title: "Damped Oscillator",
    formula: "f(x) = 3.5 · exp(-0.25x) · cos(2.4x)",
    latex: "f(x) = 3.5e^{-0.25x}\\cos(2.4x)",
    category: "physics",
    fn: (x) => 3.5 * Math.exp(-0.25 * x) * Math.cos(2.4 * x),
    defaultViewport: { xMin: -1, xMax: 9, yMin: -3.2, yMax: 4.2 },
    defaultIntegral: [0, 4.5],
    description: "Models physical mechanical vibrations, RLC electric circuits, and underdamped systems.",
  },
  {
    id: "trig-composite",
    title: "Harmonic Composite Wave",
    formula: "f(x) = 2 · sin(1.2x) + cos(2.5x)",
    latex: "f(x) = 2\\sin(1.2x) + \\cos(2.5x)",
    category: "trig",
    fn: (x) => 2 * Math.sin(1.2 * x) + Math.cos(2.5 * x),
    defaultViewport: { xMin: -6, xMax: 6, yMin: -3.5, yMax: 3.5 },
    defaultIntegral: [-3.14, 3.14],
    description: "Fourier superposition wave displaying alternating wave interference harmonics.",
  },
  {
    id: "logistic-sigmoid",
    title: "Logistic Sigmoid",
    formula: "f(x) = 4 / (1 + exp(-2x))",
    latex: "f(x) = \\frac{4}{1 + e^{-2x}}",
    category: "ml",
    fn: (x) => 4 / (1 + Math.exp(-2 * x)),
    defaultViewport: { xMin: -4, xMax: 4, yMin: -0.6, yMax: 4.6 },
    defaultIntegral: [-2, 2],
    description: "Standard activation function in artificial neural networks and binary classification.",
  },
  {
    id: "double-well",
    title: "Double-Well Potential",
    formula: "f(x) = 0.25x⁴ - 2x² + 4",
    latex: "f(x) = 0.25x^4 - 2x^2 + 4",
    category: "physics",
    fn: (x) => 0.25 * Math.pow(x, 4) - 2 * Math.pow(x, 2) + 4,
    defaultViewport: { xMin: -3.8, xMax: 3.8, yMin: -1, yMax: 5.5 },
    defaultIntegral: [-2, 2],
    description: "Symmetric double-well potential demonstrating spontaneous symmetry breaking in quantum and statistical physics.",
  },
];

const ALLOWED_MATH_IDENTIFIERS = new Set([
  "x",
  "pi",
  "e",
  "phi",
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "arcsin",
  "arccos",
  "arctan",
  "sinh",
  "cosh",
  "tanh",
  "cot",
  "sec",
  "csc",
  "sqrt",
  "cbrt",
  "exp",
  "log",
  "log10",
  "log2",
  "ln",
  "abs",
  "round",
  "floor",
  "ceil",
  "min",
  "max",
]);

function findMatchingParen(str: string, openIndex: number): number {
  let depth = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === "(") depth++;
    else if (str[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function scanExponent(expr: string, start: number): number {
  let e = start;
  while (e < expr.length && /\s/.test(expr[e])) e++;
  if (expr[e] === "+" || expr[e] === "-") {
    e++;
    while (e < expr.length && /\s/.test(expr[e])) e++;
  }
  let expEnd = -1;
  if (expr[e] === "(") {
    const match = findMatchingParen(expr, e);
    if (match !== -1) expEnd = match + 1;
  } else if (/[a-zA-Z]/.test(expr[e])) {
    let idEnd = e;
    while (idEnd < expr.length && /[a-zA-Z0-9_$]/.test(expr[idEnd])) idEnd++;
    let afterId = idEnd;
    while (afterId < expr.length && /\s/.test(expr[afterId])) afterId++;
    if (expr[afterId] === "(") {
      const match = findMatchingParen(expr, afterId);
      if (match !== -1) expEnd = match + 1;
    } else {
      expEnd = idEnd;
    }
  } else if (/[0-9]/.test(expr[e])) {
    let numEnd = e;
    while (numEnd < expr.length && /[0-9.]/.test(expr[numEnd])) numEnd++;
    expEnd = numEnd;
  }
  return expEnd;
}

/**
 * Pre-processes unary negation immediately preceding an exponentiation base
 * (e.g. -x^2, -x^3, exp(-x^2 / 2), -(x)^2, -2^x) into valid JavaScript syntax
 * of the form (-1 * (fullPower)) to prevent SyntaxError with JS ** operator.
 */
function transformUnaryPower(expr: string): string {
  let res = "";
  let i = 0;
  while (i < expr.length) {
    if (expr[i] === "-" || expr[i] === "+") {
      const op = expr[i];
      let p = i - 1;
      while (p >= 0 && /\s/.test(expr[p])) p--;
      const isUnary = p < 0 || "([,+-*/^%".includes(expr[p]);
      if (isUnary) {
        let b = i + 1;
        while (b < expr.length && /\s/.test(expr[b])) b++;
        let baseEnd = -1;
        if (expr[b] === "(") {
          const match = findMatchingParen(expr, b);
          if (match !== -1) baseEnd = match + 1;
        } else if (/[a-zA-Z]/.test(expr[b])) {
          let idEnd = b;
          while (idEnd < expr.length && /[a-zA-Z0-9_$]/.test(expr[idEnd])) idEnd++;
          let afterId = idEnd;
          while (afterId < expr.length && /\s/.test(expr[afterId])) afterId++;
          if (expr[afterId] === "(") {
            const match = findMatchingParen(expr, afterId);
            if (match !== -1) baseEnd = match + 1;
          } else {
            baseEnd = idEnd;
          }
        } else if (/[0-9]/.test(expr[b])) {
          let numEnd = b;
          while (numEnd < expr.length && /[0-9.]/.test(expr[numEnd])) numEnd++;
          baseEnd = numEnd;
        }

        if (baseEnd !== -1) {
          let afterBase = baseEnd;
          while (afterBase < expr.length && /\s/.test(expr[afterBase])) afterBase++;
          if (expr[afterBase] === "^") {
            let expEnd = scanExponent(expr, afterBase + 1);
            if (expEnd !== -1) {
              // Handle chained exponentiation: ^ exp ^ exp ...
              while (expEnd < expr.length) {
                let nextOp = expEnd;
                while (nextOp < expr.length && /\s/.test(expr[nextOp])) nextOp++;
                if (expr[nextOp] === "^") {
                  const chainedExpEnd = scanExponent(expr, nextOp + 1);
                  if (chainedExpEnd !== -1) {
                    expEnd = chainedExpEnd;
                    continue;
                  }
                }
                break;
              }

              const fullPower = expr.slice(b, expEnd);
              const sign = op === "-" ? "-1" : "1";
              res += `(${sign} * (${transformUnaryPower(fullPower)}))`;
              i = expEnd;
              continue;
            }
          }
        }
      }
    }
    res += expr[i];
    i++;
  }
  return res;
}

interface MathNode {
  eval(x: number): number;
}

class NumNode implements MathNode {
  constructor(private readonly val: number) {}
  eval(_x: number): number {
    return this.val;
  }
}

class VarNode implements MathNode {
  eval(x: number): number {
    return x;
  }
}

class UnaryNode implements MathNode {
  constructor(
    private readonly op: "+" | "-",
    private readonly arg: MathNode,
  ) {}
  eval(x: number): number {
    const v = this.arg.eval(x);
    return this.op === "-" ? -v : v;
  }
}

class BinaryNode implements MathNode {
  constructor(
    private readonly op: "+" | "-" | "*" | "/" | "%" | "^" | "**",
    private readonly left: MathNode,
    private readonly right: MathNode,
  ) {}
  eval(x: number): number {
    const l = this.left.eval(x);
    const r = this.right.eval(x);
    switch (this.op) {
      case "+":
        return l + r;
      case "-":
        return l - r;
      case "*":
        return l * r;
      case "/":
        return r === 0 ? (l > 0 ? Infinity : l < 0 ? -Infinity : NaN) : l / r;
      case "%":
        return l % r;
      case "^":
      case "**":
        return Math.pow(l, r);
      default:
        return NaN;
    }
  }
}

class CallNode implements MathNode {
  constructor(
    private readonly fn: (...args: number[]) => number,
    private readonly args: MathNode[],
  ) {}
  eval(x: number): number {
    const evaluated = this.args.map((a) => a.eval(x));
    return this.fn(...evaluated);
  }
}

const AST_FUNCTIONS: Record<string, (...args: number[]) => number> = {
  "math.sin": Math.sin,
  "math.cos": Math.cos,
  "math.tan": Math.tan,
  "math.asin": Math.asin,
  "math.acos": Math.acos,
  "math.atan": Math.atan,
  "math.sinh": Math.sinh,
  "math.cosh": Math.cosh,
  "math.tanh": Math.tanh,
  "math.sqrt": Math.sqrt,
  "math.cbrt": Math.cbrt,
  "math.exp": Math.exp,
  "math.log": Math.log,
  "math.log10": Math.log10,
  "math.log2": Math.log2,
  "math.abs": Math.abs,
  "math.round": Math.round,
  "math.floor": Math.floor,
  "math.ceil": Math.ceil,
  "math.min": Math.min,
  "math.max": Math.max,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  arcsin: Math.asin,
  arccos: Math.acos,
  arctan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  exp: Math.exp,
  log: Math.log,
  ln: Math.log,
  log10: Math.log10,
  log2: Math.log2,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  min: Math.min,
  max: Math.max,
  cot: (x) => 1 / Math.tan(x),
  sec: (x) => 1 / Math.cos(x),
  csc: (x) => 1 / Math.sin(x),
};

const AST_CONSTANTS: Record<string, number> = {
  "math.pi": Math.PI,
  "math.e": Math.E,
  pi: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2,
};

type ASTToken =
  | { type: "num"; val: number }
  | { type: "id"; name: string }
  | { type: "op"; op: "+" | "-" | "*" | "/" | "%" | "^" | "**" }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" };

function tokenizeMathString(input: string): ASTToken[] | null {
  const tokens: ASTToken[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i]!;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "comma" });
      i++;
      continue;
    }
    if (ch === "*" && input[i + 1] === "*") {
      tokens.push({ type: "op", op: "**" });
      i += 2;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "%" || ch === "^") {
      tokens.push({ type: "op", op: ch as "+" | "-" | "*" | "/" | "%" | "^" });
      i++;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(input[i + 1] ?? ""))) {
      let numStr = "";
      while (i < input.length && /[0-9.]/.test(input[i]!)) {
        numStr += input[i];
        i++;
      }
      if (i < input.length && /[eE]/.test(input[i]!) && /[0-9+-]/.test(input[i + 1] ?? "")) {
        numStr += input[i];
        i++;
        if (/[+-]/.test(input[i] ?? "")) {
          numStr += input[i];
          i++;
        }
        while (i < input.length && /[0-9]/.test(input[i]!)) {
          numStr += input[i];
          i++;
        }
      }
      const val = Number(numStr);
      if (Number.isNaN(val)) return null;
      tokens.push({ type: "num", val });
      continue;
    }
    if (/[a-zA-Z_$]/.test(ch)) {
      let idStr = "";
      while (i < input.length && /[a-zA-Z0-9_$.]/.test(input[i]!)) {
        idStr += input[i];
        i++;
      }
      tokens.push({ type: "id", name: idStr.toLowerCase() });
      continue;
    }
    return null;
  }
  return tokens;
}

function parseMathTokens(tokens: ASTToken[]): MathNode | null {
  let pos = 0;

  function peek(): ASTToken | undefined {
    return tokens[pos];
  }

  function consume(): ASTToken | undefined {
    return tokens[pos++];
  }

  function parseExpr(): MathNode | null {
    let left = parseTerm();
    if (!left) return null;

    while (pos < tokens.length) {
      const tok = peek();
      if (tok && tok.type === "op" && (tok.op === "+" || tok.op === "-")) {
        consume();
        const right = parseTerm();
        if (!right) return null;
        left = new BinaryNode(tok.op, left, right);
      } else {
        break;
      }
    }
    return left;
  }

  function parseTerm(): MathNode | null {
    let left = parseUnary();
    if (!left) return null;

    while (pos < tokens.length) {
      const tok = peek();
      if (tok && tok.type === "op" && (tok.op === "*" || tok.op === "/" || tok.op === "%")) {
        consume();
        const right = parseUnary();
        if (!right) return null;
        left = new BinaryNode(tok.op, left, right);
      } else {
        break;
      }
    }
    return left;
  }

  function parseUnary(): MathNode | null {
    const tok = peek();
    if (tok && tok.type === "op" && (tok.op === "+" || tok.op === "-")) {
      consume();
      const arg = parseUnary();
      if (!arg) return null;
      return new UnaryNode(tok.op, arg);
    }
    return parsePower();
  }

  function parsePower(): MathNode | null {
    const left = parsePrimary();
    if (!left) return null;

    const tok = peek();
    if (tok && tok.type === "op" && (tok.op === "^" || tok.op === "**")) {
      consume();
      const right = parseUnary();
      if (!right) return null;
      return new BinaryNode(tok.op, left, right);
    }
    return left;
  }

  function parsePrimary(): MathNode | null {
    const tok = peek();
    if (!tok) return null;

    if (tok.type === "num") {
      consume();
      return new NumNode(tok.val);
    }

    if (tok.type === "lparen") {
      consume();
      const expr = parseExpr();
      if (!expr) return null;
      const closing = peek();
      if (!closing || closing.type !== "rparen") return null;
      consume();
      return expr;
    }

    if (tok.type === "id") {
      consume();
      const name = tok.name;
      if (name === "x") {
        return new VarNode();
      }
      if (name in AST_CONSTANTS) {
        return new NumNode(AST_CONSTANTS[name]!);
      }

      const next = peek();
      if (next && next.type === "lparen") {
        const fn = AST_FUNCTIONS[name];
        if (!fn) return null;
        consume(); // '('
        const args: MathNode[] = [];
        if (peek() && peek()!.type !== "rparen") {
          while (true) {
            const arg = parseExpr();
            if (!arg) return null;
            args.push(arg);
            const sep = peek();
            if (sep && sep.type === "comma") {
              consume();
              continue;
            }
            break;
          }
        }
        const closing = peek();
        if (!closing || closing.type !== "rparen") return null;
        consume(); // ')'
        return new CallNode(fn, args);
      }

      return null;
    }

    return null;
  }

  const root = parseExpr();
  if (pos !== tokens.length) return null;
  return root;
}

/**
 * Safely parses and compiles a human mathematical expression string into a callable function (x) => number.
 * Supports standard syntax: x^2, 2x, sin(x), 2sin(x), cos(x), exp(x), sqrt(x), abs(x), log(x), (x+1)(x-1), etc.
 * Whitelists mathematical identifiers only, preventing any arbitrary code execution or process/window access.
 */
export function compileCustomExpression(expr: string): ((x: number) => number) | null {
  if (!expr || typeof expr !== "string") return null;
  let clean = expr.trim();
  if (clean.length === 0) return null;

  // Strip leading f(x) = or y = if present
  clean = clean.replace(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*/i, "").trim();
  if (clean.length === 0) return null;

  // Non-word characters check: only arithmetic, parentheses, decimal point, comma, power, modulo, whitespace
  if (/[^a-zA-Z0-9\s\+\-\*\/\^\(\)\.,%]/.test(clean)) return null;

  // Reject malformed consecutive operators like +++, ---, **, //, ^^ or multiple operators in a row
  if (
    /\+{2,}/.test(clean) ||
    /\-{3,}/.test(clean) ||
    /[*\/^%]\s*[*\/^%]/.test(clean) ||
    /[+\-*/^%]\s*[+\-*/^%]\s*[+\-*/^%]/.test(clean)
  ) {
    return null;
  }

  // Normalize scientific notation (e.g. 1e-5 -> (1*10^(-5)), 2.5e4 -> (2.5*10^(4)))
  clean = clean.replace(/(\d+(?:\.\d+)?)[eE]([+-]?\d+)/g, "($1*10^($2))");

  // Extract all identifier words and ensure every single one is an allowed math function/constant/variable
  const tokens = clean.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g) || [];
  for (const token of tokens) {
    if (!ALLOWED_MATH_IDENTIFIERS.has(token.toLowerCase())) {
      return null;
    }
  }

  try {
    // 0. Protect function names with digits from digit-implicit multiplication (e.g. log10(x) -> log10*(x))
    let s = clean
      .replace(/\blog10\b/gi, "__MATH_LOG10__")
      .replace(/\blog2\b/gi, "__MATH_LOG2__");

    // 1. Implicit multiplication:
    // digit followed by letter or open paren: 2x -> 2*x, 2( -> 2*(, 2sin -> 2*sin
    s = s.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2");
    // x followed by letter, digit, or open paren: x( -> x*(, x sin -> x*sin, x2 -> x*2 (word boundary ensures 'exp' is not corrupted)
    s = s.replace(/\b([xX])\s*([a-zA-Z0-9(])/g, "$1*$2");
    // closing paren followed by letter, digit, or open paren: )x -> )*x, )( -> )*(, )2 -> )*2
    s = s.replace(/\)\s*([a-zA-Z0-9(])/g, ")*$1");

    // Restore protected function names
    s = s
      .replace(/__MATH_LOG10__/g, "log10")
      .replace(/__MATH_LOG2__/g, "log2");

    // Normalize uppercase standalone variable X to x
    s = s.replace(/\bX\b/g, "x");

    // 2. Transform unary negation before exponentiation (-x^2 -> (-1 * (x^2)))
    s = transformUnaryPower(s);

    // 3. Power operator: ^ -> **
    s = s.replace(/\^/g, "**");

    // 3. Transform mathematical aliases and reciprocal functions
    const aliases: [RegExp, string][] = [
      [/\barcsin\b/gi, "asin"],
      [/\barccos\b/gi, "acos"],
      [/\barctan\b/gi, "atan"],
      [/\bphi\b/gi, "((1 + Math.sqrt(5)) / 2)"],
      [/\bcot\s*\(([^)]+)\)/gi, "(1 / tan($1))"],
      [/\bsec\s*\(([^)]+)\)/gi, "(1 / cos($1))"],
      [/\bcsc\s*\(([^)]+)\)/gi, "(1 / sin($1))"],
    ];
    for (const [regex, replacement] of aliases) {
      s = s.replace(regex, replacement);
    }

    const funcs = [
      "asin",
      "acos",
      "atan",
      "sinh",
      "cosh",
      "tanh",
      "sin",
      "cos",
      "tan",
      "sqrt",
      "cbrt",
      "exp",
      "log10",
      "log2",
      "log",
      "ln",
      "abs",
      "round",
      "floor",
      "ceil",
      "min",
      "max",
      "pi",
      "e",
    ];
    for (const f of funcs) {
      const target =
        f === "ln"
          ? "Math.log"
          : f === "pi"
            ? "Math.PI"
            : f === "e"
              ? "Math.E"
              : `Math.${f}`;
      s = s.replace(new RegExp(`(?<!Math\\.)\\b${f}\\b`, "gi"), target);
    }

    // 4. Construct sandboxed AST evaluator without dynamic code generation (no new Function / eval)
    const tokens = tokenizeMathString(s);
    if (!tokens) return null;
    const root = parseMathTokens(tokens);
    if (!root) return null;

    // 5. Test evaluation at test inputs to verify syntax and at least one finite output
    const testPoints = [-2, -1, -0.5, 0, 0.5, 1, 2, 3];
    const hasFinite = testPoints.some((pt) => {
      try {
        return Number.isFinite(root.eval(pt));
      } catch {
        return false;
      }
    });
    if (!hasFinite) return null;

    return (x: number) => {
      try {
        const val = root.eval(x);
        return Number.isFinite(val) ? val : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return null;
  }
}

/**
 * Safely evaluates a calculator formula string.
 * Supports pure arithmetic/constants (e.g. "sin(pi/6) + 4^2")
 * as well as function expressions with variable x (e.g. "x^2 - 3x + 2").
 */
export function evaluateCalculatorExpression(
  expr: string,
  testPoint: number = 1,
): {
  success: boolean;
  result?: number;
  isFunction?: boolean;
  error?: string;
} {
  if (!expr || !expr.trim()) {
    return { success: false, error: "Empty expression" };
  }
  const clean = expr.trim();
  const hasX = /\b[xX]\b/.test(clean);

  const compiled = compileCustomExpression(clean);
  if (!compiled) {
    return { success: false, isFunction: hasX, error: "Syntax or math error" };
  }

  if (hasX) {
    const val = compiled(testPoint);
    return {
      success: true,
      result: Number.isFinite(val) ? Number(val.toFixed(4)) : undefined,
      isFunction: true,
    };
  }

  const val = compiled(0);
  if (Number.isFinite(val)) {
    return {
      success: true,
      result: Number(Number(val.toFixed(6))),
      isFunction: false,
    };
  }

  return { success: false, error: "Undefined or non-finite result" };
}
