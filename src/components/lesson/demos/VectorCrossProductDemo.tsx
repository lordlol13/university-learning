"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function VectorCrossProductDemo({
  completed,
  onComplete,
  title = "Cross Product & Parallelogram Area",
  caption = "Drag vector A or B to observe the spanned parallelogram area and right-hand orientation.",
}: Props) {
  const [a, setA] = useState<{ x: number; y: number }>({ x: 5, y: 1 });
  const [b, setB] = useState<{ x: number; y: number }>({ x: 2, y: 4.5 });
  const draggingTargetRef = useRef<"A" | "B" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const magA = Math.hypot(a.x, a.y);
  const magB = Math.hypot(b.x, b.y);

  // 2D cross product scalar (z-component)
  const crossZ = a.x * b.y - a.y * b.x;
  const area = Math.abs(crossZ);

  // Angle
  const dot = a.x * b.x + a.y * b.y;
  const cosTheta = magA > 0 && magB > 0 ? Math.max(-1, Math.min(1, dot / (magA * magB))) : 0;
  const thetaDeg = (Math.acos(cosTheta) * 180) / Math.PI;

  const directionLabel = crossZ > 0.1 ? "Out of screen ⊙ (+Z)" : crossZ < -0.1 ? "Into screen ⊗ (-Z)" : "Collinear (Zero)";

  const metrics: DemoMetric[] = [
    { label: "|A|", value: magA.toFixed(1), color: "#0d9488" },
    { label: "|B|", value: magB.toFixed(1), color: "#8b5cf6" },
    { label: "Angle θ", value: `${thetaDeg.toFixed(1)}°`, color: "#f59e0b" },
    { label: "Parallelogram Area", value: area.toFixed(1), color: "#0d9488" },
    { label: "|A × B| Magnitude", value: area.toFixed(1), color: "#0d9488" },
    { label: "Normal Direction", value: directionLabel, color: "#1e293b" },
  ];

  const ox = 90;
  const oy = 250;
  const scale = 24;

  const tipA = { x: ox + a.x * scale, y: oy - a.y * scale };
  const tipB = { x: ox + b.x * scale, y: oy - b.y * scale };
  const cornerAB = { x: ox + (a.x + b.x) * scale, y: oy - (a.y + b.y) * scale };

  const startDrag = (target: "A" | "B", e: React.PointerEvent) => {
    draggingTargetRef.current = target;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTargetRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;
    const svgY = ((e.clientY - rect.top) / rect.height) * 320;

    let mx = (svgX - ox) / scale;
    let my = (oy - svgY) / scale;
    mx = Math.max(-2, Math.min(11, mx));
    my = Math.max(-2, Math.min(9, my));

    const rounded = { x: Math.round(mx * 10) / 10, y: Math.round(my * 10) / 10 };
    if (draggingTargetRef.current === "A") setA(rounded);
    else setB(rounded);
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
    setA({ x: 5, y: 1 });
    setB({ x: 2, y: 4.5 });
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
        viewBox="0 0 440 320"
        className="tactile-svg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <marker
            id="arrow-teal-cross"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0d9488" />
          </marker>
          <marker
            id="arrow-purple-cross"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
          </marker>
        </defs>

        {/* Axes */}
        <line x1={30} y1={oy} x2={410} y2={oy} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={ox} y1={300} x2={ox} y2={20} stroke="#cbd5e1" strokeWidth={1} />

        {/* Parallelogram area polygon */}
        <polygon
          points={`${ox},${oy} ${tipA.x},${tipA.y} ${cornerAB.x},${cornerAB.y} ${tipB.x},${tipB.y}`}
          fill={crossZ >= 0 ? "rgba(13, 148, 136, 0.18)" : "rgba(239, 68, 68, 0.18)"}
          stroke={crossZ >= 0 ? "#0d9488" : "#ef4444"}
          strokeWidth={1.5}
          strokeDasharray="4,4"
        />

        {/* Area center label */}
        <text
          x={(ox + cornerAB.x) / 2}
          y={(oy + cornerAB.y) / 2 + 5}
          textAnchor="middle"
          fill={crossZ >= 0 ? "#0f766e" : "#b91c1c"}
          fontSize="13"
          fontWeight="700"
        >
          Area = {area.toFixed(1)}
        </text>

        {/* Vector A */}
        <line
          x1={ox}
          y1={oy}
          x2={tipA.x}
          y2={tipA.y}
          stroke="#0d9488"
          strokeWidth={3.5}
          markerEnd="url(#arrow-teal-cross)"
        />

        {/* Vector B */}
        <line
          x1={ox}
          y1={oy}
          x2={tipB.x}
          y2={tipB.y}
          stroke="#8b5cf6"
          strokeWidth={3.5}
          markerEnd="url(#arrow-purple-cross)"
        />

        {/* Handle A */}
        <g
          transform={`translate(${tipA.x}, ${tipA.y})`}
          style={{ cursor: "grab" }}
          onPointerDown={(e) => startDrag("A", e)}
        >
          <circle r={22} fill="transparent" />
          <circle r={9} fill="#0d9488" opacity={0.2} />
          <circle r={6.5} fill="#ffffff" stroke="#0d9488" strokeWidth={3} />
          <text x={12} y={-4} fill="#0d9488" fontSize="12" fontWeight="700">A</text>
        </g>

        {/* Handle B */}
        <g
          transform={`translate(${tipB.x}, ${tipB.y})`}
          style={{ cursor: "grab" }}
          onPointerDown={(e) => startDrag("B", e)}
        >
          <circle r={22} fill="transparent" />
          <circle r={9} fill="#8b5cf6" opacity={0.2} />
          <circle r={6.5} fill="#ffffff" stroke="#8b5cf6" strokeWidth={3} />
          <text x={12} y={-4} fill="#8b5cf6" fontSize="12" fontWeight="700">B</text>
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
