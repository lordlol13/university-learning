"use client";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import { ArrowRight, Lightbulb, RotateCcw } from "lucide-react";
import {
  algorithmState,
  derivative,
  formatNumber as fmt,
  nextIterationCursor,
  objective,
} from "@/lib/gradient-descent";
import { MathFormula } from "./Math";
import { InteractivePlot } from "./plot/InteractivePlot";
import {
  AlgorithmVisualizer,
  AnimationControls,
  useAlgorithmPlayback,
} from "./algorithm/AlgorithmVisualizer";

function useSimulation(initialX: number, initialRate: number) {
  const [eta, setEta] = useState(initialRate),
    [startX, setStartX] = useState(initialX),
    [cursor, setCursor] = useState(0),
    [playing, setPlaying] = useState(false);
  const state = algorithmState(startX, eta, cursor);
  const advance = useCallback(() => setCursor((c) => c + 1), []);
  useAlgorithmPlayback(playing, state.stopped, advance);
  const reset = () => {
    setCursor(0);
    setPlaying(false);
  };
  return {
    eta,
    startX,
    state,
    playing: playing && !state.stopped,
    reset,
    advance,
    setEta: (value: number) => {
      reset();
      setEta(value);
    },
    setStartX: (value: number) => {
      reset();
      setStartX(value);
    },
    step: () => {
      setPlaying(false);
      setCursor(nextIterationCursor(state.cursor));
    },
    previous: () => {
      setPlaying(false);
      setCursor(Math.max(0, state.cursor - 1));
    },
    next: () => {
      setPlaying(false);
      setCursor(state.cursor + 1);
    },
    togglePlay: () => setPlaying((p) => !p),
  };
}
const SimulationContext = createContext<ReturnType<
  typeof useSimulation
> | null>(null);
export function GradientDescentProvider({
  initialX,
  learningRate,
  children,
}: {
  initialX: number;
  learningRate: number;
  children: ReactNode;
}) {
  const simulation = useSimulation(initialX, learningRate);
  return (
    <SimulationContext.Provider value={simulation}>
      {children}
    </SimulationContext.Provider>
  );
}
function useGradientDescent() {
  const value = useContext(SimulationContext);
  if (!value)
    throw new Error("Gradient descent requires a simulation provider");
  return value;
}
export function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="parameter-slider">
      <label htmlFor={id}>
        {label}
        <output htmlFor={id}>{value.toFixed(2)}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
