"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function DimensionalScalingDemo({
  completed,
  onComplete,
  title = "Square-Cube Law (Dimensional Scaling)",
  caption = "Drag the scaling slider to grow the cube. Notice how Volume (s³) explodes much faster than Surface Area (s²).",
}: Props) {
  // Linear scale factor s in [1, 4]
  const [s, setS] = useState<number>(2.0);
  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const surfaceArea = 6 * Math.pow(s, 2);
  const volume = Math.pow(s, 3);
  const ratio = surfaceArea / volume; // 6 / s

  const metrics: DemoMetric[] = [
    { label: "Linear Side (s)", value: `${s.toFixed(1)}x`, color: "#0d9488" },
    { label: "Surface Area (6s²)", value: `${surfaceArea.toFixed(1)}x`, color: "#f59e0b" },
    { label: "Volume / Mass (s³)", value: `${volume.toFixed(1)}x`, color: "#ef4444" },
    { label: "Area / Volume (6/s)", value: ratio.toFixed(2), color: "#6366f1" },
  ];

  // Isometric 3D projection of a cube with side length s * unitSize
  const ox = 220;
  const oy = 150;
  const unit = 24 * s;

  // Isometric basis vectors
  const isoX = { x: Math.cos(Math.PI / 6) * unit, y: Math.sin(Math.PI / 6) * unit };
  const isoY = { x: -Math.cos(Math.PI / 6) * unit, y: Math.sin(Math.PI / 6) * unit };
  const isoZ = { x: 0, y: -unit };

  // Slider coordinates
  const sliderStartX = 70;
  const sliderEndX = 370;
  const sliderY = 265;
  const handleX = sliderStartX + ((s - 1) / (4 - 1)) * (sliderEndX - sliderStartX);

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
    const nextS = 1 + t * (4 - 1);
    setS(Math.round(nextS * 10) / 10);
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
    setS(2.0);
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
        viewBox="0 0 440 290"
        className="tactile-svg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Isometric Cube Faces */}
        {/* Top Face */}
        <polygon
          points={`
            ${ox},${oy + isoZ.y}
            ${ox + isoX.x},${oy + isoX.y + isoZ.y}
            ${ox + isoX.x + isoY.x},${oy + isoX.y + isoY.y + isoZ.y}
            ${ox + isoY.x},${oy + isoY.y + isoZ.y}
          `}
          fill="#ccfbf1"
          stroke="#0d9488"
          strokeWidth={2}
        />

        {/* Left Face */}
        <polygon
          points={`
            ${ox},${oy}
            ${ox + isoY.x},${oy + isoY.y}
            ${ox + isoY.x},${oy + isoY.y + isoZ.y}
            ${ox},${oy + isoZ.y}
          `}
          fill="#99f6e4"
          stroke="#0d9488"
          strokeWidth={2}
        />

        {/* Right Face */}
        <polygon
          points={`
            ${ox},${oy}
            ${ox + isoX.x},${oy + isoX.y}
            ${ox + isoX.x},${oy + isoX.y + isoZ.y}
            ${ox},${oy + isoZ.y}
          `}
          fill="#5eead4"
          stroke="#0d9488"
          strokeWidth={2}
        />

        {/* Side dimension indicator */}
        <text
          x={ox + isoX.x / 2 + 15}
          y={oy + isoX.y / 2 + 10}
          fontSize="11"
          fontWeight="700"
          fill="#0f766e"
        >
          s = {s.toFixed(1)}
        </text>

        {/* Draggable Slider */}
        <g>
          <line x1={sliderStartX} y1={sliderY} x2={sliderEndX} y2={sliderY} stroke="#e2e8f0" strokeWidth={5} strokeLinecap="round" />
          <line x1={sliderStartX} y1={sliderY} x2={handleX} y2={sliderY} stroke="#0d9488" strokeWidth={5} strokeLinecap="round" />
          <text x={sliderStartX} y={sliderY - 10} fontSize="10" fill="#64748b">1x (Unit Cube)</text>
          <text x={sliderEndX} y={sliderY - 10} fontSize="10" fill="#64748b" textAnchor="end">4x (64x Volume!)</text>

          <g transform={`translate(${handleX}, ${sliderY})`} style={{ cursor: "grab" }} onPointerDown={handlePointerDown}>
            <circle r={22} fill="transparent" />
            <circle r={9} fill="#0d9488" opacity={0.2} />
            <circle r={7} fill="#ffffff" stroke="#0d9488" strokeWidth={3} />
          </g>
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
