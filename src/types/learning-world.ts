export type Point3 = [number, number, number];

export type TreeVariant =
  | "round"
  | "tall"
  | "pine"
  | "cherry"
  | "cypress"
  | "birch";

export interface LearningWorldData {
  directionId: string;
  controlPoints: Point3[];
  roadWidth: number;
  roadDepth: number;
  lessons: { lessonId: string; t: number }[];
  trees: { position: Point3; scale: number; variant: TreeVariant }[];
  buildings: {
    position: Point3;
    scale: number;
    rotation: number;
    variant?: "main" | "annex" | "observatory" | "villa";
  }[];
}
