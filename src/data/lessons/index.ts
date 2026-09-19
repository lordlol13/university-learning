import type { LessonContent } from "../../types/lesson-engine";
import { pythonBasicsLesson } from "./python-basics";
import { linearAlgebraLesson } from "./linear-algebra";
import { statisticsLesson } from "./statistics";
import { gradientDescentLesson } from "./gradient-descent";
import { databasesLesson } from "./databases";
import { deepLearningLesson } from "./deep-learning";

/** Add authored lessons here; route generation and the shared lesson view use this registry. */
export const lessonContents: LessonContent[] = [
  pythonBasicsLesson,
  linearAlgebraLesson,
  statisticsLesson,
  gradientDescentLesson,
  databasesLesson,
  deepLearningLesson,
];

export function getLessonContent(id: string) {
  return lessonContents.find(
    (lesson) => lesson.id === id || lesson.curriculumLessonId === id,
  );
}
