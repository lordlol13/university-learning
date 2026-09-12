import {
  Binary,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  CodeXml,
  Cpu,
  Database,
  Network,
  Sigma,
} from "lucide-react";
import type { CurriculumIcon as IconName } from "@/types/curriculum";

const icons = {
  code: CodeXml,
  matrix: Binary,
  chart: ChartNoAxesColumnIncreasing,
  brain: BrainCircuit,
  database: Database,
  network: Network,
  chip: Cpu,
  math: Sigma,
};
export function CurriculumIcon({
  name,
  size = 22,
}: {
  name: IconName;
  size?: number;
}) {
  const Icon = icons[name];
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
