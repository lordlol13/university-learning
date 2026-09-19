export type Point3 = [number, number, number];
export interface LearningWorldData {
  directionId: string;
  controlPoints: Point3[];
  roadWidth: number;
  roadDepth: number;
  lessons: { lessonId: string; t: number }[];
  trees: { position: Point3; scale: number; variant: "round" | "tall" }[];
  buildings: { position: Point3; scale: number; rotation: number }[];
}
