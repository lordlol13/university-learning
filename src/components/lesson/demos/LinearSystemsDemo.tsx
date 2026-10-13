"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function LinearSystemsDemo({
  completed,
  onComplete,
  title = "System of Linear Equations (Intersection)",
  caption = "Drag the control handle on Line 1 or Line 2 to find their unique intersection point or create parallel lines.",
}: Props) {
  // Line 1: control point at (x1, y1) -> line passes through (0, 1) and (x1, y1)
  // m1 = (y1 - 1) / x1
  const [p1, setP1] = useState<{ x: number; y: number }>({ x: 3, y: 3.5 });
  // Line 2: control point at (x2, y2) -> line passes through (0, -2) and (x2, y2)
  // m2 = (y2 - (-2)) / x2
  const [p2, setP2] = useState<{ x: number; y: number }>({ x: 4, y: 1 });

  const draggingTargetRef = useRef<1 | 2 | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const b1 = 1;
  const m1 = p1.x !== 0 ? (p1.y - b1) / p1.x : 1;

  const b2 = -2;
  const m2 = p2.x !== 0 ? (p2.y - b2) / p2.x : -0.5;

  // Intersection: m1*x + b1 = m2*x + b2 => (m1 - m2)*x = b2 - b1
  const slopeDiff = m1 - m2;
  const isParallel = Math.abs(slopeDiff) < 0.08;
  const intersectX = !isParallel ? (b2 - b1) / slopeDiff : 0;
  const intersectY = !isParallel ? m1 * intersectX + b1 : 0;

  const solutionText = isParallel
    ? "No Solution (Parallel lines)"
    : `(x* = ${intersectX.toFixed(2)}, y* = ${intersectY.toFixed(2)})`;

  const metrics: DemoMetric[] = [
    { label: "Line 1 Slope (m₁)", value: m1.toFixed(2), color: "#0d9488" },
    { label: "Line 2 Slope (m₂)", value: m2.toFixed(2), color: "#8b5cf6" },
    { label: "Intersection (x*, y*)", value: solutionText, color: isParallel ? "#ef4444" : "#0d9488" },
  ];

  const ox = 190;
  const oy = 150;
  const scale = 26;

  const toPx = (x: number, y: number) => ({
    px: ox + x * scale,
    py: oy - y * scale,
  });

  const p1Px = toPx(p1.x, p1.y);
  const p2Px = toPx(p2.x, p2.y);
  const interPx = toPx(intersectX, intersectY);

  const startDrag = (target: 1 | 2, e: React.PointerEvent) => {
    draggingTargetRef.current = target;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTargetRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;
    const svgY = ((e.clientY - rect.top) / rect.height) * 300;

    let mx = (svgX - ox) / scale;
    let my = (oy - svgY) / scale;
    mx = Math.max(-6, Math.min(6, mx));
    my = Math.max(-5, Math.min(5, my));
    if (Math.abs(mx) < 0.5) mx = mx >= 0 ? 0.5 : -0.5;

    const rounded = { x: Math.round(mx * 10) / 10, y: Math.round(my * 10) / 10 };
    if (draggingTargetRef.current === 1) setP1(rounded);
    else setP2(rounded);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    draggingTargetRef.current = null;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const reset = useCallback(() => {
    setP1({ x: 3, y: 3.5 });
    setP2({ x: 4, y: 1 });
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
        {/* Grid & Axes */}
        <line x1={20} y1={oy} x2={420} y2={oy} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={ox} y1={280} x2={ox} y2={20} stroke="#cbd5e1" strokeWidth={1} />

        {/* Line 1: passes through (x=-7, y=m1*-7+b1) to (x=7, y=m1*7+b1) */}
        <line
          x1={toPx(-7, m1 * -7 + b1).px}
          y1={toPx(-7, m1 * -7 + b1).py}
          x2={toPx(7, m1 * 7 + b1).px}
          y2={toPx(7, m1 * 7 + b1).py}
          stroke="#0d9488"
          strokeWidth={2.5}
        />

        {/* Line 2: passes through (x=-7, y=m2*-7+b2) to (x=7, y=m2*7+b2) */}
        <line
          x1={toPx(-7, m2 * -7 + b2).px}
          y1={toPx(-7, m2 * -7 + b2).py}
          x2={toPx(7, m2 * 7 + b2).px}
          y2={toPx(7, m2 * 7 + b2).py}
          stroke="#8b5cf6"
          strokeWidth={2.5}
        />

        {/* Unique Intersection Point */}
        {!isParallel && Math.abs(intersectX) <= 6 && Math.abs(intersectY) <= 5 && (
          <g transform={`translate(${interPx.px}, ${interPx.py})`}>
            <circle r={12} fill="#f59e0b" opacity={0.25} />
            <circle r={6} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
            <text x={10} y={-8} fill="#f59e0b" fontSize="11" fontWeight="700">
              ({intersectX.toFixed(1)}, {intersectY.toFixed(1)})
            </text>
          </g>
        )}

        {/* Control Handle 1 */}
        <g
          transform={`translate(${p1Px.px}, ${p1Px.py})`}
          style={{ cursor: "grab" }}
          onPointerDown={(e) => startDrag(1, e)}
        >
          <circle r={22} fill="transparent" />
          <circle r={8} fill="#0d9488" opacity={0.2} />
          <circle r={6} fill="#ffffff" stroke="#0d9488" strokeWidth={3} />
          <text x={10} y={-6} fill="#0d9488" fontSize="11" fontWeight="700">Line 1</text>
        </g>

        {/* Control Handle 2 */}
        <g
          transform={`translate(${p2Px.px}, ${p2Px.py})`}
          style={{ cursor: "grab" }}
          onPointerDown={(e) => startDrag(2, e)}
        >
          <circle r={22} fill="transparent" />
          <circle r={8} fill="#8b5cf6" opacity={0.2} />
          <circle r={6} fill="#ffffff" stroke="#8b5cf6" strokeWidth={3} />
          <text x={10} y={-6} fill="#8b5cf6" fontSize="11" fontWeight="700">Line 2</text>
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
