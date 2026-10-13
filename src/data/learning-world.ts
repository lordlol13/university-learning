import type { LearningWorldData } from "../types/learning-world";

export const aiLearningWorld: LearningWorldData = {
  directionId: "ai-ml",
  controlPoints: [
    [-2.2, 1.1, -7.6],
    [-1.8, 1.23, -5.8],
    [1.55, 1.15, -3.7],
    [0.9, 1.02, -1.2],
    [-1.5, 0.88, 1.2],
    [-0.6, 0.76, 3.5],
    [2.15, 0.67, 5.6],
    [1.55, 0.65, 7.9],
  ],
  roadWidth: 2.8,
  roadDepth: 0.46,
  lessons: [
    { lessonId: "python-basics", t: 0.03 },
    { lessonId: "linear-algebra", t: 0.25 },
    { lessonId: "statistics", t: 0.41 },
    { lessonId: "machine-learning", t: 0.59 },
    { lessonId: "databases", t: 0.76 },
    { lessonId: "deep-learning", t: 0.93 },
  ],
  trees: [
    { position: [3.8, 0.3, -6.8], scale: 1.0, variant: "birch" },
    { position: [-3.8, 0.3, -4.9], scale: 0.95, variant: "round" },
    { position: [4.9, 0.3, -2.4], scale: 0.95, variant: "cherry" },
    { position: [-4.9, 0.3, -1.0], scale: 0.9, variant: "birch" },
    { position: [4.5, 0.3, 0.3], scale: 0.95, variant: "round" },
    { position: [4.5, 0.3, 2.2], scale: 0.9, variant: "cherry" },
    { position: [-5.1, 0.3, 3.6], scale: 0.85, variant: "round" },
    { position: [-5.2, 0.3, 6.8], scale: 0.85, variant: "birch" },
    { position: [-3.4, 0.3, 7.0], scale: 0.9, variant: "round" },
    { position: [4.3, 0.3, 6.0], scale: 0.85, variant: "birch" },
    { position: [-1.8, 0.3, 8.6], scale: 0.8, variant: "cherry" },
    { position: [-0.6, 0.3, 9.4], scale: 0.75, variant: "round" },
  ],
  buildings: [
    { position: [1.2, 0.33, -8.7], scale: 0.82, rotation: 0.22, variant: "main" },
    { position: [-5.0, 0.33, 1.8], scale: 0.62, rotation: -0.75, variant: "annex" },
  ],
};

export const physicsLearningWorld: LearningWorldData = {
  directionId: "physics-engineering",
  controlPoints: [
    [-2.2, 1.1, -7.6],
    [-1.8, 1.23, -5.8],
    [1.55, 1.15, -3.7],
    [0.9, 1.02, -1.2],
    [-1.5, 0.88, 1.2],
    [-0.6, 0.76, 3.5],
    [2.15, 0.67, 5.6],
    [1.55, 0.65, 7.9],
  ],
  roadWidth: 2.8,
  roadDepth: 0.46,
  lessons: [
    { lessonId: "si-base-units", t: 0.04 },
    { lessonId: "dimensional-scaling", t: 0.19 },
    { lessonId: "water-equivalency", t: 0.34 },
    { lessonId: "vector-components", t: 0.5 },
    { lessonId: "vector-dot-product", t: 0.65 },
    { lessonId: "vector-cross-product", t: 0.8 },
    { lessonId: "physics-tactical-exam", t: 0.94 },
  ],
  trees: [
    { position: [3.5, 0.3, -7.0], scale: 1.0, variant: "pine" },
    { position: [-3.8, 0.3, -4.9], scale: 0.95, variant: "pine" },
    { position: [4.9, 0.3, -2.4], scale: 0.95, variant: "pine" },
    { position: [-4.9, 0.3, -1.0], scale: 0.85, variant: "birch" },
    { position: [4.5, 0.3, 0.3], scale: 0.95, variant: "pine" },
    { position: [4.5, 0.3, 2.2], scale: 0.85, variant: "birch" },
    { position: [-5.1, 0.3, 3.6], scale: 0.9, variant: "pine" },
    { position: [-3.4, 0.3, 7.0], scale: 0.9, variant: "tall" },
    { position: [4.3, 0.3, 6.0], scale: 0.8, variant: "pine" },
    { position: [-1.8, 0.3, 8.6], scale: 0.75, variant: "birch" },
    { position: [-0.6, 0.3, 9.4], scale: 0.75, variant: "pine" },
    { position: [-5.2, 0.3, 6.8], scale: 0.85, variant: "pine" },
  ],
  buildings: [
    { position: [1.2, 0.33, -8.7], scale: 0.82, rotation: 0.22, variant: "observatory" },
    { position: [-5.0, 0.33, 1.8], scale: 0.62, rotation: -0.75, variant: "annex" },
  ],
};

