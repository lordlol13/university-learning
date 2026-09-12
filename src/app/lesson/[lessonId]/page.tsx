import { notFound } from "next/navigation";
import { allLessons, getLesson, getLessonDirection } from "@/data/curriculum";
import { LessonView } from "@/components/lesson/LessonView";

export const dynamicParams = false;

export function generateStaticParams() {
  return allLessons.map((lesson) => ({ lessonId: lesson.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return { title: getLesson(lessonId)?.title ?? "Lesson not found" };
}
export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  const direction = getLessonDirection(lessonId);
  if (!lesson || !direction) notFound();
  return (
    <LessonView key={lesson.id} lesson={lesson} directionId={direction.id} />
  );
}
