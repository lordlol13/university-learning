import React from "react";
import { VectorComponentsDemo } from "./VectorComponentsDemo";
import { VectorDotProductDemo } from "./VectorDotProductDemo";
import { VectorCrossProductDemo } from "./VectorCrossProductDemo";
import { DerivativeTangentDemo } from "./DerivativeTangentDemo";
import { RiemannSumIntegralDemo } from "./RiemannSumIntegralDemo";
import { LinearSystemsDemo } from "./LinearSystemsDemo";
import { DiscreteLogicDemo } from "./DiscreteLogicDemo";
import { LinearAlgebraTransformDemo } from "./LinearAlgebraTransformDemo";
import { StatisticsOutlierDemo } from "./StatisticsOutlierDemo";
import { GradientDescentLossDemo } from "./GradientDescentLossDemo";
import { DeepLearningPerceptronDemo } from "./DeepLearningPerceptronDemo";
import { PythonListIndexingDemo } from "./PythonListIndexingDemo";
import { DatabaseRelationalJoinDemo } from "./DatabaseRelationalJoinDemo";
import { SIBaseUnitsDemo } from "./SIBaseUnitsDemo";
import { DimensionalScalingDemo } from "./DimensionalScalingDemo";
import { WaterEquivalencyDemo } from "./WaterEquivalencyDemo";
import { ForceEquilibriumDemo } from "./ForceEquilibriumDemo";

export interface DemoComponentProps {
  completed?: boolean;
  onComplete?: () => void;
  title?: string;
  caption?: string;
}

export const DEMO_REGISTRY: Record<
  string,
  React.ComponentType<DemoComponentProps>
> = {
  // Vector series
  "vector-components": VectorComponentsDemo,
  "vector-dot-product": VectorDotProductDemo,
  "vector-cross-product": VectorCrossProductDemo,

  // Calculus series
  "calc-derivatives": DerivativeTangentDemo,
  "derivative-tangent": DerivativeTangentDemo,
  "calc-integrals": RiemannSumIntegralDemo,
  "riemann-sum": RiemannSumIntegralDemo,

  // Linear algebra & systems
  "linear-systems": LinearSystemsDemo,
  "linear-algebra": LinearAlgebraTransformDemo,
  "linear-algebra-transform": LinearAlgebraTransformDemo,

  // Logic & CS
  "discrete-logic": DiscreteLogicDemo,
  "python-basics": PythonListIndexingDemo,
  "python-list-indexing": PythonListIndexingDemo,
  databases: DatabaseRelationalJoinDemo,
  "database-join": DatabaseRelationalJoinDemo,

  // Statistics & AI/ML
  statistics: StatisticsOutlierDemo,
  "statistics-outlier": StatisticsOutlierDemo,
  "gradient-descent": GradientDescentLossDemo,
  "gradient-descent-loss": GradientDescentLossDemo,
  "deep-learning": DeepLearningPerceptronDemo,
  "deep-learning-perceptron": DeepLearningPerceptronDemo,

  // Physics & Measurement
  "si-base-units": SIBaseUnitsDemo,
  "dimensional-scaling": DimensionalScalingDemo,
  "water-equivalency": WaterEquivalencyDemo,
  "physics-tactical-exam": ForceEquilibriumDemo,
  "force-equilibrium": ForceEquilibriumDemo,
};

export function getDemoComponent(
  demoId: string,
): React.ComponentType<DemoComponentProps> | undefined {
  return DEMO_REGISTRY[demoId];
}

export {
  VectorComponentsDemo,
  VectorDotProductDemo,
  VectorCrossProductDemo,
  DerivativeTangentDemo,
  RiemannSumIntegralDemo,
  LinearSystemsDemo,
  DiscreteLogicDemo,
  LinearAlgebraTransformDemo,
  StatisticsOutlierDemo,
  GradientDescentLossDemo,
  DeepLearningPerceptronDemo,
  PythonListIndexingDemo,
  DatabaseRelationalJoinDemo,
  SIBaseUnitsDemo,
  DimensionalScalingDemo,
  WaterEquivalencyDemo,
  ForceEquilibriumDemo,
};
