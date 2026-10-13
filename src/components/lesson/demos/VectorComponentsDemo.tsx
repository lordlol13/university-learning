"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function VectorComponentsDemo({
  completed,
  onComplete,
  title = "Vector Decomposition",
  caption = "Drag the arrow tip to see horizontal (Vx) and vertical (Vy) components adjust in real time.",
}: Props) {
  // Vector endpoint in Cartesian math units: x in [-10, 10], y in [-10, 10]
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 6, y: 4.5 });
  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Math conversions
  const mag = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
  let rad = Math.atan2(pos.y, pos.x);
  if (rad < 0) rad += 2 * Math.PI;
  const deg = (rad * 180) / Math.PI;

  const metrics: DemoMetric[] = [
    { label: "Magnitude |V|", value: mag.toFixed(2), color: "#0d9488" },
    { label: "Angle θ", value: `${deg.toFixed(1)}°`, color: "#f59e0b" },
    { label: "Vx = |V|·cos(θ)", value: pos.x.toFixed(2), color: "#3b82f6" },
    { label: "Vy = |V|·sin(θ)", value: pos.y.toFixed(2), color: "#8b5cf6" },
  ];

  // SVG coordinates: origin at (200, 160), scale 14px per unit
  const ox = 200;
  const oy = 160;
  const scale = 16;

  const tipPx = {
    x: ox + pos.x * scale,
    y: oy - pos.y * scale,
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 400;
    const svgY = ((e.clientY - rect.top) / rect.height) * 320;

    // Convert back to math units, clamp to [-9, 9]
    let mx = (svgX - ox) / scale;
    let my = (oy - svgY) / scale;
    mx = Math.max(-9, Math.min(9, mx));
    my = Math.max(-9, Math.min(9, my));

    setPos({ x: Math.round(mx * 10) / 10, y: Math.round(my * 10) / 10 });
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
    setPos({ x: 6, y: 4.5 });
  }, []);

  // Arc path for angle
  const arcRadius = 32;
  const arcEndRad = Math.atan2(pos.y, pos.x);
  const arcEndPx = {
    x: ox + arcRadius * Math.cos(arcEndRad),
    y: oy - arcRadius * Math.sin(arcEndRad),
  };
  const largeArcFlag = arcEndRad > Math.PI ? 1 : 0;
  const arcPath =
    pos.y >= 0
      ? `M ${ox + arcRadius} ${oy} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 0 ${arcEndPx.x} ${arcEndPx.y}`
      : `M ${ox + arcRadius} ${oy} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEndPx.x} ${arcEndPx.y}`;

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
        viewBox="0 0 400 320"
        className="tactile-svg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <marker
            id="arrow-teal"
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
            id="arrow-blue"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
          </marker>
          <marker
            id="arrow-purple"
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

        {/* Subtle Grid */}
        {[-8, -6, -4, -2, 2, 4, 6, 8].map((g) => (
          <g key={g} opacity={0.12} stroke="#94a3b8" strokeDasharray="2,2">
            <line x1={ox + g * scale} y1={20} x2={ox + g * scale} y2={300} />
            <line x1={20} y1={oy - g * scale} x2={380} y2={oy - g * scale} />
          </g>
        ))}

        {/* Axes */}
        <line x1={20} y1={oy} x2={380} y2={oy} stroke="#cbd5e1" strokeWidth={1.5} />
        <line x1={ox} y1={300} x2={ox} y2={20} stroke="#cbd5e1" strokeWidth={1.5} />
        <text x={385} y={oy + 4} fill="#64748b" fontSize="11" fontWeight="600">x</text>
        <text x={ox - 4} y={15} fill="#64748b" fontSize="11" fontWeight="600">y</text>

        {/* Drop lines */}
        <line
          x1={tipPx.x}
          y1={tipPx.y}
          x2={tipPx.x}
          y2={oy}
          stroke="#8b5cf6"
          strokeWidth={1.5}
          strokeDasharray="4,3"
          opacity={0.7}
        />
        <line
          x1={tipPx.x}
          y1={tipPx.y}
          x2={ox}
          y2={tipPx.y}
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="4,3"
          opacity={0.7}
        />

        {/* Horizontal Component Arrow (Vx) */}
        {Math.abs(pos.x) > 0.3 && (
          <line
            x1={ox}
            y1={oy}
            x2={tipPx.x}
            y2={oy}
            stroke="#3b82f6"
            strokeWidth={3}
            markerEnd="url(#arrow-blue)"
          />
        )}

        {/* Vertical Component Arrow (Vy) */}
        {Math.abs(pos.y) > 0.3 && (
          <line
            x1={tipPx.x}
            y1={oy}
            x2={tipPx.x}
            y2={tipPx.y}
            stroke="#8b5cf6"
            strokeWidth={3}
            markerEnd="url(#arrow-purple)"
          />
        )}

        {/* Angle Arc */}
        {mag > 1 && (
          <path
            d={arcPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
          />
        )}

        {/* Main Vector V Arrow */}
        <line
          x1={ox}
          y1={oy}
          x2={tipPx.x}
          y2={tipPx.y}
          stroke="#0d9488"
          strokeWidth={3.5}
          markerEnd="url(#arrow-teal)"
        />

        {/* Draggable Tip Handle */}
        <g
          transform={`translate(${tipPx.x}, ${tipPx.y})`}
          style={{ cursor: "grab" }}
          onPointerDown={handlePointerDown}
        >
          <circle r={22} fill="transparent" />
          <circle r={10} fill="#0d9488" opacity={0.2} className="pulse-ring" />
          <circle r={7} fill="#ffffff" stroke="#0d9488" strokeWidth={3} />
          <circle r={2.5} fill="#0d9488" />
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
