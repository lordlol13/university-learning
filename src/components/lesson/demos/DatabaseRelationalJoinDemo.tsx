"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

type JoinMode = "INNER" | "LEFT" | "CROSS";

export function DatabaseRelationalJoinDemo({
  completed,
  onComplete,
  title = "Relational Database SQL Joins",
  caption = "Drag the join selector slider to see how INNER, LEFT, and CROSS joins match primary and foreign keys.",
}: Props) {
  const [modeIndex, setModeIndex] = useState<number>(0);
  const modes: JoinMode[] = ["INNER", "LEFT", "CROSS"];
  const currentMode = modes[modeIndex];

  const isDraggingRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Table A: Users
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  // Table B: Orders (id 1 has 2 orders, id 2 has 1 order, id 4 has 1 order)
  const orders = [
    { orderId: 101, userId: 1, total: "$45" },
    { orderId: 102, userId: 1, total: "$90" },
    { orderId: 103, userId: 2, total: "$30" },
  ];

  let resultRowCount = 3;
  if (currentMode === "INNER") resultRowCount = 3; // Alice x2, Bob x1
  else if (currentMode === "LEFT") resultRowCount = 4; // Alice x2, Bob x1, Charlie x1 (NULL)
  else if (currentMode === "CROSS") resultRowCount = users.length * orders.length; // 3 x 3 = 9

  const metrics: DemoMetric[] = [
    { label: "Join Mode", value: `${currentMode} JOIN`, color: "#0d9488" },
    { label: "Predicate", value: "users.id = orders.user_id", color: "#6366f1" },
    { label: "Result Rows", value: `${resultRowCount} rows`, color: "#f59e0b" },
    { label: "Unmatched Rows", value: currentMode === "LEFT" ? "Charlie (NULL)" : "Excluded", color: "#64748b" },
  ];

  // Slider coordinates: mode in [0, 1, 2] maps to [80, 360]
  const sliderStartX = 80;
  const sliderEndX = 360;
  const sliderY = 240;
  const handleX = sliderStartX + (modeIndex / 2) * (sliderEndX - sliderStartX);

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
    const nextIdx = Math.round(t * 2);
    setModeIndex(nextIdx);
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
    setModeIndex(0);
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
        viewBox="0 0 440 270"
        className="tactile-svg"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Table A (Users) */}
        <g transform="translate(35, 30)">
          <rect x={0} y={0} width={130} height={150} rx={8} fill="#f8fafc" stroke="#0d9488" strokeWidth={1.5} />
          <rect x={0} y={0} width={130} height={30} rx={8} fill="#0d9488" />
          <text x={65} y={20} fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">
            Users (id, name)
          </text>
          {users.map((u, i) => (
            <g key={u.id} transform={`translate(10, ${48 + i * 36})`}>
              <text fontSize="11" fontWeight="700" fill="#0f766e">id: {u.id}</text>
              <text x={45} fontSize="11" fill="#334155">{u.name}</text>
            </g>
          ))}
        </g>

        {/* Table B (Orders) */}
        <g transform="translate(275, 30)">
          <rect x={0} y={0} width={130} height={150} rx={8} fill="#f8fafc" stroke="#8b5cf6" strokeWidth={1.5} />
          <rect x={0} y={0} width={130} height={30} rx={8} fill="#8b5cf6" />
          <text x={65} y={20} fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">
            Orders (user_id)
          </text>
          {orders.map((o, i) => (
            <g key={o.orderId} transform={`translate(10, ${48 + i * 36})`}>
              <text fontSize="11" fontWeight="700" fill="#7c3aed">user: {o.userId}</text>
              <text x={55} fontSize="11" fill="#334155">{o.total}</text>
            </g>
          ))}
        </g>

        {/* Connecting Key Match Lines */}
        {/* User 1 -> Order 101, 102 */}
        <line x1={165} y1={78} x2={275} y2={78} stroke="#0d9488" strokeWidth={2} strokeDasharray="3,3" />
        <line x1={165} y1={78} x2={275} y2={114} stroke="#0d9488" strokeWidth={2} strokeDasharray="3,3" />
        {/* User 2 -> Order 103 */}
        <line x1={165} y1={114} x2={275} y2={150} stroke="#0d9488" strokeWidth={2} strokeDasharray="3,3" />

        {/* User 3 unmatched */}
        {currentMode === "LEFT" && (
          <text x={175} y={154} fontSize="10" fill="#ef4444" fontWeight="700">
            NULL match →
          </text>
        )}

        {/* Draggable Slider */}
        <g>
          <line x1={sliderStartX} y1={sliderY} x2={sliderEndX} y2={sliderY} stroke="#e2e8f0" strokeWidth={5} strokeLinecap="round" />
          <line x1={sliderStartX} y1={sliderY} x2={handleX} y2={sliderY} stroke="#0d9488" strokeWidth={5} strokeLinecap="round" />

          {modes.map((m, idx) => {
            const x = sliderStartX + (idx / 2) * (sliderEndX - sliderStartX);
            return (
              <text key={m} x={x} y={sliderY - 10} fontSize="11" fontWeight="700" textAnchor="middle" fill={modeIndex === idx ? "#0d9488" : "#94a3b8"}>
                {m}
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
