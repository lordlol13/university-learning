"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function ForceEquilibriumDemo({
  completed,
  onComplete,
  title = "Force Equilibrium & Newton's First Law",
  caption = "Drag balancing force F₃ until the net resultant force ΣF drops to 0, achieving static equilibrium.",
}: Props) {
  // Fixed applied force 1: F1 = (4, 3) N
  const f1 = { x: 4.0, y: 3.0 };
  // Fixed applied force 2: F2 = (-2, 2) N
  const f2 = { x: -2.0, y: 2.0 };
  // Draggable balancing force F3 in [-8, 8] N
  const [f3, setF3] = useState<{ x: number; y: number }>({ x: -1.0, y: -2.0 });

  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Net force: F_net = F1 + F2 + F3
  const netX = f1.x + f2.x + f3.x;
  const netY = f1.y + f2.y + f3.y;
  const netMag = Math.hypot(netX, netY);

  const isBalanced = netMag < 0.4;

  const metrics: DemoMetric[] = [
    { label: "F₁ (Fixed)", value: `[${f1.x}, ${f1.y}] N`, color: "#3b82f6" },
    { label: "F₂ (Fixed)", value: `[${f2.x}, ${f2.y}] N`, color: "#8b5cf6" },
    { label: "F₃ (Balancing)", value: `[${f3.x.toFixed(1)}, ${f3.y.toFixed(1)}] N`, color: "#0d9488" },
    { label: "Net Force |ΣF|", value: `${netMag.toFixed(2)} N`, color: isBalanced ? "#10b981" : "#ef4444" },
    { label: "State", value: isBalanced ? "Static Equilibrium! (a = 0)" : "Accelerating", color: isBalanced ? "#10b981" : "#1e293b" },
  ];

  // SVG coordinate transformation
  const ox = 220;
  const oy = 150;
  const scale = 20;

  const toPx = (x: number, y: number) => ({
    px: ox + x * scale,
    py: oy - y * scale,
  });

  const tip1 = toPx(f1.x, f1.y);
  const tip2 = toPx(f2.x, f2.y);
  const tip3 = toPx(f3.x, f3.y);
  const tipNet = toPx(netX, netY);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;
    const svgY = ((e.clientY - rect.top) / rect.height) * 300;

    let mx = (svgX - ox) / scale;
    let my = (oy - svgY) / scale;
    mx = Math.max(-8, Math.min(8, mx));
    my = Math.max(-7, Math.min(7, my));

    setF3({ x: Math.round(mx * 10) / 10, y: Math.round(my * 10) / 10 });
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
    setF3({ x: -1.0, y: -2.0 });
  }, [setF3]);

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
        <defs>
          <marker
            id="arrow-f1"
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
            id="arrow-f2"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
          </marker>
          <marker
            id="arrow-f3"
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
            id="arrow-fnet"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
          </marker>
        </defs>

        {/* Axes */}
        <line x1={30} y1={oy} x2={410} y2={oy} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={ox} y1={280} x2={ox} y2={20} stroke="#cbd5e1" strokeWidth={1} />

        {/* Central Mass Ring */}
        <circle cx={ox} cy={oy} r={14} fill={isBalanced ? "#10b981" : "#e2e8f0"} stroke={isBalanced ? "#059669" : "#94a3b8"} strokeWidth={3} />
        <text x={ox} y={oy + 4} fontSize="9" fontWeight="800" fill={isBalanced ? "#ffffff" : "#475569"} textAnchor="middle">
          MASS
        </text>

        {/* Force 1 */}
        <line x1={ox} y1={oy} x2={tip1.px} y2={tip1.py} stroke="#3b82f6" strokeWidth={3} markerEnd="url(#arrow-f1)" />
        <text x={tip1.px + 8} y={tip1.py - 6} fill="#3b82f6" fontSize="11" fontWeight="700">F₁</text>

        {/* Force 2 */}
        <line x1={ox} y1={oy} x2={tip2.px} y2={tip2.py} stroke="#8b5cf6" strokeWidth={3} markerEnd="url(#arrow-f2)" />
        <text x={tip2.px - 16} y={tip2.py - 6} fill="#8b5cf6" fontSize="11" fontWeight="700">F₂</text>

        {/* Force 3 (Draggable) */}
        <line x1={ox} y1={oy} x2={tip3.px} y2={tip3.py} stroke="#0d9488" strokeWidth={3.5} markerEnd="url(#arrow-f3)" />
        <text x={tip3.px + 10} y={tip3.py + 10} fill="#0d9488" fontSize="11" fontWeight="800">F₃</text>

        {/* Net Force Arrow (if not balanced) */}
        {!isBalanced && (
          <line
            x1={ox}
            y1={oy}
            x2={tipNet.px}
            y2={tipNet.py}
            stroke="#ef4444"
            strokeWidth={3}
            strokeDasharray="4,3"
            markerEnd="url(#arrow-fnet)"
          />
        )}

        {/* Draggable Handle on F3 */}
        <g
          transform={`translate(${tip3.px}, ${tip3.py})`}
          style={{ cursor: "grab" }}
          onPointerDown={handlePointerDown}
        >
          <circle r={22} fill="transparent" />
          <circle r={9} fill="#0d9488" opacity={0.2} />
          <circle r={6.5} fill="#ffffff" stroke="#0d9488" strokeWidth={3} />
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
