import type { Achievement } from "../types/curriculum";

export const learner = {
  name: "Alex Morgan",
  firstName: "Alex",
  initials: "AM",
  year: "First-year student",
  joined: "September 2026",
};
export const achievementCatalog: Achievement[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Complete your first lesson.",
    icon: "sprout",
    color: "green",
  },
  {
    id: "seven-day-streak",
    title: "7 Day Streak",
    description: "Learn for seven days in a row.",
    icon: "flame",
    color: "purple",
  },
  {
    id: "three-lessons",
    title: "3 Lessons Complete",
    description: "Build momentum with three completed lessons.",
    icon: "book",
    color: "blue",
  },
  {
    id: "ai-explorer",
    title: "AI Explorer",
    description: "Complete every lesson in AI & Machine Learning.",
    icon: "compass",
    color: "gold",
  },
];
export const levelSize = 250;
export const initialProgress = {
  currentDirectionId: "ai-ml",
  currentLessonId: "machine-learning" as string | null,
  completedLessons: ["python-basics", "linear-algebra", "statistics"],
  unlockedLessons: [
    "python-basics",
    "linear-algebra",
    "statistics",
    "machine-learning",
    "si-base-units",
  ],
  xp: 357,
  level: 2,
  streak: 7,
  achievements: ["getting-started", "seven-day-streak", "three-lessons"],
};
export const leaderboard = [
  { name: "Sofia Chen", initials: "SC", xp: 640 },
  { name: "Daniel Kim", initials: "DK", xp: 525 },
  { name: "Maya Patel", initials: "MP", xp: 410 },
  { name: "Leo Martin", initials: "LM", xp: 290 },
];
