"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function LinearAlgebraTransformDemo({
  completed,
  onComplete,
  title = "2D Linear Transformation & Determinant",
  caption = "Drag basis vectors î and ĵ to see the entire grid transform and observe how det(M) scales the area of the unit square.",
}: Props) {
  // Basis vector i-hat (where (1, 0) goes): [a, c]
  const [iHat, setIHat] = useState<{ x: number; y: number }>({ x: 2, y: 0.5 });
  // Basis vector j-hat (where (0, 1) goes): [b, d]
  const [jHat, setJHat] = useState<{ x: number; y: number }>({ x: 0.5, y: 2 });

  const draggingTargetRef = useRef<"i" | "j" | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Determinant: ad - bc
  const det = iHat.x * jHat.y - iHat.y * jHat.x;

  let detStatus = "Area scaled by " + Math.abs(det).toFixed(2);
  if (Math.abs(det) < 0.1) detStatus = "Space collapsed to a line (det ≈ 0)";
  else if (det < 0) detStatus = "Orientation reversed (flipped)";

  const metrics: DemoMetric[] = [
    { label: "î = [a, c]ᵀ", value: `[${iHat.x.toFixed(1)}, ${iHat.y.toFixed(1)}]`, color: "#0d9488" },
    { label: "Matrix M", value: `[[${iHat.x.toFixed(1)}, ${jHat.x.toFixed(1)}], [${iHat.y.toFixed(1)}, ${jHat.y.toFixed(1)}]]`, color: "#1e293b" },
    { label: "ĵ = [b, d]ᵀ", value: `[${jHat.x.toFixed(1)}, ${jHat.y.toFixed(1)}]`, color: "#8b5cf6" },
    { label: "det(M) [Area scale]", value: det.toFixed(2), color: Math.abs(det) < 0.1 ? "#ef4444" : "#f59e0b" },
    { label: "Space state", value: detStatus, color: "#64748b" },
  ];

  const ox = 210;
  const oy = 160;
  const scale = 36;

  const toPx = (x: number, y: number) => ({
    px: ox + x * scale,
    py: oy - y * scale,
  });

  // Transformed point for grid lines: T(u, v) = u*iHat + v*jHat
  const transformPt = (u: number, v: number) => ({
    x: u * iHat.x + v * jHat.x,
    y: u * iHat.y + v * jHat.y,
  });

  const tipI = toPx(iHat.x, iHat.y);
  const tipJ = toPx(jHat.x, jHat.y);
  const cornerIJ = toPx(iHat.x + jHat.x, iHat.y + jHat.y);

  const startDrag = (target: "i" | "j", e: React.PointerEvent) => {
    draggingTargetRef.current = target;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTargetRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 420;
    const svgY = ((e.clientY - rect.top) / rect.height) * 320;

    let mx = (svgX - ox) / scale;
    let my = (oy - svgY) / scale;
    mx = Math.max(-3.5, Math.min(3.5, mx));
    my = Math.max(-3.5, Math.min(3.5, my));

    const rounded = { x: Math.round(mx * 10) / 10, y: Math.round(my * 10) / 10 };
    if (draggingTargetRef.current === "i") setIHat(rounded);
    else setJHat(rounded);
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
    setIHat({ x: 2, y: 0.5 });
    setJHat({ x: 0.5, y: 2 });
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
        viewBox="0 0 420 320"
        className="tactile-svg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          <marker
            id="arrow-teal-trans"
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
            id="arrow-purple-trans"
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

        {/* Transformed Grid Lines */}
        {[-3, -2, -1, 0, 1, 2, 3].map((u) => {
          const ptStart = transformPt(u, -3);
          const ptEnd = transformPt(u, 3);
          const start = toPx(ptStart.x, ptStart.y);
          const end = toPx(ptEnd.x, ptEnd.y);
          return (
            <line
              key={`u-${u}`}
              x1={start.px}
              y1={start.py}
              x2={end.px}
              y2={end.py}
              stroke="#0d9488"
              strokeWidth={u === 0 ? 1.5 : 0.7}
              opacity={u === 0 ? 0.4 : 0.15}
            />
          );
        })}

        {[-3, -2, -1, 0, 1, 2, 3].map((v) => {
          const ptStart = transformPt(-3, v);
          const ptEnd = transformPt(3, v);
          const start = toPx(ptStart.x, ptStart.y);
          const end = toPx(ptEnd.x, ptEnd.y);
          return (
            <line
              key={`v-${v}`}
              x1={start.px}
              y1={start.py}
              x2={end.px}
              y2={end.py}
              stroke="#8b5cf6"
              strokeWidth={v === 0 ? 1.5 : 0.7}
              opacity={v === 0 ? 0.4 : 0.15}
            />
          );
        })}

        {/* Unit square mapped area polygon */}
        <polygon
          points={`${ox},${oy} ${tipI.px},${tipI.py} ${cornerIJ.px},${cornerIJ.py} ${tipJ.px},${tipJ.py}`}
          fill={det >= 0 ? "rgba(245, 158, 11, 0.22)" : "rgba(239, 68, 68, 0.22)"}
          stroke={det >= 0 ? "#f59e0b" : "#ef4444"}
          strokeWidth={1.5}
          strokeDasharray="3,3"
        />

        {/* Basis Vector î */}
        <line
          x1={ox}
          y1={oy}
          x2={tipI.px}
          y2={tipI.py}
          stroke="#0d9488"
          strokeWidth={3.5}
          markerEnd="url(#arrow-teal-trans)"
        />

        {/* Basis Vector ĵ */}
        <line
          x1={ox}
          y1={oy}
          x2={tipJ.px}
          y2={tipJ.py}
          stroke="#8b5cf6"
          strokeWidth={3.5}
          markerEnd="url(#arrow-purple-trans)"
        />

        {/* Handle î */}
        <g
          transform={`translate(${tipI.px}, ${tipI.py})`}
          style={{ cursor: "grab" }}
          onPointerDown={(e) => startDrag("i", e)}
        >
          <circle r={22} fill="transparent" />
          <circle r={9} fill="#0d9488" opacity={0.2} />
          <circle r={6.5} fill="#ffffff" stroke="#0d9488" strokeWidth={3} />
          <text x={12} y={-4} fill="#0d9488" fontSize="12" fontWeight="800">î</text>
        </g>

        {/* Handle ĵ */}
        <g
          transform={`translate(${tipJ.px}, ${tipJ.py})`}
          style={{ cursor: "grab" }}
          onPointerDown={(e) => startDrag("j", e)}
        >
          <circle r={22} fill="transparent" />
          <circle r={9} fill="#8b5cf6" opacity={0.2} />
          <circle r={6.5} fill="#ffffff" stroke="#8b5cf6" strokeWidth={3} />
          <text x={12} y={-4} fill="#8b5cf6" fontSize="12" fontWeight="800">ĵ</text>
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
