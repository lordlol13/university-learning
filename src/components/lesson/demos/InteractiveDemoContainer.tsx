"use client";

import React, { useRef } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

export interface DemoMetric {
  label: string;
  value: string | number;
  unit?: string;
  color?: string; // Hex or theme color for linked highlight
}

interface InteractiveDemoContainerProps {
  title?: string;
  caption?: string;
  metrics?: DemoMetric[];
  onReset?: () => void;
  completed?: boolean;
  onMeaningfulInteraction?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function InteractiveDemoContainer({
  title,
  caption,
  metrics = [],
  onReset,
  completed,
  onMeaningfulInteraction,
  children,
  className = "",
}: InteractiveDemoContainerProps) {
  const interactedRef = useRef(false);

  const handlePointerDown = () => {
    if (!interactedRef.current) {
      interactedRef.current = true;
      onMeaningfulInteraction?.();
    }
  };

  return (
    <div
      className={`interactive-demo-card ${completed ? "is-completed" : ""} ${className}`}
      onPointerDown={handlePointerDown}
    >
      <div className="demo-header">
        <div className="demo-title-group">
          <div className="demo-badge">
            <Sparkles size={13} className="demo-badge-icon" />
            <span>Interactive Model · Drag to explore</span>
          </div>
          {title && <h4 className="demo-title">{title}</h4>}
          {caption && <p className="demo-caption">{caption}</p>}
        </div>

        {onReset && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="demo-reset-btn"
            title="Reset parameters"
            aria-label="Reset parameters to initial state"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Metrics & Linked Variables Row */}
      {metrics.length > 0 && (
        <div className="demo-metrics-row" role="region" aria-label="Live values">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="demo-metric-pill"
              style={{
                borderLeftColor: m.color || "var(--accent, #0d9488)",
              }}
            >
              <span className="metric-label">{m.label}</span>
              <span className="metric-value" style={{ color: m.color }}>
                {m.value}
                {m.unit && <span className="metric-unit"> {m.unit}</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Visual Canvas Area */}
      <div className="demo-canvas-wrap">{children}</div>
    </div>
  );
}
