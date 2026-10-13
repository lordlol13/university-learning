"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function WaterEquivalencyDemo({
  completed,
  onComplete,
  title = "Water Equivalency & Volume Displacement",
  caption = "Drag the solid block downward into the graduated cylinder to submerge it and observe the 1 mL = 1 cm³ = 1 g water displacement equivalence.",
}: Props) {
  // Submersion percentage t in [0, 1]
  const [submergeFraction, setSubmergeFraction] = useState<number>(0.5);
  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Object volume = 50 mL = 50 cm3
  const objectVol = 50;
  const displacedVol = submergeFraction * objectVol;
  const displacedMass = displacedVol * 1.0; // 1 g per mL

  const initialWaterLvl = 100; // mL
  const currentWaterLvl = initialWaterLvl + displacedVol;

  const metrics: DemoMetric[] = [
    { label: "Submerged Volume", value: `${displacedVol.toFixed(1)} cm³`, color: "#0d9488" },
    { label: "Displaced Fluid", value: `${displacedVol.toFixed(1)} mL`, color: "#3b82f6" },
    { label: "Water Mass Eq.", value: `${displacedMass.toFixed(1)} g`, color: "#f59e0b" },
    { label: "Total Reading", value: `${currentWaterLvl.toFixed(1)} mL`, color: "#1e293b" },
  ];

  // Cylinder SVG geometry
  const cylX = 170;
  const cylY = 40;
  const cylW = 100;
  const cylH = 180;

  // Base water height: 70px from bottom (220 to 150)
  // Each 10 mL is 7px
  const waterPxH = 70 + (displacedVol / 50) * 35;
  const waterTopY = cylY + cylH - waterPxH;

  // Object position: starts at y = 50 (above water) to y = 140 (deep in water)
  const objMinY = 55;
  const objMaxY = 145;
  const objY = objMinY + submergeFraction * (objMaxY - objMinY);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgY = ((e.clientY - rect.top) / rect.height) * 260;
    const t = Math.max(0, Math.min(1, (svgY - objMinY) / (objMaxY - objMinY)));
    setSubmergeFraction(Math.round(t * 100) / 100);
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
    setSubmergeFraction(0.5);
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
        viewBox="0 0 440 260"
        className="tactile-svg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Graduated Cylinder Outline */}
        <rect
          x={cylX}
          y={cylY}
          width={cylW}
          height={cylH}
          rx={6}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={2.5}
        />
        {/* Base of cylinder */}
        <rect
          x={cylX - 15}
          y={cylY + cylH}
          width={cylW + 30}
          height={10}
          rx={3}
          fill="#cbd5e1"
        />

        {/* Water in cylinder */}
        <rect
          x={cylX + 2}
          y={waterTopY}
          width={cylW - 4}
          height={cylY + cylH - waterTopY}
          fill="rgba(59, 130, 246, 0.35)"
          stroke="#3b82f6"
          strokeWidth={1}
        />

        {/* Cylinder Tick Marks */}
        {[0, 1, 2, 3, 4, 5, 6].map((tick) => {
          const y = cylY + cylH - 20 - tick * 22;
          return (
            <g key={tick}>
              <line x1={cylX} y1={y} x2={cylX + 14} y2={y} stroke="#64748b" strokeWidth={1.5} />
              <text x={cylX + 18} y={y + 3} fontSize="9" fill="#64748b" fontWeight="600">
                {70 + tick * 20} mL
              </text>
            </g>
          );
        })}

        {/* Cord holding the block */}
        <line
          x1={cylX + cylW / 2}
          y1={20}
          x2={cylX + cylW / 2}
          y2={objY}
          stroke="#64748b"
          strokeWidth={1.5}
          strokeDasharray="2,2"
        />

        {/* Draggable Solid Block */}
        <g
          transform={`translate(${cylX + 25}, ${objY})`}
          style={{ cursor: "grab" }}
          onPointerDown={handlePointerDown}
        >
          <rect
            x={0}
            y={0}
            width={50}
            height={50}
            rx={4}
            fill="#0d9488"
            stroke="#0f766e"
            strokeWidth={2}
          />
          <text
            x={25}
            y={28}
            fontSize="10"
            fontWeight="800"
            fill="#ffffff"
            textAnchor="middle"
          >
            50 cm³
          </text>
          <circle cx={25} cy={-8} r={6} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
        </g>

        {/* Displacement label */}
        <text
          x={cylX + cylW + 20}
          y={waterTopY + 4}
          fontSize="11"
          fontWeight="700"
          fill="#3b82f6"
        >
          ← {currentWaterLvl.toFixed(0)} mL
        </text>
      </svg>
    </InteractiveDemoContainer>
  );
}
