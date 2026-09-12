export function ProgressBar({
  value,
  label,
  color = "green",
}: {
  value: number;
  label: string;
  color?: "green" | "gold";
}) {
  return (
    <div
      className={`progress-track ${color}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
