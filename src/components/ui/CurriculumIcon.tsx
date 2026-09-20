import {
  Atom,
  Binary,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  CodeXml,
  Compass,
  Cpu,
  Database,
  Languages,
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
  atom: Atom,
  compass: Compass,
  languages: Languages,
};
export function CurriculumIcon({
  name,
  size = 22,
}: {
  name: IconName;
  size?: number;
}) {
  const Icon = icons[name] ?? Compass;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
