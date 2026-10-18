"use client";

import { useMemo, useState } from "react";
import { FlaskConical, RotateCcw, Sparkles, X } from "lucide-react";

export type MiniLabKind = "gradient" | "pendulum" | "wave" | "conjugate";

export function getMiniLabKind(directionId: string): MiniLabKind {
  switch (directionId) {
    case "ai-ml":
      return "gradient";
    case "physics-engineering":
      return "pendulum";
    case "mathematics":
      return "wave";
    case "italian-language":
      return "conjugate";
    default:
      return "gradient";
  }
}

export const MINI_LAB_META: Record<
  MiniLabKind,
  { title: string; subtitle: string; formula: string }
> = {
  gradient: {
    title: "Gradient Descent Sandbox",
    subtitle:
      "Drag the learning rate η and watch 10 optimization steps roll toward the minimum of L(x) = x².",
    formula: "xₙ₊₁ = xₙ − 2η·xₙ",
  },
  pendulum: {
    title: "Harmonic Pendulum Lab",
    subtitle:
      "Adjust the string length L under Earth gravity (g = 9.81 m/s²) and feel how the swing period responds.",
    formula: "T = 2π √(L / g)",
  },
  wave: {
    title: "Sine Wave Synthesizer",
    subtitle:
      "Shape a harmonic wave in real time by tuning its amplitude A and angular frequency f.",
    formula: "y(x) = A · sin(f·x)",
  },
  conjugate: {
    title: "Italian Verb Studio",
    subtitle:
      "Pick an infinitive verb and subject pronoun to see the present-tense conjugation snap into place.",
    formula: "Presente Indicativo",
  },
};

function LabSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  fmt,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  fmt: (v: number) => string;
}) {
  return (
    <label className="uplift-lab-slider">
      <div className="uplift-lab-slider-top">
        <span>{label}</span>
        <strong>{fmt(value)}</strong>
      </div>
      <input
        className="uplift-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function GradientLab() {
  const [lr, setLr] = useState(0.28);
  const steps = useMemo(() => {
    const xs = [4.2];
    for (let i = 0; i < 10; i++) {
      xs.push(xs[i] - lr * 2 * xs[i]);
    }
    return xs;
  }, [lr]);

  const sx = (x: number) => 150 + Math.max(-6, Math.min(6, x)) * 22;
  const sy = (x: number) => 145 - Math.min(x * x, 36) * 3.4;
  const last = Math.abs(steps[steps.length - 1]);
  const verdict =
    last < 0.05
      ? "Converged cleanly to the global minimum!"
      : last > 4.2
        ? "Diverging — learning rate overshoots the valley!"
        : lr > 0.5
          ? "Oscillating across the valley walls…"
          : "Stepping steadily down the loss curve…";

  return (
    <div className="uplift-lab-body">
      <svg
        viewBox="0 0 300 160"
        className="uplift-lab-stage"
        aria-label="Gradient descent parabola visualization"
      >
        <line
          x1="20"
          x2="280"
          y1="145"
          y2="145"
          stroke="rgba(15,23,42,0.12)"
          strokeWidth="1"
        />
        <path
          d={Array.from({ length: 61 }, (_, i) => {
            const x = -6 + i * 0.2;
            return `${i ? "L" : "M"}${sx(x)},${sy(x)}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(15,23,42,0.35)"
          strokeWidth="2.2"
        />
        <polyline
          points={steps.map((x) => `${sx(x)},${sy(x)}`).join(" ")}
          fill="none"
          stroke="var(--track-2)"
          strokeWidth="1.75"
          strokeDasharray="3 3"
        />
        {steps.map((x, i) => (
          <circle
            key={i}
            cx={sx(x)}
            cy={sy(x)}
            r={i === 0 ? 5.5 : i === steps.length - 1 ? 5 : 3.8}
            fill={i === steps.length - 1 ? "var(--track-2)" : "var(--track)"}
            opacity={0.35 + (i / steps.length) * 0.65}
          />
        ))}
      </svg>
      <LabSlider
        label="Learning rate η"
        value={lr}
        min={0.02}
        max={1.08}
        step={0.01}
        onChange={setLr}
        fmt={(v) => v.toFixed(2)}
      />
      <div className="uplift-lab-verdict">
        <Sparkles size={14} />
        <span>{verdict}</span>
      </div>
    </div>
  );
}

function PendulumLab() {
  const [L, setL] = useState(1.25);
  const T = 2 * Math.PI * Math.sqrt(L / 9.81);
  return (
    <div className="uplift-lab-body">
      <div className="uplift-lab-stage uplift-pendulum-stage">
        <div className="uplift-pendulum-mount" />
        <div
          className="uplift-pendulum-arm"
          style={{ animationDuration: `${(T / 2).toFixed(2)}s` }}
        >
          <div
            className="uplift-pendulum-rod"
            style={{ height: `${32 + L * 34}px` }}
          />
          <div className="uplift-pendulum-bob" />
        </div>
      </div>
      <LabSlider
        label="String length L"
        value={L}
        min={0.25}
        max={3.0}
        step={0.05}
        onChange={setL}
        fmt={(v) => `${v.toFixed(2)} m`}
      />
      <div className="uplift-lab-verdict">
        <Sparkles size={14} />
        <span>
          Period <strong>T = {T.toFixed(2)} s</strong> — longer strings swing
          with a slower rhythm.
        </span>
      </div>
    </div>
  );
}

function WaveLab() {
  const [A, setA] = useState(1.1);
  const [f, setF] = useState(1.5);
  const d = useMemo(
    () =>
      Array.from({ length: 121 }, (_, i) => {
        const x = (i / 120) * Math.PI * 4;
        return `${i ? "L" : "M"}${(i / 120) * 300},${80 - A * 26 * Math.sin(f * x)}`;
      }).join(" "),
    [A, f],
  );
  return (
    <div className="uplift-lab-body">
      <svg
        viewBox="0 0 300 160"
        className="uplift-lab-stage"
        aria-label="Sine wave visualization"
      >
        <line
          x1="0"
          x2="300"
          y1="80"
          y2="80"
          stroke="rgba(15,23,42,0.2)"
          strokeDasharray="4 4"
        />
        <path
          d={d}
          fill="none"
          stroke="var(--track)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
      <div className="uplift-lab-grid2">
        <LabSlider
          label="Amplitude A"
          value={A}
          min={0.2}
          max={2.4}
          step={0.05}
          onChange={setA}
          fmt={(v) => v.toFixed(2)}
        />
        <LabSlider
          label="Frequency f"
          value={f}
          min={0.25}
          max={4.0}
          step={0.05}
          onChange={setF}
          fmt={(v) => v.toFixed(2)}
        />
      </div>
      <div className="uplift-lab-verdict">
        <Sparkles size={14} />
        <span>
          Wave equation:{" "}
          <strong>
            y = {A.toFixed(2)} · sin({f.toFixed(2)}x)
          </strong>
        </span>
      </div>
    </div>
  );
}

const VERBS = {
  parlare: { stem: "parl", type: "are" as const, meaning: "to speak" },
  mangiare: { stem: "mangi", type: "are" as const, meaning: "to eat" },
  dormire: { stem: "dorm", type: "ire" as const, meaning: "to sleep" },
} as const;

const PRONOUNS = ["io", "tu", "lui/lei", "noi", "voi", "loro"] as const;
const ENDINGS = {
  are: ["o", "i", "a", "iamo", "ate", "ano"],
  ire: ["o", "i", "e", "iamo", "ite", "ono"],
} as const;

function ConjugateLab() {
  const [verb, setVerb] = useState<keyof typeof VERBS>("parlare");
  const [pronounIdx, setPronounIdx] = useState(0);
  const { stem, type, meaning } = VERBS[verb];
  const rawEnding = ENDINGS[type][pronounIdx];
  const displayStem =
    verb === "mangiare" && (pronounIdx === 1 || pronounIdx === 3)
      ? "mang"
      : stem;

  return (
    <div className="uplift-lab-body">
      <div className="uplift-lab-pills">
        {(Object.keys(VERBS) as (keyof typeof VERBS)[]).map((v) => (
          <button
            key={v}
            type="button"
            className="uplift-hud-btn"
            data-on={v === verb}
            onClick={() => setVerb(v)}
          >
            {v} <small style={{ opacity: 0.65 }}>({VERBS[v].meaning})</small>
          </button>
        ))}
      </div>
      <div className="uplift-lab-pronouns">
        {PRONOUNS.map((pr, i) => (
          <button
            key={pr}
            type="button"
            className="uplift-hud-btn"
            data-on={i === pronounIdx}
            onClick={() => setPronounIdx(i)}
          >
            {pr}
          </button>
        ))}
      </div>
      <div className="uplift-lab-stage uplift-conjugate-stage">
        <span className="uplift-conjugate-pronoun">{PRONOUNS[pronounIdx]}</span>
        <div className="uplift-conjugate-word">
          <span>{displayStem}</span>
          <span className="uplift-conjugate-ending">{rawEnding}</span>
        </div>
        <span className="uplift-conjugate-meaning">
          {verb} — {meaning}
        </span>
      </div>
    </div>
  );
}

export function IslandMiniLab({
  directionId,
  onClose,
}: {
  directionId: string;
  onClose: () => void;
}) {
  const kind = getMiniLabKind(directionId);
  const meta = MINI_LAB_META[kind];
  const [resetKey, setResetKey] = useState(0);

  return (
    <aside
      className="uplift-glass-strong uplift-minilab-drawer"
      role="dialog"
      aria-label={meta.title}
    >
      <div className="uplift-minilab-header">
        <div className="uplift-minilab-title-wrap">
          <span className="uplift-minilab-eyebrow">
            <FlaskConical size={13} /> ISLAND SANDBOX
          </span>
          <h2>{meta.title}</h2>
        </div>
        <div className="uplift-minilab-actions">
          <button
            type="button"
            className="uplift-hud-btn uplift-icon-only"
            onClick={() => setResetKey((k) => k + 1)}
            aria-label="Reset sandbox"
            title="Reset parameters"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            className="uplift-hud-btn uplift-icon-only"
            onClick={onClose}
            aria-label="Close sandbox"
            title="Close sandbox"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <p className="uplift-minilab-subtitle">{meta.subtitle}</p>
      <div className="uplift-minilab-formula">{meta.formula}</div>

      <div key={resetKey}>
        {kind === "gradient" && <GradientLab />}
        {kind === "pendulum" && <PendulumLab />}
        {kind === "wave" && <WaveLab />}
        {kind === "conjugate" && <ConjugateLab />}
      </div>
    </aside>
  );
}
