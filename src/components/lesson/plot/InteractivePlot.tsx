"use client";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  Activity,
  Calculator,
  CircleDot,
  Layers,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { formatNumber } from "@/lib/gradient-descent";
import { MathCalculatorDrawer } from "./MathCalculatorDrawer";
import {
  computeGridLines,
  findCriticalPoints,
  numericalDefiniteIntegral,
  numericalDerivative,
  numericalSecondDerivative,
  compileCustomExpression,
  type CriticalPoint,
  type EquationPreset,
  type PlotViewport,
} from "@/lib/plot-math";

export type { PlotViewport, CriticalPoint, EquationPreset };

export interface PlotScale {
  x: (value: number) => number;
  y: (value: number) => number;
  invertX: (pixelX: number) => number;
  invertY: (pixelY: number) => number;
  viewport: PlotViewport;
  width: number;
  height: number;
}

export interface PinnedPlotPoint {
  id: string;
  x: number;
  y: number;
  slope: number;
  concavity?: number;
  label?: string;
  source?: "user" | "critical";
}

export interface DesmosPlotSettings {
  enableDoubleTap: boolean;
  snapToCurve: boolean;
  showTangent: boolean;
  showHoverTooltip: boolean;
  showSubgrid: boolean;
  showCriticalPoints: boolean;
  showIntegral: boolean;
  theme: "dark" | "light";
  hoverTangent: boolean;
}

const DEFAULT_SETTINGS: DesmosPlotSettings = {
  enableDoubleTap: true,
  snapToCurve: true,
  showTangent: true,
  showHoverTooltip: true,
  showSubgrid: true,
  showCriticalPoints: true,
  showIntegral: false,
  theme: "light",
  hoverTangent: true,
};

/**
 * High-elegance mathematical grid:
 * Renders major and minor coordinate grid lines, bold X/Y axes,
 * directional arrows, human-friendly numeric labels, and origin badge.
 */
