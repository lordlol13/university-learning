"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function DerivativeTangentDemo({
  completed,
  onComplete,
  title = "Derivative & Tangent Line Slope",
  caption = "Drag the point along the curve to observe how the tangent line slope dy/dx measures instantaneous rate of change.",
}: Props) {
  // x parameter in range [-3, 3]
  const [xVal, setXVal] = useState<number>(0.8);
  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Curve definition: cubic f(x) = 0.2*x^3 - 1.2*x + 1
  // Derivative: f'(x) = 0.6*x^2 - 1.2
  const f = (x: number) => 0.2 * Math.pow(x, 3) - 1.2 * x + 1.2;
  const df = (x: number) => 0.6 * Math.pow(x, 2) - 1.2;

  const yVal = f(xVal);
  const slope = df(xVal);

  let stateLabel = "Rising (dy/dx > 0)";
  if (Math.abs(slope) < 0.1) stateLabel = "Stationary Point (dy/dx ≈ 0)";
  else if (slope < 0) stateLabel = "Falling (dy/dx < 0)";

  const metrics: DemoMetric[] = [
    { label: "Position x", value: xVal.toFixed(2), color: "#0d9488" },
    { label: "Value f(x)", value: yVal.toFixed(2), color: "#6366f1" },
    { label: "Derivative f'(x) [Slope]", value: slope.toFixed(2), color: Math.abs(slope) < 0.1 ? "#f59e0b" : slope > 0 ? "#0d9488" : "#ef4444" },
    { label: "Behavior", value: stateLabel, color: "#1e293b" },
  ];

  // SVG coordinate transformation
  // Canvas width 440, height 300
  // Center math (0, 0) -> SVG (220, 160), scale 45 px/unit
  const ox = 220;
  const oy = 160;
  const scale = 45;

  const toPx = (x: number, y: number) => ({
    px: ox + x * scale,
    py: oy - y * scale,
  });

  const ptPx = toPx(xVal, yVal);

  // Generate curve path
  const curvePts: string[] = [];
  for (let x = -3.2; x <= 3.2; x += 0.08) {
    const p = toPx(x, f(x));
    curvePts.push(`${p.px.toFixed(1)},${p.py.toFixed(1)}`);
  }
  const curvePath = `M ${curvePts.join(" L ")}`;

  // Tangent line segment from xVal - 1.5 to xVal + 1.5
  const tStart = toPx(xVal - 1.4, yVal - slope * 1.4);
  const tEnd = toPx(xVal + 1.4, yVal + slope * 1.4);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;
    let mx = (svgX - ox) / scale;
    mx = Math.max(-2.8, Math.min(2.8, mx));
    setXVal(Math.round(mx * 100) / 100);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const reset = useCallback(() => {
    setXVal(0.8);
  }, []);

  return (
    <InteractiveDemoContainer
      title={title}
      caption={caption}
      metrics={metrics}
      onReset={reset}
      completed={completed}
      onMeaningfulInteraction={onComplete}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 440 300"
        className="tactile-svg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Axes */}
        <line x1={30} y1={oy} x2={410} y2={oy} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={ox} y1={280} x2={ox} y2={20} stroke="#cbd5e1" strokeWidth={1} />
        <text x={415} y={oy + 4} fill="#64748b" fontSize="11" fontWeight="600">x</text>
        <text x={ox - 4} y={15} fill="#64748b" fontSize="11" fontWeight="600">y</text>

        {/* Function Curve */}
        <path
          d={curvePath}
          fill="none"
          stroke="#0d9488"
          strokeWidth={3}
        />

        {/* Tangent Line */}
        <line
          x1={tStart.px}
          y1={tStart.py}
          x2={tEnd.px}
          y2={tEnd.py}
          stroke="#f59e0b"
          strokeWidth={2.5}
          strokeDasharray="6,4"
        />

        {/* Tangent slope triangle (run = 0.8, rise = slope * 0.8) */}
        {Math.abs(slope) > 0.15 && (
          <g opacity={0.65}>
            {/* Run */}
            <line
              x1={ptPx.px}
              y1={ptPx.py}
              x2={ptPx.px + 0.8 * scale}
              y2={ptPx.py}
              stroke="#64748b"
              strokeWidth={1.5}
            />
            {/* Rise */}
            <line
              x1={ptPx.px + 0.8 * scale}
              y1={ptPx.py}
              x2={ptPx.px + 0.8 * scale}
              y2={ptPx.py - slope * 0.8 * scale}
              stroke="#f59e0b"
              strokeWidth={1.5}
            />
            <text
              x={ptPx.px + 0.4 * scale}
              y={ptPx.py + 14}
              fontSize="10"
              fill="#64748b"
              textAnchor="middle"
            >
              dx
            </text>
            <text
              x={ptPx.px + 0.8 * scale + 6}
              y={ptPx.py - (slope * 0.8 * scale) / 2}
              fontSize="10"
              fill="#f59e0b"
            >
              dy
            </text>
          </g>
        )}

        {/* Draggable point along the curve */}
        <g
          transform={`translate(${ptPx.px}, ${ptPx.py})`}
          style={{ cursor: "grab" }}
          onPointerDown={handlePointerDown}
        >
          <circle r={22} fill="transparent" />
          <circle r={10} fill="#f59e0b" opacity={0.2} />
          <circle r={7} fill="#ffffff" stroke="#f59e0b" strokeWidth={3} />
          <circle r={2.5} fill="#f59e0b" />
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
