"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function StatisticsOutlierDemo({
  completed,
  onComplete,
  title = "Mean vs. Median (Outlier Sensitivity)",
  caption = "Drag the red outlier point to the far right. Watch how the Mean is pulled strongly while the Median remains anchored.",
}: Props) {
  // 4 fixed points + 1 draggable point (outlier)
  const fixedPoints = [15, 20, 25, 30];
  const [outlier, setOutlier] = useState<number>(35);

  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const allPoints = [...fixedPoints, outlier].sort((a, b) => a - b);
  const sum = allPoints.reduce((acc, v) => acc + v, 0);
  const mean = sum / allPoints.length;

  // Median (middle of 5 items is index 2)
  const median = allPoints[2];

  // Standard deviation
  const variance = allPoints.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / allPoints.length;
  const stdDev = Math.sqrt(variance);

  const metrics: DemoMetric[] = [
    { label: "Outlier Value", value: outlier.toFixed(0), color: "#ef4444" },
    { label: "Mean (Sensitive)", value: mean.toFixed(1), color: "#3b82f6" },
    { label: "Median (Robust)", value: median.toFixed(1), color: "#f59e0b" },
    { label: "Std Deviation (σ)", value: stdDev.toFixed(1), color: "#8b5cf6" },
  ];

  // Canvas bounds: values in [0, 100] map to SVG x in [40, 400]
  const minVal = 0;
  const maxVal = 100;
  const toPxX = (v: number) => 40 + ((v - minVal) / (maxVal - minVal)) * 360;
  const toVal = (px: number) => minVal + ((px - 40) / 360) * (maxVal - minVal);

  const axisY = 160;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;
    let v = toVal(svgX);
    v = Math.max(10, Math.min(95, v));
    setOutlier(Math.round(v));
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
    setOutlier(35);
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
        viewBox="0 0 440 250"
        className="tactile-svg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Number line */}
        <line x1={30} y1={axisY} x2={410} y2={axisY} stroke="#cbd5e1" strokeWidth={2} />

        {/* Axis tick marks */}
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t} transform={`translate(${toPxX(t)}, ${axisY})`}>
            <line y1={-6} y2={6} stroke="#94a3b8" strokeWidth={1.5} />
            <text y={22} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
              {t}
            </text>
          </g>
        ))}

        {/* Fixed data points */}
        {fixedPoints.map((pt, i) => (
          <g key={i} transform={`translate(${toPxX(pt)}, ${axisY})`}>
            <circle r={8} fill="#0d9488" stroke="#ffffff" strokeWidth={2} />
            <text y={-14} textAnchor="middle" fontSize="11" fill="#0d9488" fontWeight="700">
              {pt}
            </text>
          </g>
        ))}

        {/* Mean Indicator marker (Blue Diamond) */}
        <g transform={`translate(${toPxX(mean)}, ${axisY})`}>
          <line y1={-60} y2={35} stroke="#3b82f6" strokeWidth={2} strokeDasharray="3,3" />
          <polygon points="0,-48 7,-40 0,-32 -7,-40" fill="#3b82f6" />
          <text y={-54} textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="800">
            Mean = {mean.toFixed(1)}
          </text>
        </g>

        {/* Median Indicator marker (Amber Triangle) */}
        <g transform={`translate(${toPxX(median)}, ${axisY})`}>
          <line y1={-85} y2={35} stroke="#f59e0b" strokeWidth={2} strokeDasharray="3,3" />
          <polygon points="0,-70 7,-82 -7,-82" fill="#f59e0b" />
          <text y={-88} textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="800">
            Median = {median.toFixed(0)}
          </text>
        </g>

        {/* Draggable Outlier Point */}
        <g
          transform={`translate(${toPxX(outlier)}, ${axisY})`}
          style={{ cursor: "grab" }}
          onPointerDown={handlePointerDown}
        >
          <circle r={24} fill="transparent" />
          <circle r={12} fill="#ef4444" opacity={0.2} />
          <circle r={9} fill="#ef4444" stroke="#ffffff" strokeWidth={2.5} />
          <text y={-16} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="800">
            Outlier ({outlier})
          </text>
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
