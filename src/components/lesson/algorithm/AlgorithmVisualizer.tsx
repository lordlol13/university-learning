"use client";
import { useEffect, type ReactNode } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

export interface AlgorithmStep {
  title: string;
  explanation: ReactNode;
  activeLine: number;
}
export function AnimationControls({
  playing,
  disabled,
  atStart,
  onPlay,
  onPrevious,
  onNext,
  onReset,
}: {
  playing: boolean;
  disabled: boolean;
  atStart: boolean;
  onPlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  return (
    <div className="animation-controls">
      <button
        className="lesson-btn"
        aria-label="Previous step"
        disabled={atStart}
        onClick={onPrevious}
      >
        <SkipBack size={16} /> Previous
      </button>
      <button
        className="lesson-btn primary"
        onClick={onPlay}
        disabled={disabled && !playing}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
        {playing ? "Pause" : "Play"}
      </button>
      <button
        className="lesson-btn"
        aria-label="Next step"
        disabled={disabled}
        onClick={onNext}
      >
        Next step <SkipForward size={16} />
      </button>
      <button className="lesson-btn subtle" onClick={onReset}>
        <RotateCcw size={16} /> Reset
      </button>
    </div>
  );
}
export function PseudocodeViewer({
  lines,
  activeLine,
}: {
  lines: string[];
  activeLine: number;
}) {
  return (
    <ol className="pseudocode" aria-label="Pseudocode">
      {lines.map((line, index) => (
        <li
          key={index}
          aria-current={index === activeLine ? "step" : undefined}
          className={index === activeLine ? "active" : ""}
        >
          <span>{index + 1}</span>
          <code>{line}</code>
          {index === activeLine && <span className="executing">← now</span>}
        </li>
      ))}
    </ol>
  );
}
export function useAlgorithmPlayback(
  playing: boolean,
  stopped: boolean,
  advance: () => void,
) {
  useEffect(() => {
    if (!playing || stopped) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) advance();
    }, 900);
    return () => window.clearInterval(timer);
  }, [playing, stopped, advance]);
}
export function AlgorithmVisualizer({
  step,
  lines,
  children,
}: {
  step: AlgorithmStep;
  lines: string[];
  children?: ReactNode;
}) {
  return (
    <div className="algorithm-visualizer">
      <div className="algorithm-explanation">
        <span className="lesson-kicker">CURRENT OPERATION</span>
        <h3>{step.title}</h3>
        <div role="status" aria-live="polite">
          {step.explanation}
        </div>
      </div>
      <PseudocodeViewer lines={lines} activeLine={step.activeLine} />
      {children}
    </div>
  );
}
