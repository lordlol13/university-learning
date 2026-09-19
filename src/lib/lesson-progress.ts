import type { LessonActivity, LessonContent } from "../types/lesson-engine";

export const emptyActivity = (): LessonActivity => ({
  viewed: [],
  completed: [],
  practice: [],
  quiz: [],
});
export function lessonRequirements(lesson: LessonContent) {
  return {
    completed: lesson.sections.flatMap((s) => s.blocks.map((b) => b.id)),
    practice: lesson.practiceProblems.map((p) => p.id),
    quiz: lesson.quiz.map((q) => q.id),
  };
}
export function lessonCompletion(
  lesson: LessonContent,
  activity: LessonActivity,
) {
  const requirements = lessonRequirements(lesson);
  let total = 0,
    done = 0;
  for (const key of ["completed", "practice", "quiz"] as const) {
    total += requirements[key].length;
    done += requirements[key].filter((id) => activity[key].includes(id)).length;
  }
  return {
    done,
    total,
    percent: Math.round((done / total) * 100),
    complete: done === total,
  };
}
