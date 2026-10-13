"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function PythonListIndexingDemo({
  completed,
  onComplete,
  title = "Python List Memory & Indexing",
  caption = "Drag the pointer handle across memory cells to inspect positive indices, negative indices, and list element access.",
}: Props) {
  const elements = ["\"alpha\"", "\"beta\"", "\"gamma\"", "\"delta\"", "\"epsilon\""];
  const [index, setIndex] = useState<number>(2);

  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const negIndex = index - elements.length;
  const currentVal = elements[index];

  const metrics: DemoMetric[] = [
    { label: "Positive Index", value: `arr[${index}]`, color: "#0d9488" },
    { label: "Negative Index", value: `arr[${negIndex}]`, color: "#8b5cf6" },
    { label: "Extracted Value", value: currentVal, color: "#f59e0b" },
    { label: "List Length", value: elements.length, color: "#64748b" },
  ];

  const cellWidth = 68;
  const startX = 45;
  const cellY = 90;

  const handleX = startX + index * cellWidth + cellWidth / 2;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;

    const cellIdx = Math.floor((svgX - startX) / cellWidth);
    const clamped = Math.max(0, Math.min(elements.length - 1, cellIdx));
    setIndex(clamped);
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
    setIndex(2);
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
        viewBox="0 0 440 220"
        className="tactile-svg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <marker
            id="arrow-teal-idx"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0d9488" />
          </marker>
        </defs>

        {/* Array Cells */}
        {elements.map((el, i) => {
          const x = startX + i * cellWidth;
          const isSelected = i === index;
          return (
            <g key={i}>
              {/* Positive Index above */}
              <text
                x={x + cellWidth / 2}
                y={cellY - 26}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={isSelected ? "#0d9488" : "#94a3b8"}
              >
                +{i}
              </text>

              {/* Memory Cell Rect */}
              <rect
                x={x}
                y={cellY}
                width={cellWidth - 6}
                height={55}
                rx={10}
                fill={isSelected ? "#ccfbf1" : "#f8fafc"}
                stroke={isSelected ? "#0d9488" : "#cbd5e1"}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />

              {/* Element value text */}
              <text
                x={x + cellWidth / 2 - 3}
                y={cellY + 32}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={isSelected ? "#0f766e" : "#334155"}
              >
                {el}
              </text>

              {/* Negative Index below */}
              <text
                x={x + cellWidth / 2}
                y={cellY + 75}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill={isSelected ? "#8b5cf6" : "#94a3b8"}
              >
                {i - elements.length}
              </text>
            </g>
          );
        })}

        {/* Draggable Pointer Arrow below */}
        <g
          transform={`translate(${handleX}, ${cellY + 95})`}
          style={{ cursor: "grab" }}
          onPointerDown={handlePointerDown}
        >
          <line x1={0} y1={25} x2={0} y2={5} stroke="#0d9488" strokeWidth={3} markerEnd="url(#arrow-teal-idx)" />
          <circle r={22} fill="transparent" />
          <circle r={9} fill="#0d9488" opacity={0.2} />
          <circle r={6.5} fill="#ffffff" stroke="#0d9488" strokeWidth={2.5} />
          <text y={42} textAnchor="middle" fontSize="11" fill="#0d9488" fontWeight="800">
            DRAG INDEX
          </text>
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
