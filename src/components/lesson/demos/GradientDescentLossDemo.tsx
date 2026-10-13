"use client";

import React, { useState, useRef, useCallback } from "react";
import { InteractiveDemoContainer, DemoMetric } from "./InteractiveDemoContainer";

interface Props {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export function GradientDescentLossDemo({
  completed,
  onComplete,
  title = "Gradient Descent & Learning Rate",
  caption = "Drag the position ball along the loss bowl or adjust the learning rate slider to see gradient step overshoot vs convergence.",
}: Props) {
  // Current parameter w in [-3, 3]
  const [w, setW] = useState<number>(2.4);
  // Learning rate alpha in [0.05, 1.2]
  const [alpha, setAlpha] = useState<number>(0.35);

  const isDraggingBallRef = useRef(false);
  const isDraggingAlphaRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Loss bowl: L(w) = 0.5 * w^2 + 0.2
  // Gradient: dL/dw = w
  const loss = (x: number) => 0.5 * x * x + 0.2;
  const grad = w;
  const curLoss = loss(w);

  // Predicted next position: w_next = w - alpha * grad = w * (1 - alpha)
  const nextW = w - alpha * grad;
  const nextLoss = loss(nextW);

  let stepBehavior = "Smooth Convergence";
  if (alpha > 1.0) stepBehavior = "Diverging / Oscillation";
  else if (alpha > 0.8) stepBehavior = "Over-shooting";
  else if (alpha < 0.15) stepBehavior = "Slow Crawl";

  const metrics: DemoMetric[] = [
    { label: "Parameter (w)", value: w.toFixed(2), color: "#0d9488" },
    { label: "Loss L(w)", value: curLoss.toFixed(2), color: "#6366f1" },
    { label: "Gradient ∇L", value: grad.toFixed(2), color: "#ef4444" },
    { label: "Learning Rate (α)", value: alpha.toFixed(2), color: "#f59e0b" },
    { label: "Next w*", value: nextW.toFixed(2), color: "#10b981" },
    { label: "Regime", value: stepBehavior, color: "#1e293b" },
  ];

  // SVG dimensions: 440 x 300
  const ox = 220;
  const oy = 210;
  const scaleX = 55;
  const scaleY = 32;

  const toPx = (xVal: number, yVal: number) => ({
    px: ox + xVal * scaleX,
    py: oy - yVal * scaleY,
  });

  const ballPx = toPx(w, curLoss);
  const nextPx = toPx(nextW, nextLoss);

  // Generate bowl curve
  const bowlPts: string[] = [];
  for (let x = -3.4; x <= 3.4; x += 0.1) {
    const p = toPx(x, loss(x));
    bowlPts.push(`${p.px.toFixed(1)},${p.py.toFixed(1)}`);
  }
  const bowlPath = `M ${bowlPts.join(" L ")}`;

  // Slider coordinates for alpha
  const sliderStartX = 70;
  const sliderEndX = 370;
  const sliderY = 270;
  const alphaHandleX = sliderStartX + ((alpha - 0.05) / (1.2 - 0.05)) * (sliderEndX - sliderStartX);

  const handlePointerDownBall = (e: React.PointerEvent) => {
    isDraggingBallRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerDownAlpha = (e: React.PointerEvent) => {
    isDraggingAlphaRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onComplete?.();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 440;

    if (isDraggingBallRef.current) {
      let mx = (svgX - ox) / scaleX;
      mx = Math.max(-3.0, Math.min(3.0, mx));
      setW(Math.round(mx * 100) / 100);
    } else if (isDraggingAlphaRef.current) {
      const t = Math.max(0, Math.min(1, (svgX - sliderStartX) / (sliderEndX - sliderStartX)));
      const nextAlpha = 0.05 + t * (1.2 - 0.05);
      setAlpha(Math.round(nextAlpha * 100) / 100);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingBallRef.current = false;
    isDraggingAlphaRef.current = false;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const reset = useCallback(() => {
    setW(2.4);
    setAlpha(0.35);
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
        <defs>
          <marker
            id="arrow-grad-step"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
        </defs>

        {/* Axes */}
        <line x1={30} y1={oy} x2={410} y2={oy} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={ox} y1={230} x2={ox} y2={20} stroke="#cbd5e1" strokeWidth={1} />
        <text x={415} y={oy + 4} fill="#64748b" fontSize="11" fontWeight="600">w</text>
        <text x={ox - 4} y={15} fill="#64748b" fontSize="11" fontWeight="600">Loss L(w)</text>

        {/* Loss Bowl Curve */}
        <path d={bowlPath} fill="none" stroke="#6366f1" strokeWidth={3} />

        {/* Minimum target star at (0, 0.2) */}
        <circle cx={ox} cy={oy - 0.2 * scaleY} r={4} fill="#10b981" />
        <text x={ox} y={oy - 0.2 * scaleY + 16} fontSize="10" fill="#10b981" textAnchor="middle" fontWeight="700">
          Global Min
        </text>

        {/* Step Jump Arrow from (w) to (nextW) */}
        <path
          d={`M ${ballPx.px} ${ballPx.py} Q ${(ballPx.px + nextPx.px) / 2} ${Math.min(ballPx.py, nextPx.py) - 25} ${nextPx.px} ${nextPx.py}`}
          fill="none"
          stroke="#10b981"
          strokeWidth={2.5}
          strokeDasharray="4,3"
          markerEnd="url(#arrow-grad-step)"
        />

        {/* Ghost ball at predicted next step */}
        <circle cx={nextPx.px} cy={nextPx.py} r={6} fill="#10b981" opacity={0.6} />

        {/* Draggable Ball at current w */}
        <g
          transform={`translate(${ballPx.px}, ${ballPx.py})`}
          style={{ cursor: "grab" }}
          onPointerDown={handlePointerDownBall}
        >
          <circle r={22} fill="transparent" />
          <circle r={11} fill="#0d9488" opacity={0.25} />
          <circle r={8} fill="#ffffff" stroke="#0d9488" strokeWidth={3} />
          <circle r={3} fill="#0d9488" />
        </g>

        {/* Learning Rate Slider Track */}
        <g>
          <line
            x1={sliderStartX}
            y1={sliderY}
            x2={sliderEndX}
            y2={sliderY}
            stroke="#e2e8f0"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={sliderStartX}
            y1={sliderY}
            x2={alphaHandleX}
            y2={sliderY}
            stroke="#f59e0b"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <text x={sliderStartX} y={sliderY - 8} fontSize="10" fill="#64748b">Low α (Slow)</text>
          <text x={sliderEndX} y={sliderY - 8} fontSize="10" fill="#64748b" textAnchor="end">High α (Overshoot)</text>

          {/* Slider Thumb Handle */}
          <g
            transform={`translate(${alphaHandleX}, ${sliderY})`}
            style={{ cursor: "grab" }}
            onPointerDown={handlePointerDownAlpha}
          >
            <circle r={20} fill="transparent" />
            <circle r={8} fill="#f59e0b" opacity={0.2} />
            <circle r={6.5} fill="#ffffff" stroke="#f59e0b" strokeWidth={3} />
          </g>
        </g>
      </svg>
    </InteractiveDemoContainer>
  );
}