export const mathLearningWorld: LearningWorldData = {
  directionId: "mathematics",
  controlPoints: [
    [-2.2, 1.1, -7.6],
    [-1.8, 1.23, -5.8],
    [1.55, 1.15, -3.7],
    [0.9, 1.02, -1.2],
    [-1.5, 0.88, 1.2],
    [-0.6, 0.76, 3.5],
    [2.15, 0.67, 5.6],
    [1.55, 0.65, 7.9],
  ],
  roadWidth: 2.8,
  roadDepth: 0.46,
  lessons: [
    { lessonId: "calc-derivatives", t: 0.08 },
    { lessonId: "calc-integrals", t: 0.35 },
    { lessonId: "discrete-logic", t: 0.62 },
    { lessonId: "linear-systems", t: 0.89 },
  ],
  trees: [
    { position: [3.8, 0.3, -6.8], scale: 1.0, variant: "tall" },
    { position: [-3.8, 0.3, -4.9], scale: 0.95, variant: "pine" },
    { position: [4.9, 0.3, -2.4], scale: 0.95, variant: "tall" },
    { position: [-4.9, 0.3, -1.0], scale: 0.9, variant: "birch" },
    { position: [4.5, 0.3, 0.3], scale: 0.95, variant: "round" },
    { position: [4.5, 0.3, 2.2], scale: 0.85, variant: "tall" },
    { position: [-5.1, 0.3, 3.6], scale: 0.95, variant: "pine" },
    { position: [-5.2, 0.3, 6.8], scale: 0.85, variant: "birch" },
    { position: [-3.4, 0.3, 7.0], scale: 0.95, variant: "tall" },
    { position: [4.3, 0.3, 6.0], scale: 0.85, variant: "pine" },
    { position: [-1.8, 0.3, 8.6], scale: 0.8, variant: "round" },
    { position: [-0.6, 0.3, 9.4], scale: 0.75, variant: "tall" },
  ],
  buildings: [
    { position: [1.2, 0.33, -8.7], scale: 0.82, rotation: 0.22, variant: "main" },
    { position: [-5.0, 0.33, 1.8], scale: 0.62, rotation: -0.75, variant: "annex" },
  ],
};

export const italianLearningWorld: LearningWorldData = {
  directionId: "italian-language",
  controlPoints: [
    [-2.2, 1.1, -7.6],
    [-1.8, 1.23, -5.8],
    [1.55, 1.15, -3.7],
    [0.9, 1.02, -1.2],
    [-1.5, 0.88, 1.2],
    [-0.6, 0.76, 3.5],
    [2.15, 0.67, 5.6],
    [1.55, 0.65, 7.9],
  ],
  roadWidth: 2.8,
  roadDepth: 0.46,
  lessons: [
    { lessonId: "italian-greetings", t: 0.12 },
    { lessonId: "italian-numbers-time", t: 0.5 },
    { lessonId: "italian-engineering-terms", t: 0.88 },
  ],
  trees: [
    { position: [3.5, 0.3, -7.0], scale: 1.15, variant: "cypress" },
    { position: [-3.8, 0.3, -4.9], scale: 1.15, variant: "cypress" },
    { position: [4.9, 0.3, -2.4], scale: 0.95, variant: "cherry" },
    { position: [-4.7, 0.3, -0.7], scale: 1.1, variant: "cypress" },
    { position: [4.5, 0.3, 0.3], scale: 0.95, variant: "round" },
    { position: [4.5, 0.3, 2.2], scale: 1.1, variant: "cypress" },
    { position: [-5.1, 0.3, 3.6], scale: 0.85, variant: "cherry" },
    { position: [-5.0, 0.3, 7.1], scale: 1.1, variant: "cypress" },
    { position: [-3.4, 0.3, 7.0], scale: 1.05, variant: "cypress" },
    { position: [4.45, 0.3, 6.0], scale: 0.9, variant: "round" },
    { position: [-1.8, 0.3, 8.6], scale: 0.85, variant: "cherry" },
    { position: [-0.6, 0.3, 9.4], scale: 1.05, variant: "cypress" },
  ],
  buildings: [
    { position: [1.2, 0.33, -8.7], scale: 0.82, rotation: 0.22, variant: "villa" },
    { position: [-5.0, 0.33, 1.8], scale: 0.62, rotation: -0.75, variant: "annex" },
  ],
};

export const learningWorlds: LearningWorldData[] = [
  aiLearningWorld,
  physicsLearningWorld,
  mathLearningWorld,
  italianLearningWorld,
];

export const getLearningWorld = (directionId: string) =>
  learningWorlds.find((world) => world.directionId === directionId);
