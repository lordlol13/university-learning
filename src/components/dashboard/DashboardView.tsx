"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Compass,
  Flame,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { learner } from "@/data/demo";
import {
  allLessons,
  directions,
  getDirectionLessons,
  getLesson,
  getLessonDirection,
  university,
} from "@/data/curriculum";
import { useProgress } from "@/stores/progress-provider";
import {
  getDirectionProgress,
  getLessonStatus,
} from "@/stores/progress-store";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";

const SUBJECT_THEME_MAP: Record<string, string> = {
  "ai-ml": "subject-ai",
  "physics-engineering": "subject-physics",
  mathematics: "subject-math",
  "italian-language": "subject-italian",
  "italian-culture": "subject-italian",
};

export function DashboardView() {
  const currentDirectionId = useProgress((s) => s.currentDirectionId);
  const currentLessonId = useProgress((s) => s.currentLessonId);
  const completedLessons = useProgress((s) => s.completedLessons);
  const unlockedLessons = useProgress((s) => s.unlockedLessons);
  const streak = useProgress((s) => s.streak);
  const xp = useProgress((s) => s.xp);
  const level = useProgress((s) => s.level);
  const startLesson = useProgress((s) => s.startLesson);

  const lessonState = { completedLessons, unlockedLessons };
  const selected = currentLessonId ? getLesson(currentLessonId) : undefined;
  const current =
    selected && getLessonStatus(selected, lessonState) === "current"
      ? selected
      : allLessons.find(
          (lesson) => getLessonStatus(lesson, lessonState) === "current",
        );
  const currentDirection = current
    ? getLessonDirection(current.id)
    : directions.find((d) => d.id === currentDirectionId);

  const activeDirections = directions.filter(
    (d) => getDirectionLessons(d).length > 0,
  );

  const recentCompleted = allLessons
    .filter((l) => completedLessons.includes(l.id))
    .slice(-3)
    .reverse();

  return (
    <div className="standard-page">
      <div className="page-heading page-heading-split">
        <div>
          <span className="eyebrow">A GOOD DAY TO GROW</span>
          <h1>
            Welcome back, {learner.firstName}
            <span className="green-text">.</span>
          </h1>
          <p>Your next breakthrough starts with one small step.</p>
        </div>
        <div className="campus-status-chip">
          <GraduationCap size={17} />
          <span>{university.shortName}</span>
          <span className="meta-dot" />
          <strong>{learner.year}</strong>
        </div>
      </div>

      <div className="dashboard-stats">
        {[
          {
            icon: CheckCircle2,
            value: `${completedLessons.length}`,
            sub: `of ${allLessons.length} total`,
            label: "lessons completed",
            tone: "stat-teal",
          },
          {
            icon: Flame,
            value: `${streak}d`,
            sub: "active momentum",
            label: "day streak",
            tone: "stat-amber",
          },
          {
            icon: Star,
            value: (xp ?? 0).toLocaleString(),
            sub: "+100 XP per lesson",
            label: "XP earned",
            tone: "stat-blue",
          },
          {
            icon: Trophy,
            value: `Lvl ${level}`,
            sub: "scholar rank",
            label: "current level",
            tone: "stat-violet",
          },
        ].map(({ icon: Icon, value, sub, label, tone }) => (
          <div className={`panel-card stat-card ${tone}`} key={label}>
            <span className="stat-icon-badge">
              <Icon size={22} />
            </span>
            <div className="stat-card-text">
              <strong>{value}</strong>
              <span>{label}</span>
              <small className="stat-sub">{sub}</small>
            </div>
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
        <div className="continue-card-content">
          <div className="continue-card-top">
            <div className="continue-card-meta">
              <span className="eyebrow">
                {(currentDirection?.title ?? "AI & MACHINE LEARNING").toUpperCase()}
              </span>
            </div>
            {current && (
              <div className="continue-pills">
                <span className="continue-meta-pill">
                  <Clock3 size={13} />
                  {current.durationMinutes} min
                </span>
                <span className="continue-meta-pill gold">
                  <Star size={13} fill="currentColor" />+{current.xp} XP
                </span>
              </div>
            )}
          </div>

          <h2>{current ? current.title : "Foundations, completed."}</h2>
          <p>
            {current
              ? current.description
              : "You’ve finished your current learning path. Take a moment to celebrate your progress or explore other campus tracks."}
          </p>

          <div className="continue-actions">
            <Link
              href={current ? `/lesson/${current.id}` : "/achievements"}
              className="button primary"
              onClick={() => {
                if (current) startLesson(current.id);
              }}
            >
              {current ? "Continue learning" : "See your achievements"}
              <ArrowRight size={17} />
            </Link>
            <Link
              href={`/path/${currentDirection?.id ?? currentDirectionId}`}
              className="button secondary"
            >
              <Compass size={16} />
              Explore 3D Island
            </Link>
          </div>
        </div>

        <span className="continue-icon" aria-hidden="true">
          <CurriculumIcon name={current ? current.icon : "brain"} size={32} />
        </span>
      </section>

      <div className="section-heading">
        <div>
          <h2>Explore your campus tracks</h2>
        </div>
        <Link href="/courses">
          View all {directions.length} directions
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="dashboard-tracks-grid">
        {activeDirections.map((direction) => {
          const progress = getDirectionProgress(direction.id, {
            completedLessons,
          });
          const subjectClass =
            SUBJECT_THEME_MAP[direction.id] ?? "subject-ai";
          return (
            <Link
              key={direction.id}
              href={`/path/${direction.id}`}
              className={`panel-card mini-track-card ${subjectClass}`}
            >
              <div className="mini-track-top">
                <span className="mini-track-icon">
                  <CurriculumIcon name={direction.icon} size={22} />
                </span>
                <span className="mini-track-badge">
                  {progress.completed}/{progress.total} lessons
                </span>
              </div>
              <h3>{direction.title}</h3>
              <p>{direction.description}</p>
              <div className="mini-track-progress-row">
                <ProgressBar
                  value={progress.percent}
                  label={`${direction.title} progress`}
                />
                <strong>{progress.percent}%</strong>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="section-heading">
        <h2>Repeat & reinforce</h2>
        <Link href="/repeat">
          Solve previous tasks
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="panel-card repeat-callout-card">
        <div className="repeat-callout-left">
          <span className="repeat-callout-icon">
            <RotateCcw size={22} />
          </span>
          <div>
            <div className="repeat-callout-badges">
              <span className="eyebrow">SPACED REPETITION STUDIO</span>
              <span className="xp-pill">+15 XP per task</span>
            </div>
            <h2>Solve tasks from previous themes</h2>
            <p>
              Strengthen your memory by solving practice questions and quizzes
              from completed units.
            </p>
          </div>
        </div>
        <Link href="/repeat" className="button primary">
          <RotateCcw size={16} />
          Repeat tasks
        </Link>
      </div>

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
        {completedLessons.length > 0 && (
          <Link href={`/path/${currentDirection?.id ?? "ai-ml"}`}>
            View path
            <ArrowRight size={15} />
          </Link>
        )}
      </div>

      {recentCompleted.length > 0 ? (
        <div className="recent-lessons">
          {recentCompleted.map((lesson) => {
            const dir = getLessonDirection(lesson.id);
            return (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                onClick={() => startLesson(lesson.id)}
              >
                <span className="recent-icon">
                  <CurriculumIcon name={lesson.icon} />
                </span>
                <div className="recent-lesson-copy">
                  <strong>{lesson.title}</strong>
                  <small>
                    {dir ? `${dir.shortTitle} · ` : ""}Completed · Ready to
                    review
                  </small>
                </div>
                <span className="xp-pill">+{lesson.xp} XP</span>
                <ArrowRight size={17} />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="panel-card empty-state recent-empty-state">
          <div className="empty-icon">
            <BookOpen size={32} />
          </div>
          <h3>No completed lessons yet</h3>
          <p>
            Your completed lessons will appear here for quick review. Start your
            very first lesson on the campus island!
          </p>
          <Link
            href={
              current
                ? `/lesson/${current.id}`
                : `/path/${currentDirection?.id ?? "ai-ml"}`
            }
            className="button primary"
            onClick={() => {
              if (current) startLesson(current.id);
            }}
          >
            Start your first lesson
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