export function CoordinateSystem({
  scale,
  padding,
  showSubgrid = true,
  theme = "dark",
}: {
  scale: PlotScale;
  padding: { L: number; R: number; T: number; B: number };
  showSubgrid?: boolean;
  theme?: "dark" | "light";
}) {
  const { viewport: v, x, y, width: W, height: H } = scale;
  const { L, R, T, B } = padding;

  const isDark = theme === "dark";
  const targetTicksX = W < 460 ? 5 : W < 680 ? 7 : 9;
  const targetTicksY = H < 360 ? 4 : 6;

  const { majorX, majorY, minorX, minorY } = useMemo(
    () => computeGridLines(v, targetTicksX, targetTicksY, 5),
    [v, targetTicksX, targetTicksY],
  );

  const axisX = Math.max(T, Math.min(H - B, y(0)));
  const axisY = Math.max(L, Math.min(W - R, x(0)));
  const isOriginVisible =
    v.xMin <= 0 && v.xMax >= 0 && v.yMin <= 0 && v.yMax >= 0;

  return (
    <g
      className={`plot-coordinates ${isDark ? "theme-dark" : "theme-light"}`}
      pointerEvents="none"
    >
      {/* Background Grid Rect */}
      <rect
        x={L}
        y={T}
        width={W - L - R}
        height={H - T - B}
        fill={isDark ? "#090d16" : "#f8fafc"}
      />

      {/* Minor Sub-grid lines (Desmos precision feel) */}
      {showSubgrid && (
        <g
          className="plot-minor-grid"
          stroke={isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(203, 213, 225, 0.45)"}
          strokeWidth={0.75}
        >
          {minorX.map((val, i) => (
            <line
              key={`mx-${i}`}
              x1={x(val)}
              y1={T}
              x2={x(val)}
              y2={H - B}
            />
          ))}
          {minorY.map((val, i) => (
            <line
              key={`my-${i}`}
              x1={L}
              y1={y(val)}
              x2={W - R}
              y2={y(val)}
            />
          ))}
        </g>
      )}

      {/* Major Grid Lines */}
      <g
        className="plot-major-grid"
        stroke={isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.35)"}
        strokeWidth={1}
      >
        {majorX.map((val, i) => (
          <line
            key={`gx-${i}`}
            x1={x(val)}
            y1={T}
            x2={x(val)}
            y2={H - B}
          />
        ))}
        {majorY.map((val, i) => (
          <line
            key={`gy-${i}`}
            x1={L}
            y1={y(val)}
            x2={W - R}
            y2={y(val)}
          />
        ))}
      </g>

      {/* X Axis & Tick Labels */}
      {majorX.map((val, i) => {
        if (Math.abs(val) < 1e-6) return null; // Origin handled separately
        const px = x(val);
        if (px < L || px > W - R) return null;
        return (
          <g key={`lbl-x-${i}`}>
            <line
              x1={px}
              y1={axisX - 4}
              x2={px}
              y2={axisX + 4}
              stroke={isDark ? "#94a3b8" : "#475569"}
              strokeWidth={1.2}
            />
            <text
              x={px}
              y={axisX > H - B - 20 ? axisX - 8 : axisX + 16}
              textAnchor="middle"
              fill={isDark ? "#94a3b8" : "#475569"}
              fontSize={11}
              fontWeight={500}
            >
              {Number(val.toFixed(2))}
            </text>
          </g>
        );
      })}

      {/* Y Axis & Tick Labels */}
      {majorY.map((val, i) => {
        if (Math.abs(val) < 1e-6) return null;
        const py = y(val);
        if (py < T || py > H - B) return null;
        return (
          <g key={`lbl-y-${i}`}>
            <line
              x1={axisY - 4}
              y1={py}
              x2={axisY + 4}
              y2={py}
              stroke={isDark ? "#94a3b8" : "#475569"}
              strokeWidth={1.2}
            />
            <text
              x={axisY < L + 24 ? axisY + 8 : axisY - 8}
              y={py + 4}
              textAnchor={axisY < L + 24 ? "start" : "end"}
              fill={isDark ? "#94a3b8" : "#475569"}
              fontSize={11}
              fontWeight={500}
            >
              {Number(val.toFixed(2))}
            </text>
          </g>
        );
      })}

      {/* Main Coordinate Axes with Crisp Accents */}
      <line
        className="plot-axis"
        x1={L}
        y1={axisX}
        x2={W - R}
        y2={axisX}
        stroke={isDark ? "#64748b" : "#334155"}
        strokeWidth={1.75}
      />
      <line
        className="plot-axis"
        x1={axisY}
        y1={T}
        x2={axisY}
        y2={H - B}
        stroke={isDark ? "#64748b" : "#334155"}
        strokeWidth={1.75}
      />

      {/* Origin Marker Badge */}
      {isOriginVisible && (
        <g className="origin-marker">
          <circle
            cx={x(0)}
            cy={y(0)}
            r={3.5}
            fill={isDark ? "#38bdf8" : "#0284c7"}
          />
          <text
            x={x(0) + 7}
            y={y(0) - 7}
            fill={isDark ? "#7dd3fc" : "#0369a1"}
            fontSize={10}
            fontWeight={600}
          >
            (0,0)
          </text>
        </g>
      )}

      {/* Axis Direction Indicators */}
      <text
        x={W - R - 12}
        y={axisX - 8}
        fill={isDark ? "#cbd5e1" : "#1e293b"}
        fontWeight="700"
        fontSize={12}
        fontStyle="italic"
      >
        x
      </text>
      <text
        x={axisY + 8}
        y={T + 14}
        fill={isDark ? "#cbd5e1" : "#1e293b"}
        fontWeight="700"
        fontSize={12}
        fontStyle="italic"
      >
        f(x)
      </text>
    </g>
  );
}

/** High-resolution function curve rendering with gradient glow and asymptote clipping. */
export function FunctionPlot({
  fn,
  scale,
  strokeColor,
  theme = "light",
}: {
  fn: (x: number) => number;
  scale: PlotScale;
  strokeColor?: string;
  theme?: "dark" | "light";
}) {
  const activeColor = strokeColor || (theme === "dark" ? "#38bdf8" : "#2563eb");
  const pointsCount = scale.width < 500 ? 220 : 380;
  const path = useMemo(() => {
    const { xMin, xMax, yMin, yMax } = scale.viewport;
    const ySpan = yMax - yMin;
    const yClampMin = yMin - ySpan * 3;
    const yClampMax = yMax + ySpan * 3;

    const segments: string[] = [];
    let currentSegment: string[] = [];
    let prevY: number | null = null;

    for (let i = 0; i <= pointsCount; i++) {
      const x = xMin + ((xMax - xMin) * i) / pointsCount;
      const y = fn(x);

      if (!Number.isFinite(y)) {
        if (currentSegment.length > 0) {
          segments.push(currentSegment.join(" "));
          currentSegment = [];
        }
        prevY = null;
        continue;
      }

      // Detect asymptote jump across viewport
      if (
        prevY !== null &&
        Math.abs(y - prevY) > ySpan * 4 &&
        ((prevY > yMax && y < yMin) || (prevY < yMin && y > yMax))
      ) {
        if (currentSegment.length > 0) {
          segments.push(currentSegment.join(" "));
          currentSegment = [];
        }
      }

      const clampedY = Math.max(yClampMin, Math.min(yClampMax, y));
      const px = scale.x(x).toFixed(2);
      const py = scale.y(clampedY).toFixed(2);

      if (currentSegment.length === 0) {
        currentSegment.push(`M ${px},${py}`);
      } else {
        currentSegment.push(`L ${px},${py}`);
      }

      prevY = y;
    }

    if (currentSegment.length > 0) {
      segments.push(currentSegment.join(" "));
    }

    return segments.join(" ");
  }, [fn, scale, pointsCount]);

  return (
    <g className="function-plot-layer">
      {/* Subtle outer glow on dark theme */}
      <path
        d={path}
        fill="none"
        stroke={activeColor}
        strokeWidth={6}
        opacity={theme === "dark" ? 0.2 : 0.12}
        vectorEffect="non-scaling-stroke"
      />
      {/* Primary crisp function stroke */}
      <path
        d={path}
        fill="none"
        stroke={activeColor}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

/** Area-under-the-curve definite integral shading layer with safe asymptote clipping. */
export function IntegralShadingLayer({
  fn,
  scale,
  interval,
  theme = "dark",
}: {
  fn: (x: number) => number;
  scale: PlotScale;
  interval: [number, number];
  theme?: "dark" | "light";
}) {
  const [a, b] = interval[0] <= interval[1] ? interval : [interval[1], interval[0]];
  const isDark = theme === "dark";
  const numSteps = 100;

  const path = useMemo(() => {
    const y0 = scale.y(0);
    const { yMin, yMax } = scale.viewport;
    const ySpan = yMax - yMin;
    const yClampMin = yMin - ySpan * 2;
    const yClampMax = yMax + ySpan * 2;

    const points: string[] = [];
    points.push(`M ${scale.x(a).toFixed(2)},${y0.toFixed(2)}`);

    for (let i = 0; i <= numSteps; i++) {
      const xVal = a + ((b - a) * i) / numSteps;
      const rawY = fn(xVal);
      const yVal = Number.isFinite(rawY)
        ? Math.max(yClampMin, Math.min(yClampMax, rawY))
        : 0;
      points.push(`L ${scale.x(xVal).toFixed(2)},${scale.y(yVal).toFixed(2)}`);
    }

    points.push(`L ${scale.x(b).toFixed(2)},${y0.toFixed(2)}`);
    points.push("Z");
    return points.join(" ");
  }, [fn, scale, a, b]);

  const value = useMemo(() => numericalDefiniteIntegral(fn, a, b), [fn, a, b]);

  const midVal = fn((a + b) / 2);
  const badgeY = Number.isFinite(midVal)
    ? Math.min(scale.height - 50, Math.max(35, scale.y(midVal / 2)))
    : scale.height / 2;

  const fa = fn(a);
  const fb = fn(b);
  const yA = Number.isFinite(fa) ? scale.y(fa) : scale.y(0);
  const yB = Number.isFinite(fb) ? scale.y(fb) : scale.y(0);

  return (
    <g className="integral-shading-layer" pointerEvents="none">
      <defs>
        <linearGradient id="integralGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity={isDark ? 0.35 : 0.25} />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity={isDark ? 0.08 : 0.05} />
        </linearGradient>
      </defs>
      <path d={path} fill="url(#integralGlow)" />
      {/* Boundary lines */}
      <line
        x1={scale.x(a)}
        y1={scale.y(0)}
        x2={scale.x(a)}
        y2={yA}
        stroke="#10b981"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <line
        x1={scale.x(b)}
        y1={scale.y(0)}
        x2={scale.x(b)}
        y2={yB}
        stroke="#10b981"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      {/* Integral numerical badge on graph */}
      <g
        transform={`translate(${scale.x((a + b) / 2) - 48}, ${badgeY})`}
      >
        <rect
          width={96}
          height={26}
          rx={6}
          fill={isDark ? "#0f172a" : "#ffffff"}
          stroke="#10b981"
          strokeWidth={1.2}
          opacity={0.92}
        />
        <text
          x={48}
          y={17}
          textAnchor="middle"
          fill={isDark ? "#34d399" : "#059669"}
          fontSize={11.5}
          fontWeight={600}
        >
          ∫ ≈ {value >= 0 ? "+" : ""}{value.toFixed(3)}
        </text>
      </g>
    </g>
  );
}

/** Critical points layer rendering roots, local extrema, and inflection points. */
export function CriticalPointsLayer({
  points,
  scale,
  onSelectPoint,
}: {
  points: CriticalPoint[];
  scale: PlotScale;
  onSelectPoint?: (pt: CriticalPoint) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <g className="critical-points-layer">
      {points.map((pt) => {
        const cx = scale.x(pt.x);
        const cy = scale.y(pt.y);
        const isHovered = hoveredId === pt.id;

        // Distinct mathematical colors
        let color = "#38bdf8"; // default blue
        if (pt.type === "root") color = "#06b6d4"; // cyan
        else if (pt.type === "local-max") color = "#f59e0b"; // amber gold
        else if (pt.type === "local-min") color = "#10b981"; // emerald
        else if (pt.type === "inflection") color = "#c084fc"; // purple
        else if (pt.type === "y-intercept") color = "#60a5fa"; // soft blue

        return (
          <g
            key={pt.id}
            className="critical-point-item"
            style={{ cursor: "pointer" }}
            onPointerEnter={() => setHoveredId(pt.id)}
            onPointerLeave={() => setHoveredId(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPoint?.(pt);
            }}
          >
            {/* Halo pulse */}
            <circle
              cx={cx}
              cy={cy}
              r={isHovered ? 13 : 9}
              fill={color}
              opacity={isHovered ? 0.35 : 0.18}
            />
            {/* Core dot */}
            <circle
              cx={cx}
              cy={cy}
              r={isHovered ? 5.5 : 4.5}
              fill={color}
              stroke="#ffffff"
              strokeWidth={1.5}
            />

            {/* Hover Tooltip Card */}
            {isHovered && (
              <g
                transform={`translate(${Math.min(
                  scale.width - 170,
                  Math.max(10, cx - 80),
                )}, ${cy > 60 ? cy - 46 : cy + 14})`}
                pointerEvents="none"
              >
                <rect
                  width={160}
                  height={38}
                  rx={8}
                  fill="#090d16"
                  stroke={color}
                  strokeWidth={1.5}
                  filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))"
                />
                <text
                  x={10}
                  y={16}
                  fill={color}
                  fontSize={10.5}
                  fontWeight={700}
                >
                  {pt.label}
                </text>
                <text
                  x={10}
                  y={30}
                  fill="#e2e8f0"
                  fontSize={11}
                  fontWeight={500}
                >
                  ({pt.x.toFixed(3)}, {pt.y.toFixed(3)})
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Sleek crosshair tracking layer with real-time tangent line and coordinates. */
export function CrosshairLayer({
  point,
  scale,
  padding,
  showTangent = true,
  fn,
  theme = "dark",
}: {
  point: { x: number; y: number } | null;
  scale: PlotScale;
  padding: { L: number; R: number; T: number; B: number };
  showTangent?: boolean;
  fn: (x: number) => number;
  theme?: "dark" | "light";
}) {
  if (!point) return null;
  const { width: W, height: H } = scale;
  const { L, R, T, B } = padding;
  const isDark = theme === "dark";

  const cx = scale.x(point.x);
  const cy = scale.y(point.y);

  // Compute instantaneous numerical derivative
  const slope = numericalDerivative(fn, point.x);
  const concavity = numericalSecondDerivative(fn, point.x);

  // Tangent line segment extending around cursor
  const deltaX = (scale.viewport.xMax - scale.viewport.xMin) * 0.18;
  const x1 = point.x - deltaX;
  const y1 = point.y - slope * deltaX;
  const x2 = point.x + deltaX;
  const y2 = point.y + slope * deltaX;

  const boxW = 196;
  const boxH = 50;
  const bx = Math.min(W - R - boxW - 8, Math.max(L + 8, cx + 14));
  const by = Math.max(T + 6, Math.min(H - B - boxH - 6, cy - 58));

  return (
    <g pointerEvents="none" className="plot-crosshair-layer">
      {/* Real-time Tangent Line */}
      {showTangent && (
        <line
          x1={scale.x(x1)}
          y1={scale.y(y1)}
          x2={scale.x(x2)}
          y2={scale.y(y2)}
          stroke="#f59e0b"
          strokeWidth={1.8}
          strokeDasharray="4 3"
        />
      )}

      {/* Axis Guidelines */}
      <line
        x1={cx}
        y1={T}
        x2={cx}
        y2={H - B}
        stroke={isDark ? "rgba(56, 189, 248, 0.4)" : "rgba(2, 132, 199, 0.4)"}
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <line
        x1={L}
        y1={cy}
        x2={W - R}
        y2={cy}
        stroke={isDark ? "rgba(56, 189, 248, 0.4)" : "rgba(2, 132, 199, 0.4)"}
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {/* Axis Projecting Badges */}
      <g transform={`translate(${cx - 24}, ${H - B + 3})`}>
        <rect
          width={48}
          height={18}
          rx={4}
          fill={isDark ? "#0f172a" : "#1e293b"}
        />
        <text
          x={24}
          y={13}
          textAnchor="middle"
          fill="#38bdf8"
          fontSize={10}
          fontWeight={600}
        >
          {point.x.toFixed(2)}
        </text>
      </g>
      <g transform={`translate(${L - 46}, ${cy - 9})`}>
        <rect
          width={42}
          height={18}
          rx={4}
          fill={isDark ? "#0f172a" : "#1e293b"}
        />
        <text
          x={21}
          y={13}
          textAnchor="middle"
          fill="#38bdf8"
          fontSize={10}
          fontWeight={600}
        >
          {point.y.toFixed(2)}
        </text>
      </g>

      {/* Crosshair Cursor Ring on Curve */}
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill="rgba(56, 189, 248, 0.2)"
        stroke="#38bdf8"
        strokeWidth={1.5}
      />
      <circle cx={cx} cy={cy} r={3.5} fill="#ffffff" />

      {/* Coordinate & Derivative Inspector Tooltip */}
      <g transform={`translate(${bx}, ${by})`}>
        <rect
          width={boxW}
          height={boxH}
          rx={9}
          fill={isDark ? "#0b1220" : "#ffffff"}
          stroke={isDark ? "#1e293b" : "#cbd5e1"}
          strokeWidth={1.5}
          filter="drop-shadow(0 6px 14px rgba(0,0,0,0.35))"
          opacity={0.97}
        />
        <text
          x={10}
          y={18}
          fill={isDark ? "#f8fafc" : "#0f172a"}
          fontSize={12}
          fontWeight={700}
        >
          x = {formatNumber(point.x)} · f(x) = {formatNumber(point.y)}
        </text>
        <text
          x={10}
          y={34}
          fill="#f59e0b"
          fontSize={11}
          fontWeight={600}
        >
          Slope dy/dx = {slope >= 0 ? "+" : ""}{slope.toFixed(3)}
        </text>
        <text
          x={10}
          y={46}
          fill={isDark ? "#94a3b8" : "#64748b"}
          fontSize={9.5}
        >
          {concavity > 0.05
            ? "∪ Concave up"
            : concavity < -0.05
              ? "∩ Concave down"
              : "— Inflection zone"}
        </text>
      </g>
    </g>
  );
}

/** Legacy TooltipLayer compatibility alias for callers */
export function TooltipLayer({
  point,
  scale,
  padding,
}: {
  point: { x: number; y: number } | null;
  scale: PlotScale;
  padding: { L: number; R: number; T: number; B: number };
}) {
  return (
    <CrosshairLayer
      point={point}
      scale={scale}
      padding={padding}
      showTangent={false}
      fn={(x) => (point ? point.y : x)}
    />
  );
}

/** Pinned points layer with interactive badges and selectable tangent vectors. */
export function PinnedPointsLayer({
  points,
  scale,
  showTangent,
  onRemove,
  selectedId,
  onSelect,
}: {
  points: PinnedPlotPoint[];
  scale: PlotScale;
  showTangent: boolean;
  onRemove: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { width: W, height: H } = scale;

  return (
    <g className="pinned-points-layer">
      {points.map((pt) => {
        const cx = scale.x(pt.x);
        const cy = scale.y(pt.y);
        const isSelected = selectedId === pt.id;

        // Tangent preview line
        let tangentPath = "";
        if (showTangent) {
          const deltaX = (scale.viewport.xMax - scale.viewport.xMin) * 0.16;
          const x1 = pt.x - deltaX;
          const y1 = pt.y - pt.slope * deltaX;
          const x2 = pt.x + deltaX;
          const y2 = pt.y + pt.slope * deltaX;
          tangentPath = `M ${scale.x(x1).toFixed(1)},${scale.y(y1).toFixed(1)} L ${scale.x(x2).toFixed(1)},${scale.y(y2).toFixed(1)}`;
        }

        const badgeW = 176;
        const badgeH = 48;
        const bx = Math.min(W - badgeW - 10, Math.max(10, cx - badgeW / 2));
        const by =
          cy > H / 2
            ? Math.max(10, cy - badgeH - 18)
            : Math.min(H - badgeH - 10, cy + 18);

        return (
          <g
            key={pt.id}
            className={`pinned-point-item ${isSelected ? "selected" : ""}`}
          >
            {showTangent && (
              <path
                d={tangentPath}
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="4 3"
                pointerEvents="none"
              />
            )}
            {/* Halo pulse */}
            <circle
              cx={cx}
              cy={cy}
              r={12}
              fill="rgba(37, 99, 235, 0.25)"
              className="pinned-point-pulse"
            />
            {/* Main Interactive Dot */}
            <circle
              cx={cx}
              cy={cy}
              r={7}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth={2.5}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(pt.id);
              }}
            />
            {/* Coordinate Badge */}
            <g
              transform={`translate(${bx}, ${by})`}
              className="pinned-point-badge"
              onClick={(e) => e.stopPropagation()}
            >
              <rect
                width={badgeW}
                height={badgeH}
                rx={8}
                fill="#0f172a"
                stroke={isSelected ? "#60a5fa" : "#334155"}
                strokeWidth={1.5}
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.35))"
              />
              <text
                x={10}
                y={19}
                fill="#ffffff"
                fontSize={12}
                fontWeight={600}
              >
                ({formatNumber(pt.x)}, {formatNumber(pt.y)})
              </text>
              <text x={10} y={36} fill="#94a3b8" fontSize={11}>
                slope dy/dx = {formatNumber(pt.slope)}
              </text>
              {/* Close Button */}
              <g
                transform={`translate(${badgeW - 24}, 8)`}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(pt.id);
                }}
                role="button"
                aria-label="Remove point"
              >
                <circle cx={8} cy={8} r={9} fill="#334155" />
                <path
                  d="M5 5 L11 11 M11 5 L5 11"
                  stroke="#ffffff"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}

/** Controls toolbar supporting zoom, reset, pan, and settings toggle. */
export function PlotControls({
  zoom,
  reset,
  pan,
  pointsCount,
  onClearPoints,
  showSettings,
  onToggleSettings,
  theme = "dark",
  onToggleTheme,
}: {
  zoom: (factor: number) => void;
  reset: () => void;
  pan: (x: number, y: number) => void;
  pointsCount?: number;
  onClearPoints?: () => void;
  showSettings?: boolean;
  onToggleSettings?: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}) {
  return (
    <div className={`plot-controls desmos-plot-controls ${theme}`}>
      <span className="plot-hint">
        Pan & wheel-zoom · Double-tap curve to mark coordinates
      </span>
      <div className="plot-buttons-group">
        <button
          aria-label="Pan left"
          onClick={() => pan(-0.15, 0)}
          title="Pan left"
        >
          ←
        </button>
        <button
          aria-label="Pan right"
          onClick={() => pan(0.15, 0)}
          title="Pan right"
        >
          →
        </button>
        <button
          aria-label="Pan up"
          onClick={() => pan(0, 0.15)}
          title="Pan up"
        >
          ↑
        </button>
        <button
          aria-label="Pan down"
          onClick={() => pan(0, -0.15)}
          title="Pan down"
        >
          ↓
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => zoom(1.25)}
          title="Zoom out"
        >
          <Minus size={16} />
        </button>
        <button
          aria-label="Zoom in"
          onClick={() => zoom(0.8)}
          title="Zoom in"
        >
          <Plus size={16} />
        </button>
        <button
          aria-label="Reset graph view"
          onClick={reset}
          title="Reset graph view"
        >
          <RotateCcw size={15} />
        </button>
        {onToggleTheme && (
          <button
            aria-label="Toggle dark/light theme"
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        )}
        {pointsCount !== undefined && pointsCount > 0 && onClearPoints && (
          <button
            aria-label="Clear pinned points"
            onClick={onClearPoints}
            title={`Clear ${pointsCount} pinned point(s)`}
            className="plot-clear-points-btn"
          >
            <Trash2 size={15} />
          </button>
        )}
        {onToggleSettings && (
          <button
            aria-label="Plot settings"
            onClick={onToggleSettings}
            title="Graph & calculus features"
            className={`plot-settings-btn ${showSettings ? "active" : ""}`}
          >
            <Settings size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * World-Class Desmos Graphic & Interactive Plot Component:
 * Features high-precision math grid, dynamic curve tracing, tangent slope calculation,
 * definite integral shading, auto-detected critical points, formula preset library,
 * custom expression sandbox, and smooth multi-touch/wheel zoom.
 */
export function InteractivePlot({
  initialViewport,
  fn,
  children,
  label,
  showPresetSwitcher = true,
  initialFormula = "(x - 2)^2 + 1",
}: {
  initialViewport: PlotViewport;
  fn: (x: number) => number;
  children?: (scale: PlotScale) => ReactNode;
  label: string;
  showPresetSwitcher?: boolean;
  initialFormula?: string;
}) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(720);

  // Resize observer for responsive rendering of the graph canvas column
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setCanvasWidth(w);
    };

    measure();
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const W = Math.max(300, Math.min(1100, canvasWidth));
  const isCompact = W < 500;
  const H = isCompact ? 340 : Math.min(460, Math.max(360, Math.round(W * 0.52)));

  const padding = {
    L: isCompact ? 44 : 54,
    R: isCompact ? 18 : 24,
    T: 26,
    B: isCompact ? 34 : 40,
  };
  const { L, R, T, B } = padding;

  // Custom formula expression and compiled function state
  const [customExpr, setCustomExpr] = useState<string>(initialFormula || "");
  const [customCompiledFn, setCustomCompiledFn] = useState<
    ((x: number) => number) | null
  >(null);

  const activeFn = useMemo(() => {
    if (customCompiledFn) {
      return customCompiledFn;
    }
    return fn;
  }, [customCompiledFn, fn]);

  // Viewport state
  const [viewport, setViewport] = useState<PlotViewport>(initialViewport);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [pinnedPoints, setPinnedPoints] = useState<PinnedPlotPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalculator, setShowCalculator] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [settledDomain, setSettledDomain] = useState<{ xMin: number; xMax: number }>({
    xMin: initialViewport.xMin,
    xMax: initialViewport.xMax,
  });
  const currentViewportRef = useRef<PlotViewport>(initialViewport);

  // Integral bounds [a, b]
  const [integralBounds, setIntegralBounds] = useState<[number, number]>([-2, 2]);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [userSettings, setUserSettings] = useState<Partial<DesmosPlotSettings>>({});

  const settings: DesmosPlotSettings = useMemo(() => {
    if (!mounted) return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem("uplift_math_studio_settings_v3");
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored), ...userSettings };
    } catch {}
    return { ...DEFAULT_SETTINGS, ...userSettings };
  }, [mounted, userSettings]);

  const updateSetting = <K extends keyof DesmosPlotSettings>(
    key: K,
    value: DesmosPlotSettings[K],
  ) => {
    setUserSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        const full = { ...settings, ...updated };
        localStorage.setItem("uplift_math_studio_settings_v3", JSON.stringify(full));
      } catch {}
      return updated;
    });
  };

  const drag = useRef<{
    x: number;
    y: number;
    viewport: PlotViewport;
    hasMoved?: boolean;
  } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(
    new Map(),
  );
  const pinchRef = useRef<{
    initialDist: number;
    initialViewport: PlotViewport;
    centerGraphX: number;
    centerGraphY: number;
  } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
    null,
  );
  const lastDoubleTriggerRef = useRef<{
    time: number;
    x: number;
    y: number;
  } | null>(null);
  const clip = useId().replace(/:/g, "");

  // PlotScale mapper
  const scale: PlotScale = useMemo(() => {
    const xSpan = viewport.xMax - viewport.xMin;
    const ySpan = viewport.yMax - viewport.yMin;
    return {
      viewport,
      width: W,
      height: H,
      x: (val) => L + ((val - viewport.xMin) / xSpan) * (W - L - R),
      y: (val) => H - B - ((val - viewport.yMin) / ySpan) * (H - T - B),
      invertX: (px) => viewport.xMin + ((px - L) / (W - L - R)) * xSpan,
      invertY: (py) => viewport.yMax - ((py - T) / (H - T - B)) * ySpan,
    };
  }, [viewport, W, H, L, R, T, B]);

  // Auto-detect critical points for active function in current visible domain
  // Throttle and preserve critical points during active dragging/panning by calculating against settledDomain
  const criticalPoints = useMemo(() => {
    if (!settings.showCriticalPoints) return [];
    return findCriticalPoints(activeFn, settledDomain.xMin, settledDomain.xMax);
  }, [activeFn, settledDomain.xMin, settledDomain.xMax, settings.showCriticalPoints]);

  // Zoom centered at arbitrary point (for wheel zoom)
  const zoomAt = useCallback(
    (factor: number, centerX?: number, centerY?: number) => {
      setViewport((v) => {
        const cx = centerX ?? (v.xMin + v.xMax) / 2;
        const cy = centerY ?? (v.yMin + v.yMax) / 2;

        const leftSpan = (cx - v.xMin) * factor;
        const rightSpan = (v.xMax - cx) * factor;
        const bottomSpan = (cy - v.yMin) * factor;
        const topSpan = (v.yMax - cy) * factor;

        const next: PlotViewport = {
          xMin: cx - Math.min(250, Math.max(0.1, leftSpan)),
          xMax: cx + Math.min(250, Math.max(0.1, rightSpan)),
          yMin: cy - Math.min(20000, Math.max(0.1, bottomSpan)),
          yMax: cy + Math.min(20000, Math.max(0.1, topSpan)),
        };
        currentViewportRef.current = next;
        setSettledDomain({ xMin: next.xMin, xMax: next.xMax });
        return next;
      });
    },
    [],
  );

  const pan = useCallback((dx: number, dy: number) => {
    setViewport((v) => {
      const next: PlotViewport = {
        xMin: v.xMin + dx * (v.xMax - v.xMin),
        xMax: v.xMax + dx * (v.xMax - v.xMin),
        yMin: v.yMin + dy * (v.yMax - v.yMin),
        yMax: v.yMax + dy * (v.yMax - v.yMin),
      };
      currentViewportRef.current = next;
      setSettledDomain({ xMin: next.xMin, xMax: next.xMax });
      return next;
    });
  }, []);

  // Dedicated non-passive wheel listener:
  // When cursor is inside the graph canvas, intercepts wheel events, prevents browser page scrolling,
  // and smoothly zooms the mathematical plot at cursor coordinates.
  // When cursor is outside the graph canvas, standard browser page scroll is unhindered.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const px = ((e.clientX - rect.left) / rect.width) * W;
      const py = ((e.clientY - rect.top) / rect.height) * H;
      const factor = e.deltaY < 0 ? 0.85 : 1.18;
      zoomAt(factor, scale.invertX(px), scale.invertY(py));
    };

    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      svg.removeEventListener("wheel", handleWheel);
    };
  }, [scale, zoomAt, W, H]);

  // Double tap handler
  const triggerDoubleTapAt = useCallback(
    (clientX: number, clientY: number, svgElement: SVGSVGElement) => {
      if (!settings.enableDoubleTap) return;

      const now = Date.now();
      if (
        lastDoubleTriggerRef.current &&
        now - lastDoubleTriggerRef.current.time < 250 &&
        Math.hypot(
          clientX - lastDoubleTriggerRef.current.x,
          clientY - lastDoubleTriggerRef.current.y,
        ) < 35
      ) {
        // Ignore duplicate trigger from the same double-click gesture (pointerdown + native dblclick)
        return;
      }
      lastDoubleTriggerRef.current = { time: now, x: clientX, y: clientY };

      const rect = svgElement.getBoundingClientRect();
      const px = ((clientX - rect.left) / rect.width) * W;
      const py = ((clientY - rect.top) / rect.height) * H;

      if (px < L || px > W - R || py < T || py > H - B) return;

      const graphX = scale.invertX(px);
      const graphY = settings.snapToCurve ? activeFn(graphX) : scale.invertY(py);
      if (!Number.isFinite(graphX) || !Number.isFinite(graphY)) return;

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

      setPinnedPoints((prev) => {
        const threshold = (viewport.xMax - viewport.xMin) * 0.035;
        const exists = prev.find((p) => Math.abs(p.x - graphX) < threshold);
        if (exists) {
          setSelectedPointId((curr) => (curr === exists.id ? null : curr));
          return prev.filter((p) => p.id !== exists.id);
        }
        setSelectedPointId(newPoint.id);
        return [...prev, newPoint];
      });
    },
    [settings, scale, activeFn, viewport, W, H, L, R, T, B],
  );

  // Compile custom expression
  const handleApplyCustomExpr = (expr: string) => {
    setCustomExpr(expr);
    const compiled = compileCustomExpression(expr);
    if (compiled) {
      const isInitialFormula =
        Boolean(initialFormula) &&
        expr.replace(/\s+/g, "").toLowerCase() ===
          initialFormula.replace(/\s+/g, "").toLowerCase();

      if (isInitialFormula) {
        setCustomCompiledFn(null);
        setViewport(initialViewport);
        currentViewportRef.current = initialViewport;
        setSettledDomain({
          xMin: initialViewport.xMin,
          xMax: initialViewport.xMax,
        });
      } else {
        setCustomCompiledFn(() => compiled);
        const customVp: PlotViewport = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
        setViewport(customVp);
        currentViewportRef.current = customVp;
        setSettledDomain({ xMin: -5, xMax: 5 });
      }
    }
  };

  return (
    <div
      className={`interactive-plot desmos-interactive-plot theme-${settings.theme}`}
      data-testid="interactive-plot"
    >
      {/* Minimal Hover Toolbar */}
      {showPresetSwitcher && (
        <div className="desmos-hover-toolbar" role="toolbar" aria-label="Plot controls">
          <button
            className={`desmos-mini-btn ${showCalculator ? "active" : ""}`}
            onClick={() => setShowCalculator((prev) => !prev)}
            title="Calculator"
            aria-label="Calculator"
          >
            <Calculator size={16} />
          </button>
          <button
            className={`desmos-mini-btn ${settings.showTangent ? "active" : ""}`}
            onClick={() => updateSetting("showTangent", !settings.showTangent)}
            title="Tangent line"
            aria-label="Toggle tangent"
          >
            <Activity size={16} />
          </button>
          <button
            className={`desmos-mini-btn ${settings.showCriticalPoints ? "active" : ""}`}
            onClick={() => updateSetting("showCriticalPoints", !settings.showCriticalPoints)}
            title="Critical points"
            aria-label="Toggle critical points"
          >
            <CircleDot size={16} />
          </button>
          <button
            className={`desmos-mini-btn ${settings.showIntegral ? "active" : ""}`}
            onClick={() => updateSetting("showIntegral", !settings.showIntegral)}
            title="Integral shading"
            aria-label="Toggle integral"
          >
            <Layers size={16} />
          </button>
          <div className="desmos-mini-sep" />
          <button
            className="desmos-mini-btn"
            onClick={() => updateSetting("theme", settings.theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {settings.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      )}

      {/* Definite Integral Interactive Toolbar */}
      {settings.showIntegral && (
        <div className="desmos-integral-toolbar" role="region" aria-label="Definite integral parameters">
          <div className="integral-param-group">
            <span className="integral-sym">∫</span>
            <label className="integral-bound-label" htmlFor="integral-bound-a">
              <span>a =</span>
              <input
                id="integral-bound-a"
                type="number"
                step="0.5"
                value={Number(integralBounds[0].toFixed(2))}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (Number.isFinite(val)) setIntegralBounds([val, integralBounds[1]]);
                }}
              />
            </label>
            <label className="integral-bound-label" htmlFor="integral-bound-b">
              <span>b =</span>
              <input
                id="integral-bound-b"
                type="number"
                step="0.5"
                value={Number(integralBounds[1].toFixed(2))}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (Number.isFinite(val)) setIntegralBounds([integralBounds[0], val]);
                }}
              />
            </label>
            <span className="integral-eval-pill">
              ∫[{integralBounds[0].toFixed(1)}, {integralBounds[1].toFixed(1)}] f(x)dx ≈{" "}
              <strong>
                {numericalDefiniteIntegral(activeFn, integralBounds[0], integralBounds[1]).toFixed(3)}
              </strong>
            </span>
          </div>
          <div className="integral-quick-buttons">
            <button
              type="button"
              className="desmos-mini-btn"
              onClick={() => setIntegralBounds([-2, 2])}
            >
              [-2, 2]
            </button>
            <button
              type="button"
              className="desmos-mini-btn"
              onClick={() => setIntegralBounds([0, 3])}
            >
              [0, 3]
            </button>
            <button
              type="button"
              className="desmos-mini-btn"
              onClick={() => setIntegralBounds([-Math.PI, Math.PI])}
            >
              [-π, π]
            </button>
          </div>
        </div>
      )}

      {/* Split Workspace: Left Calculator Sidebar + Right Graph Canvas */}
      <div className={`desmos-workspace-split ${showCalculator ? "with-calculator" : "without-calculator"}`}>
        {showCalculator && (
          <aside className="desmos-workspace-left" aria-label="Панель калькулятора">
            <MathCalculatorDrawer
              isOpen={showCalculator}
              onClose={() => setShowCalculator(false)}
              onPlotFunction={(formula) => {
                handleApplyCustomExpr(formula);
              }}
              initialExpr={customExpr || initialFormula || ""}
              theme={settings.theme}
            />
          </aside>
        )}

        <div className="desmos-workspace-right" ref={canvasContainerRef}>
          {/* Canvas Wrapper enclosing SVG Canvas and on-graph overlay badges */}
          <div className="desmos-canvas-wrapper" style={{ position: "relative" }}>
            {/* Active Formula Indicator Badge: only show when calculator is closed */}
            {!showCalculator && (
              <div className="desmos-active-formula-chip">
                <span className="formula-label">f(x) =</span>
                <code className="formula-text">
                  {customExpr || initialFormula || "Lesson Objective"}
                </code>
              </div>
            )}

        {/* Main SVG Graph Canvas */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={label}
          tabIndex={0}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            touchAction: "none",
            userSelect: "none",
          }}
          onDoubleClick={(e) => {
            e.preventDefault();
            triggerDoubleTapAt(e.clientX, e.clientY, e.currentTarget);
          }}
          onKeyDown={(e) => {
            if (
              [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "+",
                "-",
                "0",
              ].includes(e.key)
            ) {
              e.preventDefault();
              if (e.key === "+") zoomAt(0.8);
              else if (e.key === "-") zoomAt(1.25);
              else if (e.key === "0") {
                setViewport(initialViewport);
                currentViewportRef.current = initialViewport;
                setSettledDomain({ xMin: initialViewport.xMin, xMax: initialViewport.xMax });
              }
              else
                pan(
                  e.key === "ArrowLeft"
                    ? -0.15
                    : e.key === "ArrowRight"
                      ? 0.15
                      : 0,
                  e.key === "ArrowUp" ? 0.15 : e.key === "ArrowDown" ? -0.15 : 0,
                );
            }
          }}
          onPointerDown={(e) => {
            if (e.button !== 0 && e.pointerType === "mouse") return;
            activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (activePointersRef.current.size === 1) {
              const now = Date.now();
              const last = lastTapRef.current;
              const dist = last
                ? Math.hypot(e.clientX - last.x, e.clientY - last.y)
                : 999;

              if (last && now - last.time < 480 && dist < 32) {
                triggerDoubleTapAt(e.clientX, e.clientY, e.currentTarget);
                lastTapRef.current = null;
              } else {
                lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
              }

              drag.current = { x: e.clientX, y: e.clientY, viewport, hasMoved: false };
            } else if (activePointersRef.current.size === 2) {
            // Pinch zoom initialization
            drag.current = null;
            lastTapRef.current = null;
            const pts = Array.from(activePointersRef.current.values());
            const initialDistance = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
            const midX = (pts[0].x + pts[1].x) / 2;
            const midY = (pts[0].y + pts[1].y) / 2;
            const rect = e.currentTarget.getBoundingClientRect();
            const px = ((midX - rect.left) / rect.width) * W;
            const py = ((midY - rect.top) / rect.height) * H;

            pinchRef.current = {
              initialDist: Math.max(10, initialDistance),
              initialViewport: viewport,
              centerGraphX: scale.invertX(px),
              centerGraphY: scale.invertY(py),
            };
          }

          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
        }}
        onPointerUp={(e) => {
          activePointersRef.current.delete(e.pointerId);
          if (drag.current?.hasMoved || pinchRef.current) {
            setSettledDomain({
              xMin: currentViewportRef.current.xMin,
              xMax: currentViewportRef.current.xMax,
            });
          }
          if (activePointersRef.current.size < 2) {
            pinchRef.current = null;
          }
          if (activePointersRef.current.size === 0) {
            drag.current = null;
          }
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {}
        }}
        onPointerCancel={(e) => {
          activePointersRef.current.delete(e.pointerId);
          if (drag.current?.hasMoved || pinchRef.current) {
            setSettledDomain({
              xMin: currentViewportRef.current.xMin,
              xMax: currentViewportRef.current.xMax,
            });
          }
          if (activePointersRef.current.size < 2) {
            pinchRef.current = null;
          }
          if (activePointersRef.current.size === 0) {
            drag.current = null;
          }
        }}
        onPointerLeave={() => {
          setHover(null);
        }}
        onPointerMove={(e) => {
          if (activePointersRef.current.has(e.pointerId)) {
            activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          }

          // Two-finger pinch zoom
          if (activePointersRef.current.size === 2 && pinchRef.current) {
            const pts = Array.from(activePointersRef.current.values());
            const currentDistance = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
            const ratio = pinchRef.current.initialDist / Math.max(10, currentDistance);
            const { centerGraphX, centerGraphY, initialViewport: iv } = pinchRef.current;

            const leftSpan = (centerGraphX - iv.xMin) * ratio;
            const rightSpan = (iv.xMax - centerGraphX) * ratio;
            const bottomSpan = (centerGraphY - iv.yMin) * ratio;
            const topSpan = (iv.yMax - centerGraphY) * ratio;

            const nextVp: PlotViewport = {
              xMin: centerGraphX - Math.min(300, Math.max(0.05, leftSpan)),
              xMax: centerGraphX + Math.min(300, Math.max(0.05, rightSpan)),
              yMin: centerGraphY - Math.min(25000, Math.max(0.05, bottomSpan)),
              yMax: centerGraphY + Math.min(25000, Math.max(0.05, topSpan)),
            };
            currentViewportRef.current = nextVp;
            setViewport(nextVp);
            setHover(null);
            return;
          }

          // Single finger or mouse pan
          const rect = e.currentTarget.getBoundingClientRect();
          if (drag.current && activePointersRef.current.size === 1) {
            const d = drag.current;
            const dist = Math.hypot(e.clientX - d.x, e.clientY - d.y);
            const moveThreshold = e.pointerType === "touch" ? 12 : 10;
            if (!d.hasMoved && dist < moveThreshold) {
              return;
            }
            d.hasMoved = true;
            lastTapRef.current = null;

            const dx =
              ((((e.clientX - d.x) / rect.width) * W) / (W - L - R)) *
              (d.viewport.xMax - d.viewport.xMin);
            const dy =
              ((((e.clientY - d.y) / rect.height) * H) / (H - T - B)) *
              (d.viewport.yMax - d.viewport.yMin);
            const nextVp: PlotViewport = {
              xMin: d.viewport.xMin - dx,
              xMax: d.viewport.xMax - dx,
              yMin: d.viewport.yMin + dy,
              yMax: d.viewport.yMax + dy,
            };
            currentViewportRef.current = nextVp;
            setViewport(nextVp);
            setHover(null);
          } else if (settings.showHoverTooltip) {
            const px = ((e.clientX - rect.left) / rect.width) * W;
            if (px >= L && px <= W - R) {
              const xVal = scale.invertX(px);
              const yVal = activeFn(xVal);
              if (Number.isFinite(yVal)) {
                setHover({ x: xVal, y: yVal });
              } else {
                setHover(null);
              }
            } else {
              setHover(null);
            }
          }
        }}
      >
        <defs>
          <clipPath id={clip}>
            <rect x={L} y={T} width={W - L - R} height={H - T - B} />
          </clipPath>
        </defs>

        {/* 1. Pristine Coordinate Grid */}
        <CoordinateSystem
          scale={scale}
          padding={padding}
          showSubgrid={settings.showSubgrid}
          theme={settings.theme}
        />

        {/* 2. Scaled Mathematical Entities (Clipped to Plot Region) */}
        <g clipPath={`url(#${clip})`}>
          {/* Integral Shading Layer */}
          {settings.showIntegral && (
            <IntegralShadingLayer
              fn={activeFn}
              scale={scale}
              interval={integralBounds}
              theme={settings.theme}
            />
          )}

          {/* Primary Function Curve */}
          <FunctionPlot fn={activeFn} scale={scale} theme={settings.theme} />

          {/* Lab / Custom Children (e.g. Gradient Descent trajectory) only if on lesson function */}
          {(!customCompiledFn ||
            (Boolean(initialFormula) &&
              customExpr.replace(/\s+/g, "").toLowerCase() ===
                initialFormula.replace(/\s+/g, "").toLowerCase())) &&
            children?.(scale)}

          {/* Critical Points (Roots, Maxima, Minima, Inflection) */}
          {settings.showCriticalPoints && (
            <CriticalPointsLayer
              points={criticalPoints}
              scale={scale}
              onSelectPoint={(cp) => {
                const pt: PinnedPlotPoint = {
                  id: `crit-${cp.id}`,
                  x: cp.x,
                  y: cp.y,
                  slope: cp.slope,
                  label: cp.label,
                  source: "critical",
                };
                setPinnedPoints((prev) => {
                  if (prev.some((p) => p.id === pt.id)) return prev;
                  return [...prev, pt];
                });
                setSelectedPointId(pt.id);
              }}
            />
          )}

          {/* Pinned Points Layer */}
          <PinnedPointsLayer
            points={pinnedPoints}
            scale={scale}
            showTangent={settings.showTangent}
            selectedId={selectedPointId}
            onSelect={(id) => setSelectedPointId(id)}
            onRemove={(id) =>
              setPinnedPoints((pts) => pts.filter((p) => p.id !== id))
            }
          />

          {/* Smooth Cursor Crosshair & Tangent Layer */}
          {settings.showHoverTooltip && (
            <CrosshairLayer
              point={hover}
              scale={scale}
              padding={padding}
              showTangent={settings.showTangent && settings.hoverTangent}
              fn={activeFn}
              theme={settings.theme}
            />
          )}
        </g>
      </svg>

      {/* Selected Point Inspector Card */}
      {selectedPointId && (
        <div className="desmos-point-inspector-card">
          {(() => {
            const pt = pinnedPoints.find((p) => p.id === selectedPointId);
            if (!pt) return null;
            return (
              <div className="inspector-card-content">
                <div className="inspector-card-header">
                  <strong>
                    <CircleDot size={14} />
                    {pt.label ? pt.label : "Pinned Coordinate Point"}
                  </strong>
                  <button
                    className="icon-button"
                    onClick={() => setSelectedPointId(null)}
                    aria-label="Dismiss inspector"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="inspector-stats-grid">
                  <div className="inspector-stat">
                    <span>Position</span>
                    <strong>
                      ({formatNumber(pt.x)}, {formatNumber(pt.y)})
                    </strong>
                  </div>
                  <div className="inspector-stat">
                    <span>Slope dy/dx</span>
                    <strong style={{ color: "#f59e0b" }}>
                      {pt.slope >= 0 ? "+" : ""}{formatNumber(pt.slope)}
                    </strong>
                  </div>
                  {pt.concavity !== undefined && (
                    <div className="inspector-stat">
                      <span>Curvature d²y/dx²</span>
                      <strong>{formatNumber(pt.concavity)}</strong>
                    </div>
                  )}
                </div>
                <button
                  className="inspector-delete-btn"
                  onClick={() => {
                    setPinnedPoints((pts) =>
                      pts.filter((p) => p.id !== selectedPointId),
                    );
                    setSelectedPointId(null);
                  }}
                >
                  <Trash2 size={13} /> Remove point
                </button>
              </div>
            );
          })()}
        </div>
      )}
      </div>

      {/* Settings Popover Panel */}
      {showSettings && (
        <div
          className="desmos-settings-panel"
          role="region"
          aria-label="Настройки математического графика"
        >
          <div className="desmos-settings-header">
            <h4>
              <SlidersHorizontal size={15} /> Настройки графика и математики
            </h4>
            <button
              onClick={() => setShowSettings(false)}
              className="icon-button"
              aria-label="Закрыть настройки"
            >
              <X size={15} />
            </button>
          </div>
          <div className="desmos-settings-body">
            <label className="desmos-setting-row">
              <input
                type="checkbox"
                checked={settings.theme === "light"}
                onChange={(e) =>
                  updateSetting("theme", e.target.checked ? "light" : "dark")
                }
              />
              <div>
                <strong>Светлая яркая тема оформления</strong>
                <span>Высококонтрастное чистое полотно с четкой декартовой сеткой</span>
              </div>
            </label>
            <label className="desmos-setting-row">
              <input
                type="checkbox"
                checked={settings.showSubgrid}
                onChange={(e) => updateSetting("showSubgrid", e.target.checked)}
              />
              <div>
                <strong>Mathematical Sub-grid Lines</strong>
                <span>5 subdivision ticks per unit for precision coordinate tracing</span>
              </div>
            </label>
            <label className="desmos-setting-row">
              <input
                type="checkbox"
                checked={settings.showCriticalPoints}
                onChange={(e) =>
                  updateSetting("showCriticalPoints", e.target.checked)
                }
              />
              <div>
                <strong>Critical Points Auto-Detection</strong>
                <span>Detects roots, local minima, local maxima, and inflection points</span>
              </div>
            </label>
            <label className="desmos-setting-row">
              <input
                type="checkbox"
                checked={settings.showTangent}
                onChange={(e) => updateSetting("showTangent", e.target.checked)}
              />
              <div>
                <strong>Real-Time Tangent Line & Slope (dy/dx)</strong>
                <span>Displays derivative slope vector at cursor and pinned points</span>
              </div>
            </label>
            <label className="desmos-setting-row">
              <input
                type="checkbox"
                checked={settings.showIntegral}
                onChange={(e) => updateSetting("showIntegral", e.target.checked)}
              />
              <div>
                <strong>Definite Integral Shading ∫ f(x) dx</strong>
                <span>Visualizes the area under the curve with numerical integration</span>
              </div>
            </label>
            <label className="desmos-setting-row">
              <input
                type="checkbox"
                checked={settings.showHoverTooltip}
                onChange={(e) =>
                  updateSetting("showHoverTooltip", e.target.checked)
                }
              />
              <div>
                <strong>Curve Tracing Crosshair</strong>
                <span>Locks cursor to curve with projected coordinate guidelines</span>
              </div>
            </label>
            <label className="desmos-setting-row">
              <input
                type="checkbox"
                checked={settings.enableDoubleTap}
                onChange={(e) =>
                  updateSetting("enableDoubleTap", e.target.checked)
                }
              />
              <div>
                <strong>Double-Tap to Pin Point</strong>
                <span>Place sticky inspectable pins anywhere on the curve</span>
              </div>
            </label>

            {pinnedPoints.length > 0 && (
              <button
                className="desmos-clear-btn"
                onClick={() => setPinnedPoints([])}
              >
                <Trash2 size={14} /> Clear all {pinnedPoints.length} pinned point(s)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Plot Controls Footer */}
      <PlotControls
        zoom={(factor) => zoomAt(factor)}
        reset={() => {
          setCustomCompiledFn(null);
          setCustomExpr(initialFormula || "");
          setViewport(initialViewport);
          currentViewportRef.current = initialViewport;
          setSettledDomain({ xMin: initialViewport.xMin, xMax: initialViewport.xMax });
          setHover(null);
        }}
        pan={pan}
        pointsCount={pinnedPoints.length}
        onClearPoints={() => setPinnedPoints([])}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((s) => !s)}
        theme={settings.theme}
        onToggleTheme={() =>
          updateSetting("theme", settings.theme === "dark" ? "light" : "dark")
        }
      />
        </div>
      </div>
    </div>
  );
}
