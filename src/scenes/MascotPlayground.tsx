"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { GraduationCap, ArrowUpRight } from "lucide-react";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion";
import type {
  StorkAnimation,
  StorkExpression,
  StorkHandle,
} from "@/components/mascot/types";
import type { CharacterStats } from "@/components/mascot/StorkDebug";
import type { StageOptions, targets } from "./MascotStage";
import "./mascot-playground.css";
const Stage = dynamic(() => import("./MascotStage"), {
  ssr: false,
  loading: () => <p className="studio-error">Preparing your companion…</p>,
});
const animations: [StorkAnimation, string][] = [
  ["idle", "Idle"],
  ["wave", "Wave"],
  ["pointLeft", "Point left"],
  ["pointRight", "Point right"],
  ["pointDown", "Point down"],
  ["pointAtTarget", "Point at target"],
  ["celebrate", "Celebrate"],
  ["thinking", "Thinking"],
  ["encourage", "Encourage"],
  ["success", "Success"],
];
const extraAnimations: [StorkAnimation, string][] = [
  ["lookAround", "Look around"],
  ["blink", "Blink"],
  ["happy", "Happy"],
  ["jump", "Jump"],
  ["confused", "Curious shrug"],
  ["sleepy", "Sleepy"],
  ["walk", "Walk"],
];
const expressions: StorkExpression[] = [
  "neutral",
  "happy",
  "curious",
  "excited",
  "thinking",
];
const initial: StageOptions = {
  expression: "neutral",
  quality: "auto",
  backpack: true,
  track: true,
  blink: true,
  variation: true,
  rig: false,
  bounds: false,
  scale: 1,
  rotation: 0,
  speed: 1,
  light: 1,
  background: "light",
  target: null,
  reduced: false,
  presentation: "hero",
};
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="studio-toggle">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="studio-range">
      <span>{label}</span>
      <output>
        {value}
        {unit}
      </output>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
