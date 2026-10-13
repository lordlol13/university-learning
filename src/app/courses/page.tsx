import type { Metadata } from "next";
import { CoursesView } from "@/components/courses/CoursesView";

export const metadata: Metadata = { title: "All courses" };

export default function CoursesPage() {
  return <CoursesView />;
}
