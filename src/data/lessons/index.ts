import type { LessonContent } from "../../types/lesson-engine";
import { pythonBasicsLesson } from "./python-basics";
import { linearAlgebraLesson } from "./linear-algebra";
import { statisticsLesson } from "./statistics";
import { gradientDescentLesson } from "./gradient-descent";
import { databasesLesson } from "./databases";
import { deepLearningLesson } from "./deep-learning";
import { siBaseUnitsLesson } from "./si-base-units";
import { dimensionalScalingLesson } from "./dimensional-scaling";
import { waterEquivalencyLesson } from "./water-equivalency";
import { vectorComponentsLesson } from "./vector-components";
import { vectorDotProductLesson } from "./vector-dot-product";
import { vectorCrossProductLesson } from "./vector-cross-product";
import { physicsTacticalExam } from "./physics-tactical-exam";

/** Add authored lessons here; route generation and the shared lesson view use this registry. */
export const lessonContents: LessonContent[] = [
  pythonBasicsLesson,
  linearAlgebraLesson,
  statisticsLesson,
  gradientDescentLesson,
  databasesLesson,
  deepLearningLesson,
  siBaseUnitsLesson,
  dimensionalScalingLesson,
  waterEquivalencyLesson,
  vectorComponentsLesson,
  vectorDotProductLesson,
  vectorCrossProductLesson,
  physicsTacticalExam,
];

export function getLessonContent(id: string) {
  return lessonContents.find(
    (lesson) => lesson.id === id || lesson.curriculumLessonId === id,
  );
}
