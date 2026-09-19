import { notFound } from "next/navigation";
import { allLessons, getLesson, getLessonDirection } from "@/data/curriculum";
import { LessonView } from "@/components/lesson/LessonView";
import { getLessonContent, lessonContents } from "@/data/lessons";

export const dynamicParams = false;

export function generateStaticParams() {
  const ids = new Set([
    ...allLessons.map((lesson) => lesson.id),
    ...lessonContents.map((lesson) => lesson.id),
  ]);
  return [...ids].map((lessonId) => ({ lessonId }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return {
    title:
      getLessonContent(lessonId)?.title ??
      getLesson(lessonId)?.title ??
      "Lesson not found",
  };
}
export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const curriculumId =
    getLessonContent(lessonId)?.curriculumLessonId ?? lessonId;
  const lesson = getLesson(curriculumId);
  const direction = getLessonDirection(curriculumId);
  if (!lesson || !direction) notFound();
  return (
    <LessonView key={lesson.id} lesson={lesson} directionId={direction.id} />
  );
}
