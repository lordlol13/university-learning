"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Flame, Sparkles, Star } from "lucide-react";
import { learner } from "@/data/demo";
import { allLessons, getLesson } from "@/data/curriculum";
import { useProgress } from "@/stores/progress-provider";
import { getLessonStatus } from "@/stores/progress-store";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";

export function DashboardView() {
  const state = useProgress((s) => s);
  const selected = state.currentLessonId
    ? getLesson(state.currentLessonId)
    : undefined;
  const current =
    selected && getLessonStatus(selected, state) === "current"
      ? selected
      : allLessons.find(
          (lesson) => getLessonStatus(lesson, state) === "current",
        );
  return (
    <div className="standard-page">
      <div className="page-heading">
        <span className="eyebrow">A GOOD DAY TO GROW</span>
        <h1>
          Welcome back, {learner.firstName}
          <span className="green-text">.</span>
        </h1>
        <p>Your next breakthrough starts with one small step.</p>
      </div>
      <div className="dashboard-stats">
        {[
          {
            icon: BookOpen,
            value: state.completedLessons.length,
            label: "lessons completed",
          },
          { icon: Flame, value: state.streak, label: "day streak" },
          { icon: Star, value: state.xp, label: "XP earned" },
        ].map(({ icon: Icon, value, label }) => (
          <div className="panel-card" key={label}>
            <Icon size={23} />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="section-heading">
        <h2>Pick up where you left off</h2>
        <Link href="/courses">
          All courses
          <ArrowRight size={15} />
        </Link>
      </div>
      <section className="continue-card">
        <span className="eyebrow">AI & MACHINE LEARNING</span>
        <span className="continue-icon">
          <CurriculumIcon name={current ? current.icon : "brain"} size={51} />
        </span>
        <h2>{current ? current.title : "Foundations, completed."}</h2>
        <p>
          {current
            ? current.description
            : "You’ve finished your first learning path. Take a moment to celebrate your progress."}
        </p>
        <Link
          href={current ? `/lesson/${current.id}` : "/achievements"}
          className="button primary"
          onClick={() => {
            if (current) state.startLesson(current.id);
          }}
        >
          {current ? "Continue learning" : "See your achievements"}
          <ArrowRight size={17} />
        </Link>
      </section>
      <div className="daily-note">
        <Sparkles size={24} />
        <div>
          <h2>Consistency is your superpower.</h2>
          <p>
            A few focused minutes can make a real difference. You’ve got this.
          </p>
        </div>
      </div>
      <div className="section-heading">
        <h2>Your recent lessons</h2>
        <Link href="/path/ai-ml">
          View path
          <ArrowRight size={15} />
        </Link>
      </div>
      <div className="recent-lessons">
        {allLessons
          .filter((l) => state.completedLessons.includes(l.id))
          .slice(-3)
          .reverse()
          .map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              onClick={() => state.startLesson(lesson.id)}
            >
              <span className="recent-icon">
                <CurriculumIcon name={lesson.icon} />
              </span>
              <div>
                <strong>{lesson.title}</strong>
                <small>Completed · Ready to review</small>
              </div>
              <ArrowRight size={17} />
            </Link>
          ))}
      </div>
    </div>
  );
}
