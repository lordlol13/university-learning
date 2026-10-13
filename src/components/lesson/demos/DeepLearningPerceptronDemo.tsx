"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function DeepLearningPerceptronDemo({
  completed,
  onComplete,
  title = "Perceptron Linear Decision Boundary",
  caption = "Drag the decision boundary line handle to adjust weights and bias until all blue and amber points are correctly separated.",
}: Props) {
  // Decision line angle theta in [-60, 60] degrees and bias offset b in [-50, 50] px
  const [angleDeg, setAngleDeg] = useState<number>(25);
  const [biasOffset, setBiasOffset] = useState<number>(0);

  const isDraggingHandleRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Fixed sample points: Class 0 (Blue) vs Class 1 (Amber)
  // Center is (220, 150)
  const class0 = [
    { x: -70, y: -40 },
    { x: -50, y: -70 },
    { x: -90, y: -20 },
    { x: -40, y: -30 },
  ];
  const class1 = [
    { x: 60, y: 50 },
    { x: 80, y: 30 },
    { x: 50, y: 70 },
    { x: 90, y: 60 },
  ];

  // Normal vector to the line
  const rad = (angleDeg * Math.PI) / 180;
  const nx = -Math.sin(rad);
  const ny = Math.cos(rad);

  // Evaluate classification accuracy
  let correctCount = 0;
  const total = class0.length + class1.length;

  class0.forEach((pt) => {
    const d = pt.x * nx + pt.y * ny - biasOffset;
    if (d < 0) correctCount++;
  });
  class1.forEach((pt) => {
    const d = pt.x * nx + pt.y * ny - biasOffset;
    if (d >= 0) correctCount++;
  });

  const accuracy = Math.round((correctCount / total) * 100);

  const metrics: DemoMetric[] = [
    { label: "Weights Angle", value: `${angleDeg.toFixed(0)}°`, color: "#6366f1" },
    { label: "Bias Offset (b)", value: biasOffset.toFixed(0), color: "#0d9488" },
    { label: "Classification Accuracy", value: `${accuracy}%`, color: accuracy === 100 ? "#10b981" : accuracy >= 75 ? "#f59e0b" : "#ef4444" },
    { label: "Status", value: accuracy === 100 ? "Linearly Separated! ✓" : "Misclassified points", color: "#1e293b" },
  ];

  const ox = 220;
  const oy = 150;

  // Decision boundary line points spanning canvas
  const lineLen = 190;
  const lx = Math.cos(rad);
  const ly = Math.sin(rad);

  const centerPt = {
    x: ox + nx * biasOffset,
    y: oy + ny * biasOffset,
  };

  const pStart = {
    x: centerPt.x - lx * lineLen,
    y: centerPt.y - ly * lineLen,
  };
  const pEnd = {
    x: centerPt.x + lx * lineLen,
    y: centerPt.y + ly * lineLen,
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingHandleRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingHandleRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;
    const svgY = ((e.clientY - rect.top) / rect.height) * 300;

    // Angle from center
    const dx = svgX - ox;
    const dy = svgY - oy;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg > 90) deg -= 180;
    if (deg < -90) deg += 180;

    setAngleDeg(Math.round(deg));
    // Bias based on perpendicular distance
    const dist = dx * nx + dy * ny;
    setBiasOffset(Math.max(-60, Math.min(60, Math.round(dist * 0.4))));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingHandleRef.current = false;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const reset = useCallback(() => {
    setAngleDeg(25);
    setBiasOffset(0);
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
        {/* Soft Region Halves */}
        <clipPath id="boundary-clip">
          <rect x={0} y={0} width={440} height={300} />
        </clipPath>

        {/* Center Grid Reference */}
        <circle cx={ox} cy={oy} r={3} fill="#cbd5e1" />
        <line x1={ox - 140} y1={oy} x2={ox + 140} y2={oy} stroke="#f1f5f9" strokeWidth={1} />
        <line x1={ox} y1={oy - 110} x2={ox} y2={oy + 110} stroke="#f1f5f9" strokeWidth={1} />

        {/* Decision Line w·x + b = 0 */}
        <line
          x1={pStart.x}
          y1={pStart.y}
          x2={pEnd.x}
          y2={pEnd.y}
          stroke="#0d9488"
          strokeWidth={3}
        />

        {/* Class 0 Points (Blue) */}
        {class0.map((pt, i) => (
          <circle
            key={`c0-${i}`}
            cx={ox + pt.x}
            cy={oy + pt.y}
            r={7}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}

        {/* Class 1 Points (Amber) */}
        {class1.map((pt, i) => (
          <circle
            key={`c1-${i}`}
            cx={ox + pt.x}
            cy={oy + pt.y}
            r={7}
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}

        {/* Draggable Decision Handle on line */}
        <g
          transform={`translate(${pEnd.x}, ${pEnd.y})`}
          style={{ cursor: "grab" }}
          onPointerDown={handlePointerDown}
        >
          <circle r={22} fill="transparent" />
          <circle r={10} fill="#0d9488" opacity={0.2} />
          <circle r={7} fill="#ffffff" stroke="#0d9488" strokeWidth={3} />
          <text x={12} y={4} fill="#0d9488" fontSize="11" fontWeight="700">Rotate / Drag</text>
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
