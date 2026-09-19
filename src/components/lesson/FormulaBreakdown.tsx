"use client";
import { useState } from "react";
import { MousePointer2 } from "lucide-react";
import type { LessonBlock } from "@/types/lesson-engine";
import { MathFormula } from "./Math";

export function FormulaBreakdown({
  block,
}: {
  block: Extract<LessonBlock, { type: "formula-breakdown" }>;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const variable =
    selected === null ? undefined : block.parts[selected].variable;
  return (
    <div className="formula-explorer">
      <div
        className="formula-parts"
        aria-label="Explore the gradient descent formula"
      >
        {block.parts.map((part, index) =>
          part.variable ? (
            <button
              key={index}
              className={selected === index ? "active" : ""}
              aria-pressed={selected === index}
              aria-label={`Explain ${part.variable.name}`}
              onClick={() => setSelected(index)}
              onMouseEnter={() => setSelected(index)}
              onFocus={() => setSelected(index)}
            >
              <MathFormula latex={part.latex} />
            </button>
          ) : (
            <MathFormula key={index} latex={part.latex} />
          ),
        )}
      </div>
      <div className="formula-context" role="status">
        {variable ? (
          <>
            <strong>{variable.name}</strong>
            <p>{variable.explanation}</p>
          </>
        ) : (
          <>
            <MousePointer2 size={18} />
            <p>Select or hover a term to discover what it does.</p>
          </>
        )}
      </div>
    </div>
  );
}
