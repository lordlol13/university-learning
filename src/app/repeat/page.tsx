import type { Metadata } from "next";
import { RepeatTasksView } from "@/components/repeat/RepeatTasksView";

export const metadata: Metadata = {
  title: "Repeat & Review Tasks | Uplift University",
  description: "Reinforce learning by repeating tasks and quizzes from previous themes.",
};

export default function RepeatPage() {
  return (
    <div className="standard-page repeat-page">
      <RepeatTasksView />
    </div>
  );
}
