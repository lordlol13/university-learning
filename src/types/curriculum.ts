export type LessonStatus = "completed" | "current" | "locked";
export type CurriculumIcon =
  | "code"
  | "matrix"
  | "chart"
  | "brain"
  | "database"
  | "network"
  | "chip"
  | "math"
  | "atom"
  | "compass"
  | "languages";

export interface Lesson {
  id: string;
  title: string;
  description: string;
  xp: number;
  status: LessonStatus;
  icon: CurriculumIcon;
  prerequisites: string[];
  durationMinutes: number;
  content: {
    introduction: string;
    takeaways: string[];
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}

export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}
export interface Subject {
  id: string;
  title: string;
  units: Unit[];
}
export interface Direction {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: CurriculumIcon;
  subjects: Subject[];
}
export interface UniversityProgram {
  id: string;
  universityId: string;
  title: string;
  qualification: string;
  directions: Direction[];
}
export interface University {
  id: string;
  name: string;
  shortName: string;
  programs: UniversityProgram[];
}
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "sprout" | "flame" | "book" | "compass";
  color: string;
}