export default function MascotPlayground() {
  const mascot = useRef<StorkHandle>(null);
  const [options, setOptions] = useState(initial),
    [active, setActive] = useState<StorkAnimation>("idle");
  const [stats, setStats] = useState<CharacterStats | null>(null);
  const reduced = useReducedMotionPreference();
  const update = <K extends keyof StageOptions>(
    key: K,
    value: StageOptions[K],
  ) => setOptions((previous) => ({ ...previous, [key]: value }));
  const play = (animation: StorkAnimation) => {
    if (
      animation === "pointLeft" ||
      animation === "pointRight" ||
      animation === "pointDown" ||
      animation === "pointAtTarget"
    ) {
      update(
        "target",
        animation === "pointLeft"
          ? "left"
          : animation === "pointDown"
            ? "down"
            : "right",
      );
    } else update("target", null);
    mascot.current?.play(animation);
  };
  const onTarget = useCallback((target: keyof typeof targets) => {
    setOptions((previous) => ({ ...previous, target }));
    mascot.current?.play("pointAtTarget");
  }, []);
  const buttons = (items: [StorkAnimation, string][]) => (
    <div className="studio-chips">
      {items.map(([value, label]) => (
        <button
          key={value}
          aria-pressed={active === value}
          onClick={() => play(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
  return (
    <main
      className={`mascot-studio studio-background-${options.background}`}
      id="main-content"
    >
      <header className="studio-header">
        <Link className="studio-brand" href="/path/ai-ml">
          <GraduationCap size={23} />
          uplift
          <span style={{ fontWeight: 400, color: "#748373" }}> / studio</span>
        </Link>
        <nav aria-label="Studio navigation">
          <Link href="/dashboard">Your campus</Link>
          <Link href="/path/ai-ml">Learning path ↗</Link>
        </nav>
      </header>
      <div className="studio-title">
        <div>
          <div className="studio-eyebrow">Meet your study companion</div>
          <h1>
            A little character.
            <br />A world of possibility.
          </h1>
          <p>
            An optimistic mind, a curious beak, and a little encouragement for
            every step. Get to know your university stork.
          </p>
        </div>
        <span className="studio-status">Live 3D character</span>
      </div>
      {reduced && (
        <p className="studio-reduced">
          Reduced motion is on. Jumps and continuous motion are disabled; gentle
          expressions and blinking remain.
        </p>
      )}
      <div className="studio-grid">
        <section className="studio-stage-wrap" aria-label="Character preview">
          <div className="studio-stage">
            <div className="studio-stage-top">
              <strong>Character playground</strong>
              <span aria-live="polite">
                {active.replace(/([A-Z])/g, " $1").toLowerCase()}
              </span>
            </div>
            <Stage
              options={{ ...options, reduced }}
              mascot={mascot}
              onAnimation={setActive}
              onStats={setStats}
              onTarget={onTarget}
            />
            <div className="studio-stage-bottom">
              <p>
                Drag to explore every angle.
                <br />
                Tap your companion to say hello.
              </p>
              <button onClick={() => play("wave")}>
                Say hello{" "}
                <ArrowUpRight
                  size={12}
                  style={{ display: "inline", marginLeft: 8 }}
                />
              </button>
            </div>
          </div>
          <div className="studio-caption">
            <div>
              <strong>Small steps. Big futures.</strong>One reusable character,
              from your first lesson to your next milestone.
            </div>
            <code>&lt;StorkMascot interactive /&gt;</code>
          </div>
        </section>
        <aside className="studio-controls" aria-label="Mascot controls">
          <section className="studio-control-card">
            <h2>
              Make a move <span>Animation</span>
            </h2>
            {buttons(animations)}
            <details style={{ marginTop: 16 }}>
              <summary>More gestures</summary>
              {buttons(extraAnimations)}
            </details>
            <span className="studio-label">Point toward a lesson</span>
            <div className="studio-chips">
              {(["left", "right", "down"] as const).map((target) => (
                <button
                  key={target}
                  aria-pressed={options.target === target}
                  onClick={() => onTarget(target)}
                >
                  {target[0].toUpperCase() + target.slice(1)}
                </button>
              ))}
            </div>
          </section>
          <section className="studio-control-card">
            <h2>
              A face full of possibility <span>Expression</span>
            </h2>
            <div className="studio-chips">
              {expressions.map((expression) => (
                <button
                  key={expression}
                  aria-pressed={options.expression === expression}
                  onClick={() => {
                    update("expression", expression);
                    mascot.current?.play("idle");
                  }}
                >
                  {expression[0].toUpperCase() + expression.slice(1)}
                </button>
              ))}
            </div>
          </section>
          <section className="studio-control-card">
            <h2>
              Make it your own <span>Character</span>
            </h2>
            <Toggle
              label="Track cursor"
              checked={options.track}
              onChange={(v) => update("track", v)}
            />
            <Toggle
              label="Backpack"
              checked={options.backpack}
              onChange={(v) => update("backpack", v)}
            />
            <Toggle
              label="Auto blink"
              checked={options.blink}
              onChange={(v) => update("blink", v)}
            />
            <Toggle
              label="Auto idle variation"
              checked={options.variation}
              onChange={(v) => update("variation", v)}
            />
            <label className="studio-select">
              Presentation
              <select
                value={options.presentation}
                onChange={(e) =>
                  update(
                    "presentation",
                    e.target.value as StageOptions["presentation"],
                  )
                }
              >
                <option value="hero">Hero</option>
                <option value="medium">Medium</option>
                <option value="small">Small</option>
              </select>
            </label>
          </section>
          <section className="studio-control-card">
            <details open>
              <summary>Scene & performance</summary>
              <Slider
                label="Scale"
                value={options.scale}
                min={0.6}
                max={1.2}
                step={0.05}
                unit="×"
                onChange={(v) => update("scale", v)}
              />
              <Slider
                label="Rotation"
                value={options.rotation}
                min={-180}
                max={180}
                step={5}
                unit="°"
                onChange={(v) => update("rotation", v)}
              />
              <Slider
                label="Animation speed"
                value={options.speed}
                min={0.5}
                max={1.5}
                step={0.1}
                unit="×"
                onChange={(v) => update("speed", v)}
              />
              <Slider
                label="Lighting intensity"
                value={options.light}
                min={0.5}
                max={1.5}
                step={0.1}
                unit="×"
                onChange={(v) => update("light", v)}
              />
              <label className="studio-select">
                Quality
                <select
                  value={options.quality}
                  onChange={(e) =>
                    update("quality", e.target.value as StageOptions["quality"])
                  }
                >
                  {["auto", "low", "medium", "high"].map((q) => (
                    <option key={q} value={q}>
                      {q[0].toUpperCase() + q.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="studio-select">
                Background
                <select
                  value={options.background}
                  onChange={(e) =>
                    update(
                      "background",
                      e.target.value as StageOptions["background"],
                    )
                  }
                >
                  <option value="light">Warm light</option>
                  <option value="green">Campus green</option>
                  <option value="blue">Sky blue</option>
                </select>
              </label>
              <p className="studio-note">
                Auto quality adapts geometry and shadows to the canvas size and
                device. Pixel ratio is capped.
              </p>
            </details>
          </section>
          {process.env.NODE_ENV === "development" && (
            <section className="studio-control-card">
              <details>
                <summary>Development tools</summary>
                <Toggle
                  label="Show rig debug"
                  checked={options.rig}
                  onChange={(v) => update("rig", v)}
                />
                <Toggle
                  label="Show bounding box"
                  checked={options.bounds}
                  onChange={(v) => update("bounds", v)}
                />
                <div className="studio-stats" aria-live="off">
                  {stats ? (
                    <>
                      <span>{stats.fps} fps</span>
                      <span>
                        {Math.round(stats.triangles).toLocaleString()} character
                        triangles
                      </span>
                      <span>{stats.materials} materials</span>
                      <span>{stats.calls} scene draw calls</span>
                    </>
                  ) : (
                    "Measuring scene…"
                  )}
                </div>
              </details>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
