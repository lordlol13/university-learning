"use client";
import {
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { formatNumber } from "@/lib/gradient-descent";

export interface PlotViewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}
export interface PlotScale {
  x: (value: number) => number;
  y: (value: number) => number;
  viewport: PlotViewport;
  width: number;
  height: number;
}
const L = 52,
  R = 22,
  T = 24,
  B = 38;
const subscribeCompact = (onChange: () => void) => {
  const media = window.matchMedia("(max-width: 600px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const getCompact = () => window.matchMedia("(max-width: 600px)").matches;
const getServerCompact = () => false;
export function CoordinateSystem({ scale }: { scale: PlotScale }) {
  const { viewport: v, x, y, width: W, height: H } = scale;
  const ticks = W < 500 ? 4 : 8;
  return (
    <g className="plot-coordinates">
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const value = v.xMin + ((v.xMax - v.xMin) * i) / ticks;
        return (
          <g key={`x${i}`}>
            <line x1={x(value)} y1={T} x2={x(value)} y2={H - B} />
            <text x={x(value)} y={H - 14} textAnchor="middle">
              {Number(value.toFixed(1))}
            </text>
          </g>
        );
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const value = v.yMin + ((v.yMax - v.yMin) * i) / 5;
        return (
          <g key={`y${i}`}>
            <line x1={L} y1={y(value)} x2={W - R} y2={y(value)} />
            <text x={L - 10} y={y(value) + 4} textAnchor="end">
              {Number(value.toFixed(1))}
            </text>
          </g>
        );
      })}
      <line className="plot-axis" x1={x(0)} y1={T} x2={x(0)} y2={H - B} />
      <line className="plot-axis" x1={L} y1={y(0)} x2={W - R} y2={y(0)} />
      <text x={W - R} y={H - 2}>
        x
      </text>
      <text x={12} y={14}>
        f(x)
      </text>
    </g>
  );
}
export function FunctionPlot({
  fn,
  scale,
}: {
  fn: (x: number) => number;
  scale: PlotScale;
}) {
  const path = Array.from({ length: 241 }, (_, i) => {
    const x =
      scale.viewport.xMin +
      ((scale.viewport.xMax - scale.viewport.xMin) * i) / 240;
    return `${i ? "L" : "M"}${scale.x(x).toFixed(2)},${scale.y(fn(x)).toFixed(2)}`;
  }).join(" ");
  return (
    <path
      d={path}
      fill="none"
      stroke="#3988d5"
      strokeWidth={3}
      vectorEffect="non-scaling-stroke"
    />
  );
}
export function TooltipLayer({
  point,
  scale,
}: {
  point: { x: number; y: number } | null;
  scale: PlotScale;
}) {
  if (!point) return null;
  const { width: W, height: H } = scale;
  const x = Math.min(W - 180, Math.max(L, scale.x(point.x) + 12)),
    y = Math.max(T, Math.min(H - B - 35, scale.y(point.y) - 42));
  return (
    <g pointerEvents="none">
      <circle
        cx={scale.x(point.x)}
        cy={scale.y(point.y)}
        r={5}
        fill="#253f56"
      />
      <rect x={x} y={y} width={166} height={30} rx={8} fill="#203c33" />
      <text x={x + 10} y={y + 20} fill="white" fontSize={12}>
        x {formatNumber(point.x)} · f {formatNumber(point.y)}
      </text>
    </g>
  );
}
export function PlotControls({
  zoom,
  reset,
  pan,
}: {
  zoom: (factor: number) => void;
  reset: () => void;
  pan: (x: number, y: number) => void;
}) {
  return (
    <div className="plot-controls">
      <span>Drag to pan · + / − to zoom</span>
      <div>
        <button aria-label="Pan left" onClick={() => pan(-0.15, 0)}>
          ←
        </button>
        <button aria-label="Pan right" onClick={() => pan(0.15, 0)}>
          →
        </button>
        <button aria-label="Pan up" onClick={() => pan(0, 0.15)}>
          ↑
        </button>
        <button aria-label="Pan down" onClick={() => pan(0, -0.15)}>
          ↓
        </button>
        <button aria-label="Zoom out" onClick={() => zoom(1.25)}>
          <Minus size={17} />
        </button>
        <button aria-label="Zoom in" onClick={() => zoom(0.8)}>
          <Plus size={17} />
        </button>
        <button aria-label="Reset graph view" onClick={reset}>
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
export function InteractivePlot({
  initialViewport,
  fn,
  children,
  label,
}: {
  initialViewport: PlotViewport;
  fn: (x: number) => number;
  children?: (scale: PlotScale) => ReactNode;
  label: string;
}) {
  const compact = useSyncExternalStore(
    subscribeCompact,
    getCompact,
    getServerCompact,
  );
  const W = compact ? 360 : 720,
    H = compact ? 320 : 370;
  const [viewport, setViewport] = useState(initialViewport);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; viewport: PlotViewport } | null>(
    null,
  );
  const clip = useId().replace(/:/g, "");
  const scale: PlotScale = {
    viewport,
    width: W,
    height: H,
    x: (value) =>
      L +
      ((value - viewport.xMin) / (viewport.xMax - viewport.xMin)) * (W - L - R),
    y: (value) =>
      H -
      B -
      ((value - viewport.yMin) / (viewport.yMax - viewport.yMin)) * (H - T - B),
  };
  const zoom = (factor: number) =>
    setViewport((v) => {
      const cx = (v.xMin + v.xMax) / 2,
        cy = (v.yMin + v.yMax) / 2;
      const dx = Math.min(200, Math.max(0.2, (v.xMax - v.xMin) * factor)) / 2,
        dy = Math.min(20000, Math.max(0.2, (v.yMax - v.yMin) * factor)) / 2;
      return { xMin: cx - dx, xMax: cx + dx, yMin: cy - dy, yMax: cy + dy };
    });
  const pan = (dx: number, dy: number) =>
    setViewport((v) => ({
      xMin: v.xMin + dx * (v.xMax - v.xMin),
      xMax: v.xMax + dx * (v.xMax - v.xMin),
      yMin: v.yMin + dy * (v.yMax - v.yMin),
      yMax: v.yMax + dy * (v.yMax - v.yMin),
    }));
  return (
    <div className="interactive-plot">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        tabIndex={0}
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
            if (e.key === "+") zoom(0.8);
            else if (e.key === "-") zoom(1.25);
            else if (e.key === "0") setViewport(initialViewport);
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
          if (e.button !== 0) return;
          drag.current = { x: e.clientX, y: e.clientY, viewport };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          drag.current = null;
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          if (drag.current) {
            const d = drag.current,
              dx =
                ((((e.clientX - d.x) / rect.width) * W) / (W - L - R)) *
                (d.viewport.xMax - d.viewport.xMin),
              dy =
                ((((e.clientY - d.y) / rect.height) * H) / (H - T - B)) *
                (d.viewport.yMax - d.viewport.yMin);
            setViewport({
              xMin: d.viewport.xMin - dx,
              xMax: d.viewport.xMax - dx,
              yMin: d.viewport.yMin + dy,
              yMax: d.viewport.yMax + dy,
            });
            setHover(null);
          } else {
            const x =
              viewport.xMin +
              ((((e.clientX - rect.left) / rect.width) * W - L) / (W - L - R)) *
                (viewport.xMax - viewport.xMin);
            setHover({ x, y: fn(x) });
          }
        }}
      >
        <defs>
          <clipPath id={clip}>
            <rect x={L} y={T} width={W - L - R} height={H - T - B} />
          </clipPath>
        </defs>
        <CoordinateSystem scale={scale} />
        <g clipPath={`url(#${clip})`}>
          <FunctionPlot fn={fn} scale={scale} />
          {children?.(scale)}
          <TooltipLayer point={hover} scale={scale} />
        </g>
      </svg>
      <PlotControls
        zoom={zoom}
        reset={() => {
          setViewport(initialViewport);
          setHover(null);
        }}
        pan={pan}
      />
    </div>
  );
}
