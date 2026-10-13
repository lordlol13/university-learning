"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

interface PhysicalQuantity {
  name: string;
  symbol: string;
  formula: string;
  siUnit: string;
  dimension: string;
  mass: number;
  length: number;
  time: number;
}

export function SIBaseUnitsDemo({
  completed,
  onComplete,
  title = "Dimensional Analysis & SI Base Units",
  caption = "Drag the slider to decompose physical quantities into their fundamental Mass [M], Length [L], and Time [T] dimensions.",
}: Props) {
  const quantities: PhysicalQuantity[] = [
    { name: "Velocity", symbol: "v", formula: "d / t", siUnit: "m/s", dimension: "[L][T]⁻¹", mass: 0, length: 1, time: -1 },
    { name: "Acceleration", symbol: "a", formula: "v / t", siUnit: "m/s²", dimension: "[L][T]⁻²", mass: 0, length: 1, time: -2 },
    { name: "Force", symbol: "F", formula: "m · a", siUnit: "kg·m/s² (N)", dimension: "[M][L][T]⁻²", mass: 1, length: 1, time: -2 },
    { name: "Work / Energy", symbol: "W", formula: "F · d", siUnit: "kg·m²/s² (J)", dimension: "[M][L]²[T]⁻²", mass: 1, length: 2, time: -2 },
    { name: "Power", symbol: "P", formula: "W / t", siUnit: "J/s (W)", dimension: "[M][L]²[T]⁻³", mass: 1, length: 2, time: -3 },
  ];

  const [idx, setIdx] = useState<number>(2); // Start at Force (F)
  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const cur = quantities[idx];

  const metrics: DemoMetric[] = [
    { label: "Quantity", value: `${cur.name} (${cur.symbol})`, color: "#0d9488" },
    { label: "Formula", value: cur.formula, color: "#6366f1" },
    { label: "SI Base Units", value: cur.siUnit, color: "#f59e0b" },
    { label: "Dimension [M,L,T]", value: cur.dimension, color: "#1e293b" },
  ];

  const sliderStartX = 50;
  const sliderEndX = 390;
  const sliderY = 220;
  const handleX = sliderStartX + (idx / (quantities.length - 1)) * (sliderEndX - sliderStartX);

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
    const nextIdx = Math.round(t * (quantities.length - 1));
    setIdx(nextIdx);
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
    setIdx(2);
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
        {/* Dimension Blocks Display */}
        <g transform="translate(40, 40)">
          {/* Mass block */}
          <g transform="translate(0, 0)">
            <rect
              x={0}
              y={0}
              width={105}
              height={100}
              rx={12}
              fill={cur.mass !== 0 ? "#ccfbf1" : "#f8fafc"}
              stroke={cur.mass !== 0 ? "#0d9488" : "#cbd5e1"}
              strokeWidth={cur.mass !== 0 ? 2 : 1}
            />
            <text x={52} y={35} fontSize="13" fontWeight="800" fill="#0f766e" textAnchor="middle">
              MASS [M]
            </text>
            <text x={52} y={65} fontSize="22" fontWeight="800" fill={cur.mass !== 0 ? "#0d9488" : "#94a3b8"} textAnchor="middle">
              {cur.mass > 0 ? `+${cur.mass}` : cur.mass}
            </text>
            <text x={52} y={85} fontSize="11" fill="#64748b" textAnchor="middle">kg</text>
          </g>

          {/* Length block */}
          <g transform="translate(125, 0)">
            <rect
              x={0}
              y={0}
              width={105}
              height={100}
              rx={12}
              fill={cur.length !== 0 ? "#ede9fe" : "#f8fafc"}
              stroke={cur.length !== 0 ? "#8b5cf6" : "#cbd5e1"}
              strokeWidth={cur.length !== 0 ? 2 : 1}
            />
            <text x={52} y={35} fontSize="13" fontWeight="800" fill="#6d28d9" textAnchor="middle">
              LENGTH [L]
            </text>
            <text x={52} y={65} fontSize="22" fontWeight="800" fill={cur.length !== 0 ? "#8b5cf6" : "#94a3b8"} textAnchor="middle">
              {cur.length > 0 ? `+${cur.length}` : cur.length}
            </text>
            <text x={52} y={85} fontSize="11" fill="#64748b" textAnchor="middle">m</text>
          </g>

          {/* Time block */}
          <g transform="translate(250, 0)">
            <rect
              x={0}
              y={0}
              width={105}
              height={100}
              rx={12}
              fill={cur.time !== 0 ? "#fef3c7" : "#f8fafc"}
              stroke={cur.time !== 0 ? "#f59e0b" : "#cbd5e1"}
              strokeWidth={cur.time !== 0 ? 2 : 1}
            />
            <text x={52} y={35} fontSize="13" fontWeight="800" fill="#b45309" textAnchor="middle">
              TIME [T]
            </text>
            <text x={52} y={65} fontSize="22" fontWeight="800" fill={cur.time !== 0 ? "#f59e0b" : "#94a3b8"} textAnchor="middle">
              {cur.time}
            </text>
            <text x={52} y={85} fontSize="11" fill="#64748b" textAnchor="middle">s</text>
          </g>
        </g>

        {/* Draggable Slider */}
        <g>
          <line x1={sliderStartX} y1={sliderY} x2={sliderEndX} y2={sliderY} stroke="#e2e8f0" strokeWidth={5} strokeLinecap="round" />
          <line x1={sliderStartX} y1={sliderY} x2={handleX} y2={sliderY} stroke="#0d9488" strokeWidth={5} strokeLinecap="round" />

          {quantities.map((q, qIdx) => {
            const x = sliderStartX + (qIdx / (quantities.length - 1)) * (sliderEndX - sliderStartX);
            return (
              <text key={q.name} x={x} y={sliderY - 10} fontSize="10" fontWeight="700" textAnchor="middle" fill={idx === qIdx ? "#0d9488" : "#94a3b8"}>
                {q.symbol}
              </text>
            );
          })}

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
