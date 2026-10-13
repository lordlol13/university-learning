"use client";

import { useProgress } from "@/stores/progress-provider";
import { getLessonStatus } from "@/stores/progress-store";
import { LessonNode } from "./LessonNode";
import type { Lesson } from "@/types/curriculum";

/** Accessible DOM curriculum. The next phase may share these lesson props with 3D nodes. */
export function LearningPath({ lessons }: { lessons: Lesson[] }) {
  const completedLessons = useProgress((s) => s.completedLessons);
  const unlockedLessons = useProgress((s) => s.unlockedLessons);
  const lessonState = { completedLessons, unlockedLessons };
  return (
    <ol className="learning-path" aria-label="Lessons in curriculum order">
      {lessons.map((lesson, index) => (
        <LessonNode
          key={lesson.id}
          lesson={lesson}
          index={index}
          status={getLessonStatus(lesson, lessonState)}
        />
      ))}
    </ol>
  );
}
