"use client";

import React, { useState, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

type GateType = "AND" | "OR" | "XOR" | "NAND";

export function DiscreteLogicDemo({
  completed,
  onComplete,
  title = "Logic Gates & Truth Propagation",
  caption = "Toggle inputs A and B or drag between gates to observe how electrical truth signals propagate through logic circuits.",
}: Props) {
  const [a, setA] = useState<boolean>(true);
  const [b, setB] = useState<boolean>(false);
  const [gate, setGate] = useState<GateType>("AND");

  const computeOutput = (inA: boolean, inB: boolean, g: GateType): boolean => {
    switch (g) {
      case "AND": return inA && inB;
      case "OR": return inA || inB;
      case "XOR": return inA !== inB;
      case "NAND": return !(inA && inB);
    }
  };

  const out = computeOutput(a, b, gate);

  const metrics: DemoMetric[] = [
    { label: "Input A", value: a ? "1 (HIGH)" : "0 (LOW)", color: a ? "#0d9488" : "#94a3b8" },
    { label: "Gate Type", value: gate, color: "#6366f1" },
    { label: "Input B", value: b ? "1 (HIGH)" : "0 (LOW)", color: b ? "#0d9488" : "#94a3b8" },
    { label: "Output Q", value: out ? "1 (TRUE / ON)" : "0 (FALSE / OFF)", color: out ? "#f59e0b" : "#64748b" },
  ];

  const toggleA = () => {
    setA((prev) => !prev);
    onComplete?.();
  };

  const toggleB = () => {
    setB((prev) => !prev);
    onComplete?.();
  };

  const reset = useCallback(() => {
    setA(true);
    setB(false);
    setGate("AND");
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
      <div className="logic-circuit-container">
        {/* Gate Selection Pills */}
        <div className="gate-selector-bar">
          {(["AND", "OR", "XOR", "NAND"] as GateType[]).map((g) => (
            <button
              key={g}
              type="button"
              className={`gate-tab ${gate === g ? "active" : ""}`}
              onClick={() => {
                setGate(g);
                onComplete?.();
              }}
            >
              {g} Gate
            </button>
          ))}
        </div>

        <svg viewBox="0 0 440 220" className="tactile-svg">
          {/* Input A Switch */}
          <g
            transform="translate(40, 50)"
            style={{ cursor: "pointer" }}
            onClick={toggleA}
          >
            <rect
              x={0}
              y={0}
              width={70}
              height={34}
              rx={17}
              fill={a ? "#0d9488" : "#e2e8f0"}
              stroke={a ? "#0f766e" : "#cbd5e1"}
              strokeWidth={1.5}
            />
            <circle
              cx={a ? 53 : 17}
              cy={17}
              r={12}
              fill="#ffffff"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
            />
            <text
              x={a ? 25 : 45}
              y={21}
              fontSize="11"
              fontWeight="700"
              fill={a ? "#ffffff" : "#64748b"}
              textAnchor="middle"
            >
              {a ? "1" : "0"}
            </text>
            <text x={-20} y={22} fontSize="13" fontWeight="800" fill="#1e293b">A</text>
          </g>

          {/* Input B Switch */}
          <g
            transform="translate(40, 135)"
            style={{ cursor: "pointer" }}
            onClick={toggleB}
          >
            <rect
              x={0}
              y={0}
              width={70}
              height={34}
              rx={17}
              fill={b ? "#0d9488" : "#e2e8f0"}
              stroke={b ? "#0f766e" : "#cbd5e1"}
              strokeWidth={1.5}
            />
            <circle
              cx={b ? 53 : 17}
              cy={17}
              r={12}
              fill="#ffffff"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
            />
            <text
              x={b ? 25 : 45}
              y={21}
              fontSize="11"
              fontWeight="700"
              fill={b ? "#ffffff" : "#64748b"}
              textAnchor="middle"
            >
              {b ? "1" : "0"}
            </text>
            <text x={-20} y={22} fontSize="13" fontWeight="800" fill="#1e293b">B</text>
          </g>

          {/* Wire A to Gate */}
          <path
            d="M 110 67 L 195 67 L 195 90"
            fill="none"
            stroke={a ? "#0d9488" : "#cbd5e1"}
            strokeWidth={3}
            strokeDasharray={a ? "none" : "4,4"}
          />

          {/* Wire B to Gate */}
          <path
            d="M 110 152 L 195 152 L 195 130"
            fill="none"
            stroke={b ? "#0d9488" : "#cbd5e1"}
            strokeWidth={3}
            strokeDasharray={b ? "none" : "4,4"}
          />

          {/* Gate Box */}
          <g transform="translate(195, 75)">
            <rect
              x={0}
              y={0}
              width={80}
              height={70}
              rx={12}
              fill="#1e293b"
              stroke="#6366f1"
              strokeWidth={2}
            />
            <text
              x={40}
              y={38}
              fill="#ffffff"
              fontSize="15"
              fontWeight="800"
              textAnchor="middle"
              letterSpacing={1}
            >
              {gate}
            </text>
            <text
              x={40}
              y={55}
              fill="#94a3b8"
              fontSize="10"
              textAnchor="middle"
            >
              GATE
            </text>
          </g>

          {/* Wire Gate to Output */}
          <path
            d="M 275 110 L 340 110"
            fill="none"
            stroke={out ? "#f59e0b" : "#cbd5e1"}
            strokeWidth={4}
          />

          {/* Output Indicator Bulb */}
          <g transform="translate(340, 90)">
            <rect
              x={0}
              y={0}
              width={75}
              height={40}
              rx={20}
              fill={out ? "#fffbeb" : "#f1f5f9"}
              stroke={out ? "#f59e0b" : "#cbd5e1"}
              strokeWidth={2}
            />
            <circle
              cx={20}
              cy={20}
              r={10}
              fill={out ? "#f59e0b" : "#94a3b8"}
              className={out ? "pulse-ring" : ""}
            />
            <text
              x={48}
              y={24}
              fontSize="12"
              fontWeight="800"
              fill={out ? "#b45309" : "#64748b"}
              textAnchor="middle"
            >
              {out ? "HIGH" : "LOW"}
            </text>
          </g>
        </svg>
      </div>
    </InteractiveDemoContainer>
  );
}
