export type AlgorithmPhase = "initialize" | "gradient" | "update" | "loss";
export interface AlgorithmState {
  cursor: number;
  iteration: number;
  phase: AlgorithmPhase;
  x: number;
  fromX: number;
  gradient: number;
  nextX: number;
  loss: number;
  trajectory: Array<{ x: number; y: number }>;
  stopped: boolean;
  reason: string | null;
}
export const objective = (x: number) => (x - 2) ** 2 + 1;
export const derivative = (x: number) => 2 * (x - 2);
export const MAX_ITERATIONS = 80;
export function algorithmState(
  initialX: number,
  eta: number,
  requestedCursor: number,
): AlgorithmState {
  if (
    !Number.isFinite(initialX) ||
    !Number.isFinite(eta) ||
    eta <= 0 ||
    !Number.isFinite(requestedCursor)
  )
    throw new Error("Invalid simulation parameters");
  const requested = Math.min(
    MAX_ITERATIONS * 3,
    Math.max(0, Math.floor(requestedCursor)),
  );
  let x = initialX,
    fromX = x,
    cursor = 0,
    iteration = 0;
  let phase: AlgorithmPhase = "initialize";
  const trajectory = [{ x, y: objective(x) }];
  let reason: string | null = null;
  for (let c = 1; c <= requested; c++) {
    if ((c - 1) % 3 === 0) {
      if (Math.abs(derivative(x)) < 1e-6) {
        reason = "Converged: the gradient is below 0.000001.";
        break;
      }
      if (Math.abs(x) > 100 || objective(x) > 10000) {
        reason =
          "Divergence guard: the loss is too large. Lower the learning rate and reset.";
        break;
      }
      fromX = x;
    }
    phase = c % 3 === 1 ? "gradient" : c % 3 === 2 ? "update" : "loss";
    if (phase === "update") {
      x = fromX - eta * derivative(fromX);
      iteration++;
      trajectory.push({ x, y: objective(x) });
    }
    cursor = c;
  }
  if (phase === "loss" || phase === "initialize") {
    if (Math.abs(derivative(x)) < 1e-6)
      reason = "Converged: the gradient is below 0.000001.";
    else if (Math.abs(x) > 100 || objective(x) > 10000)
      reason =
        "Divergence guard: the loss is too large. Lower the learning rate and reset.";
  }
  if (cursor >= MAX_ITERATIONS * 3)
    reason =
      "Reached 80 iterations. Compare the loss, then try a different learning rate.";
  return {
    cursor,
    iteration,
    phase,
    x,
    fromX,
    gradient: derivative(fromX),
    nextX: fromX - eta * derivative(fromX),
    loss: objective(x),
    trajectory,
    stopped: reason !== null,
    reason,
  };
}
export function nextIterationCursor(cursor: number) {
  return (Math.floor(cursor / 3) + 1) * 3;
}
export function formatNumber(n: number) {
  return Math.abs(n) >= 10000
    ? n.toExponential(2)
    : Number(n.toFixed(4)).toString();
}