const viewport = { xMin: -2, xMax: 6, yMin: -1, yMax: 18 };
const lines = [
  "initialize x, learning_rate",
  "repeat until converged:",
  "    gradient = 2 * (x - 2)",
  "    x = x - learning_rate * gradient",
  "    loss = (x - 2)² + 1",
];
export function GradientDescentGraph({
  onComplete,
  completed,
}: {
  onComplete: () => void;
  completed: boolean;
}) {
  const sim = useGradientDescent(),
    { state: s } = sim;
  const previewX =
    s.phase === "gradient" ? s.nextX : s.x - sim.eta * derivative(s.x);
  const slope = s.phase === "gradient" ? s.gradient : derivative(s.x);
  const hint = s.stopped
    ? s.reason
    : sim.eta > 1
      ? "Your steps amplify the error. Try η = 0.10 and compare the path."
      : sim.eta === 1
        ? "Notice the two-sided oscillation: each step preserves the distance to x = 2."
        : sim.eta === 0.5
          ? "For this quadratic, η = 0.50 lands exactly at the minimum in one update."
          : sim.eta > 0.5
            ? "You cross the minimum each time, but the distance still shrinks."
            : "Notice the slope becoming gentler. With a fixed learning rate, the steps shrink naturally.";
  const offscreen =
    s.x < viewport.xMin || s.x > viewport.xMax || s.loss > viewport.yMax;
  return (
    <div className="gradient-lab">
      <div className="lab-title">
        <div>
          <span className="live-dot" /> LIVE EXPERIMENT
        </div>
        <MathFormula latex="f(x)=(x-2)^2+1" />
      </div>
      <div className="lab-legend">
        <span className="legend-blue">Current position</span>
        <span className="legend-gold">Next update</span>
        <span className="legend-green">Minimum (2, 1)</span>
      </div>
      <InteractivePlot
        label={`Gradient descent. Iteration ${s.iteration}, x ${fmt(s.x)}, loss ${fmt(s.loss)}. Drag to pan or use the controls below.`}
        initialViewport={viewport}
        fn={objective}
      >
        {(scale) => (
          <>
            <polyline
              points={s.trajectory
                .map((p) => `${scale.x(p.x)},${scale.y(p.y)}`)
                .join(" ")}
              fill="none"
              stroke="#77a99a"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            {s.trajectory.map((p, i) => (
              <circle
                key={i}
                cx={scale.x(p.x)}
                cy={scale.y(p.y)}
                r={3.5}
                fill="#7ca897"
              />
            ))}
            <line
              x1={scale.x(s.x - 0.8)}
              y1={scale.y(s.loss - slope * 0.8)}
              x2={scale.x(s.x + 0.8)}
              y2={scale.y(s.loss + slope * 0.8)}
              stroke="#b3811c"
              strokeWidth={2}
            />
            <line
              x1={scale.x(s.x)}
              y1={scale.y(s.loss)}
              x2={scale.x(previewX)}
              y2={scale.y(objective(previewX))}
              stroke="#c99b3f"
              strokeDasharray="5 4"
              strokeWidth={2}
            />
            <circle
              cx={scale.x(previewX)}
              cy={scale.y(objective(previewX))}
              r={6}
              fill="#fff8e6"
              stroke="#c3952e"
              strokeWidth={2}
            />
            <circle
              cx={scale.x(2)}
              cy={scale.y(1)}
              r={7}
              fill="#369849"
              stroke="white"
              strokeWidth={3}
            />
            <circle
              className="current-plot-point"
              cx={scale.x(s.x)}
              cy={scale.y(s.loss)}
              r={9}
              fill="#348bce"
              stroke="white"
              strokeWidth={3}
            />
            <text
              x={scale.x(2) + 12}
              y={scale.y(1) + 24}
              fill="#28753d"
              fontSize={13}
            >
              minimum
            </text>
          </>
        )}
      </InteractivePlot>
      {offscreen && (
        <p className="lab-warning">
          The current point is beyond the default view. Zoom out or reset with a
          smaller learning rate.
        </p>
      )}
      <div className="lab-stats" aria-live="polite">
        <div>
          <span>Iteration</span>
          <strong data-testid="iteration">
            {s.iteration.toString().padStart(2, "0")}
          </strong>
        </div>
        <div>
          <span>Position x</span>
          <strong data-testid="position">{fmt(s.x)}</strong>
        </div>
        <div>
          <span>Current gradient</span>
          <strong>{fmt(derivative(s.x))}</strong>
        </div>
        <div>
          <span>Current loss</span>
          <strong data-testid="loss">{fmt(s.loss)}</strong>
        </div>
      </div>
      <div className="lab-update">
        <span className="lesson-kicker">
          {s.cursor === 0
            ? "THE UPDATE RULE"
            : s.phase === "gradient"
              ? "UP NEXT · APPLY THE GRADIENT"
              : "LATEST UPDATE · FOLLOW THE NUMBERS"}
        </span>
        <MathFormula
          latex={
            s.cursor === 0
              ? "x_{t+1}=x_t-\\eta f'(x_t)"
              : `x_{${s.phase === "gradient" ? s.iteration + 1 : s.iteration}}=\\textcolor{#277bb6}{${fmt(s.fromX)}}-\\textcolor{#a77817}{${fmt(sim.eta)}}\\times(${fmt(s.gradient)})=${fmt(s.nextX)}`
          }
          display
        />
      </div>
      <div className="lab-settings">
        <ParameterSlider
          label="Learning rate η"
          value={sim.eta}
          min={0.01}
          max={1.2}
          step={0.01}
          onChange={sim.setEta}
        />
        <ParameterSlider
          label="Starting position"
          value={sim.startX}
          min={-1}
          max={5.5}
          step={0.1}
          onChange={sim.setStartX}
        />
      </div>
      <p className="lesson-caption">
        Changing a parameter starts a fresh trajectory. The gold point previews
        the next update; the gold line shows the local slope.
      </p>
      <div className="lab-actions">
        <button
          className="lesson-btn primary"
          onClick={sim.step}
          disabled={s.stopped}
        >
          Step one iteration <ArrowRight size={17} />
        </button>
        <button
          className="lesson-btn"
          onClick={sim.togglePlay}
          disabled={s.stopped}
        >
          {sim.playing ? "Pause" : "Play"}
        </button>
        <button className="lesson-btn subtle" onClick={sim.reset}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      <div className={`lab-hint ${sim.eta >= 1 ? "warning" : ""}`}>
        <Lightbulb size={21} />
        <div>
          <strong>A nudge from your stork</strong>
          <p>{hint}</p>
        </div>
      </div>
      <button
        className="lesson-btn lab-complete"
        onClick={onComplete}
        disabled={completed || s.iteration < 2}
      >
        {completed
          ? "Experiment completed ✓"
          : "I’ve explored at least two updates"}
      </button>
    </div>
  );
}
export function GradientDescentAlgorithm({
  onComplete,
  completed,
}: {
  onComplete: () => void;
  completed: boolean;
}) {
  const sim = useGradientDescent(),
    { state: s } = sim;
  const titles = {
    initialize: "Choose a starting point",
    gradient: "Measure the local slope",
    update: "Move against the gradient",
    loss: "Evaluate the new loss",
  };
  const formulas = {
    initialize: `x_0=${fmt(sim.startX)},\\quad f(x_0)=${fmt(objective(sim.startX))}`,
    gradient: `g=2(${fmt(s.fromX)}-2)=${fmt(s.gradient)}`,
    update: `x_{${s.iteration}}=${fmt(s.fromX)}-${fmt(sim.eta)}\\times(${fmt(s.gradient)})=${fmt(s.nextX)}`,
    loss: `f(${fmt(s.x)})=(${fmt(s.x)}-2)^2+1=${fmt(s.loss)}`,
  };
  const explanations = {
    initialize:
      "Our initial guess sets the first point on the curve. Next, calculate the derivative here.",
    gradient: `The gradient is ${fmt(s.gradient)}. ${s.gradient > 0 ? "Subtracting a positive step moves left." : s.gradient < 0 ? "Subtracting a negative step moves right." : "A zero gradient gives no movement."}`,
    update: `Multiply the gradient by η = ${fmt(sim.eta)}, then subtract it from the old position. The blue point now shows x = ${fmt(s.x)}.`,
    loss: `Evaluate the same objective at the new position. ${s.loss < objective(s.fromX) ? "The loss decreased." : s.loss > objective(s.fromX) ? "The loss increased: this step overshot." : "The loss is unchanged."} This completes iteration ${s.iteration}.`,
  };
  return (
    <>
      <AlgorithmVisualizer
        step={{
          title: titles[s.phase],
          activeLine: { initialize: 0, gradient: 2, update: 3, loss: 4 }[
            s.phase
          ],
          explanation: (
            <>
              <MathFormula latex={formulas[s.phase]} display />
              <p>{explanations[s.phase]}</p>
            </>
          ),
        }}
        lines={lines}
      >
        <AnimationControls
          playing={sim.playing}
          disabled={s.stopped}
          atStart={s.cursor === 0}
          onPlay={sim.togglePlay}
          onPrevious={sim.previous}
          onNext={sim.next}
          onReset={sim.reset}
        />
        {s.reason && (
          <p className="lab-warning" role="status">
            {s.reason}
          </p>
        )}
      </AlgorithmVisualizer>
      <button
        className="lesson-btn lab-complete"
        disabled={completed || s.iteration < 2}
        onClick={onComplete}
      >
        {completed ? "Algorithm explored ✓" : "I can explain these updates"}
      </button>
    </>
  );
}
