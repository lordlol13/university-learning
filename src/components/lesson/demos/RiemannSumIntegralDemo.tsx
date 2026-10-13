"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function RiemannSumIntegralDemo({
  completed,
  onComplete,
  title = "Definite Integral as Riemann Accumulation",
  caption = "Drag the partition handle on the bottom axis to slice the area into thinner rectangles and see the sum converge to the exact integral.",
}: Props) {
  // Number of rectangles N in [3, 36]
  const [n, setN] = useState<number>(6);
  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Interval [a, b]
  const a = 0.5;
  const b = 4.5;
  // Function: f(x) = 0.25 * x^2 + 0.8
  const f = (x: number) => 0.25 * x * x + 0.8;

  // Exact integral of 0.25*x^2 + 0.8 from 0.5 to 4.5
  // F(x) = (0.25/3)*x^3 + 0.8*x = (1/12)*x^3 + 0.8*x
  const F = (x: number) => (1 / 12) * Math.pow(x, 3) + 0.8 * x;
  const exactArea = F(b) - F(a);

  // Midpoint Riemann sum
  const dx = (b - a) / n;
  let riemannSum = 0;
  const rects: Array<{ x: number; w: number; h: number }> = [];

  for (let i = 0; i < n; i++) {
    const xMid = a + (i + 0.5) * dx;
    const height = f(xMid);
    riemannSum += height * dx;
    rects.push({ x: a + i * dx, w: dx, h: height });
  }

  const error = Math.abs(riemannSum - exactArea);

  const metrics: DemoMetric[] = [
    { label: "Slices (N)", value: n, color: "#6366f1" },
    { label: "Width Δx", value: dx.toFixed(2), color: "#0d9488" },
    { label: "Riemann Sum Σ", value: riemannSum.toFixed(2), color: "#f59e0b" },
    { label: "Exact ∫ f(x)dx", value: exactArea.toFixed(2), color: "#0d9488" },
    { label: "Approximation Error", value: error.toFixed(3), color: error < 0.05 ? "#0d9488" : "#ef4444" },
  ];

  // SVG dimensions
  const ox = 50;
  const oy = 240;
  const scaleX = 75;
  const scaleY = 32;

  const toPx = (x: number, y: number) => ({
    px: ox + x * scaleX,
    py: oy - y * scaleY,
  });

  // Curve path
  const curvePts: string[] = [];
  for (let x = 0; x <= 5.0; x += 0.1) {
    const p = toPx(x, f(x));
    curvePts.push(`${p.px.toFixed(1)},${p.py.toFixed(1)}`);
  }
  const curvePath = `M ${curvePts.join(" L ")}`;

  // Slider coordinate for N: maps n in [3, 36] to slider track x in [70, 390]
  const sliderStartX = 70;
  const sliderEndX = 390;
  const sliderY = 275;
  const handleX = sliderStartX + ((n - 3) / (36 - 3)) * (sliderEndX - sliderStartX);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;
    const t = Math.max(0, Math.min(1, (svgX - sliderStartX) / (sliderEndX - sliderStartX)));
    const nextN = Math.round(3 + t * (36 - 3));
    setN(nextN);
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
    setN(6);
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
        {/* Shaded exact area background */}
        <path
          d={`M ${toPx(a, 0).px} ${toPx(a, 0).py} L ${toPx(a, f(a)).px} ${toPx(a, f(a)).py} ${curvePts
            .filter((_, idx) => idx >= 5 && idx <= 45)
            .map((p) => `L ${p}`)
            .join(" ")} L ${toPx(b, f(b)).px} ${toPx(b, f(b)).py} L ${toPx(b, 0).px} ${toPx(b, 0).py} Z`}
          fill="rgba(13, 148, 136, 0.12)"
        />

        {/* Riemann Rectangles */}
        {rects.map((r, i) => {
          const pTopLeft = toPx(r.x, r.h);
          const wPx = r.w * scaleX;
          const hPx = r.h * scaleY;
          return (
            <rect
              key={i}
              x={pTopLeft.px}
              y={pTopLeft.py}
              width={wPx}
              height={hPx}
              fill="rgba(99, 102, 241, 0.25)"
              stroke="#6366f1"
              strokeWidth={1}
            />
          );
        })}

        {/* Axes */}
        <line x1={ox} y1={oy} x2={410} y2={oy} stroke="#cbd5e1" strokeWidth={1.5} />
        <line x1={ox} y1={oy} x2={ox} y2={30} stroke="#cbd5e1" strokeWidth={1.5} />
        <text x={415} y={oy + 4} fill="#64748b" fontSize="11" fontWeight="600">x</text>
        <text x={ox - 4} y={20} fill="#64748b" fontSize="11" fontWeight="600">f(x)</text>

        {/* Integration interval markers [a, b] */}
        <text x={toPx(a, 0).px} y={oy + 16} fontSize="11" fill="#0d9488" textAnchor="middle" fontWeight="700">a</text>
        <text x={toPx(b, 0).px} y={oy + 16} fontSize="11" fill="#0d9488" textAnchor="middle" fontWeight="700">b</text>

        {/* Function Curve */}
        <path d={curvePath} fill="none" stroke="#0d9488" strokeWidth={2.5} />

        {/* Draggable Partition Slider Track */}
        <g>
          <line
            x1={sliderStartX}
            y1={sliderY}
            x2={sliderEndX}
            y2={sliderY}
            stroke="#e2e8f0"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <line
            x1={sliderStartX}
            y1={sliderY}
            x2={handleX}
            y2={sliderY}
            stroke="#6366f1"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <text x={sliderStartX} y={sliderY - 10} fontSize="10" fill="#64748b">Fewer slices (Δx wide)</text>
          <text x={sliderEndX} y={sliderY - 10} fontSize="10" fill="#64748b" textAnchor="end">Infinite slices (dx → 0)</text>

          {/* Slider Thumb Handle */}
          <g
            transform={`translate(${handleX}, ${sliderY})`}
            style={{ cursor: "grab" }}
            onPointerDown={handlePointerDown}
          >
            <circle r={20} fill="transparent" />
            <circle r={9} fill="#6366f1" opacity={0.2} />
            <circle r={7} fill="#ffffff" stroke="#6366f1" strokeWidth={3} />
          </g>
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
