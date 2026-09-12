"use client";

import { useProgress } from "@/stores/progress-provider";
import { getLessonStatus } from "@/stores/progress-store";
import { LessonNode } from "./LessonNode";
import type { Lesson } from "@/types/curriculum";

/** Accessible DOM curriculum. The next phase may share these lesson props with 3D nodes. */
export function LearningPath({ lessons }: { lessons: Lesson[] }) {
  const state = useProgress((s) => s);
  return (
    <ol className="learning-path" aria-label="Lessons in curriculum order">
      {lessons.map((lesson, index) => (
        <LessonNode
          key={lesson.id}
          lesson={lesson}
          index={index}
          status={getLessonStatus(lesson, state)}
        />
      ))}
    </ol>
  );
}
