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
    { position: [-4.2, 0.3, -6.8], scale: 1.1, variant: "round" },
    { position: [3.9, 0.3, -6.5], scale: 1.1, variant: "tall" },
    { position: [-4.5, 0.3, -2.9], scale: 0.85, variant: "tall" },
    { position: [4.6, 0.3, -1.1], scale: 1, variant: "round" },
    { position: [-5.25, 0.3, 1.9], scale: 0.95, variant: "round" },
    { position: [3.65, 0.3, 2.4], scale: 0.75, variant: "tall" },
    { position: [-3.4, 0.3, 6.1], scale: 0.9, variant: "round" },
    { position: [4.8, 0.3, 6.4], scale: 0.7, variant: "round" },
    { position: [-1.8, 0.3, 8.2], scale: 0.65, variant: "tall" },
  ],
  buildings: [
    { position: [1.9, 0.33, -8.7], scale: 0.83, rotation: -0.13 },
    { position: [-4.3, 0.33, -0.6], scale: 0.57, rotation: 0.25 },
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
    { position: [-4.2, 0.3, -6.8], scale: 1.05, variant: "round" },
    { position: [3.9, 0.3, -6.5], scale: 1.1, variant: "tall" },
    { position: [-4.5, 0.3, -2.9], scale: 0.85, variant: "tall" },
    { position: [4.6, 0.3, -1.1], scale: 0.95, variant: "round" },
    { position: [-5.25, 0.3, 1.9], scale: 0.95, variant: "round" },
    { position: [3.65, 0.3, 2.4], scale: 0.75, variant: "tall" },
    { position: [-3.4, 0.3, 6.1], scale: 0.9, variant: "round" },
    { position: [4.8, 0.3, 6.4], scale: 0.7, variant: "round" },
    { position: [-1.8, 0.3, 8.2], scale: 0.65, variant: "tall" },
  ],
  buildings: [
    { position: [1.9, 0.33, -8.7], scale: 0.83, rotation: -0.13 },
    { position: [-4.3, 0.33, -0.6], scale: 0.57, rotation: 0.25 },
  ],
};

export const learningWorlds: LearningWorldData[] = [
  aiLearningWorld,
  physicsLearningWorld,
];
export const getLearningWorld = (directionId: string) =>
  learningWorlds.find((world) => world.directionId === directionId);
