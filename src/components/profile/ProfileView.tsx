"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Check,
  Compass,
  Flame,
  GraduationCap,
  RotateCcw,
  Star,
} from "lucide-react";
import { learner, levelSize } from "@/data/demo";
import {
  directions,
  getDirectionLessons,
  program,
  university,
} from "@/data/curriculum";
import type { Direction } from "@/types/curriculum";
import { useProgress } from "@/stores/progress-provider";
import { getDirectionProgress } from "@/stores/progress-store";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SUBJECT_THEME_MAP: Record<string, string> = {
  "ai-ml": "subject-ai",
  "physics-engineering": "subject-physics",
  mathematics: "subject-math",
  "italian-language": "subject-italian",
  "italian-culture": "subject-italian",
};

export function ProfileView() {
  const level = useProgress((s) => s.level);
  const completedLessons = useProgress((s) => s.completedLessons);
  const streak = useProgress((s) => s.streak);
  const xp = useProgress((s) => s.xp);
  const achievements = useProgress((s) => s.achievements);
  const resetProgress = useProgress((s) => s.resetProgress);

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  const levelPct = Math.round(((xp % levelSize) / levelSize) * 100);

  // 4-Week Activity Calendar Matrix (28 days)
  const activityDays = useMemo(() => {
    // Generate 28 days leading up to today
    const days = [];
    const safeStreak = Math.max(0, streak ?? 0);
    for (let i = 27; i >= 0; i--) {
      // Days from today backwards
      const isToday = i === 0;
      // Active if within streak, or periodic past activity pattern
      const isActive =
        i < safeStreak || (i >= 8 && i <= 14) || (i >= 18 && i <= 23);
      days.push({
        dayIndex: 27 - i,
        daysAgo: i,
        isActive,
        isToday,
      });
    }
    return days;
  }, [streak]);

  const handleReset = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("uplift_solved_repeat_tasks");
        window.localStorage.removeItem("uplift_practice_sessions");
        window.localStorage.removeItem("uplift_math_studio_settings_v3");
      }
    } catch {}
    resetProgress();
    setConfirmReset(false);
    setResetNotice(true);
  };

  return (
    <div className="standard-page profile-page">
      <div className="page-heading">
        <span className="eyebrow">YOUR OWN KIND OF BRILLIANT</span>
        <h1>My profile</h1>
        <p>A growing academic story, one lesson at a time.</p>
      </div>

      <section className="panel-card profile-identity">
        <span className="avatar profile-avatar">{learner.initials}</span>
        <div className="profile-identity-copy">
          <div className="profile-identity-badges">
            <span className="tiny-pill">Level {level} Scholar</span>
            <span className="tiny-pill neutral">
              <BadgeCheck size={13} /> {university.shortName} Student
            </span>
          </div>
          <h2>{learner.name}</h2>
          <p>
            {learner.year} · {program.title} · Joined {learner.joined}
          </p>
        </div>
      </section>

      {/* Profile Overview Stats */}
      <div className="dashboard-stats">
        {[
          {
            icon: BookOpen,
            value: completedLessons.length,
            label: "lessons completed",
            tone: "stat-teal",
          },
          {
            icon: Flame,
            value: `${streak}d`,
            label: "day streak",
            tone: "stat-amber",
          },
          {
            icon: Star,
            value: (xp ?? 0).toLocaleString(),
            label: "total XP",
            tone: "stat-blue",
          },
          {
            icon: Award,
            value: achievements.length,
            label: "badges unlocked",
            tone: "stat-violet",
          },
        ].map(({ icon: Icon, value, label, tone }) => (
          <div className={`panel-card stat-card ${tone}`} key={label}>
            <span className="stat-icon-badge">
              <Icon size={21} />
            </span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Streak Calendar & Activity Heatmap Section */}
      <section className="panel-card streak-heatmap-card" aria-label="Learning momentum and streak calendar">
        <div className="streak-heatmap-header">
          <div className="streak-heatmap-title">
            <Flame size={22} className="streak-fire-icon" />
            <div>
              <h2>Learning Momentum & Streak Calendar</h2>
              <p>Your daily study habit across the last 4 weeks on campus.</p>
            </div>
          </div>
          <div className="streak-metrics-strip">
            <div className="streak-metric-item">
              <span className="metric-label">Current Streak</span>
              <strong className="metric-value text-amber-600">{streak} Days</strong>
            </div>
            <div className="streak-metric-item">
              <span className="metric-label">Longest Streak</span>
              <strong className="metric-value">{Math.max(streak, 14)} Days</strong>
            </div>
            <div className="streak-metric-item">
              <span className="metric-label">Consistency</span>
              <strong className="metric-value text-teal-600">82%</strong>
            </div>
          </div>
        </div>

        {/* Weekly Day Headers */}
        <div className="heatmap-weekdays-row">
          {WEEK_DAYS.map((day) => (
            <span key={day} className="heatmap-weekday-label">
              {day}
            </span>
          ))}
        </div>

        {/* 4-Week Activity Heatmap Grid */}
        <div className="heatmap-grid" role="grid" aria-label="Activity heatmap for the last 4 weeks">
          {activityDays.map((d) => (
            <div
              key={d.dayIndex}
              className={`heatmap-cell ${d.isActive ? "active" : "inactive"} ${d.isToday ? "today" : ""}`}
              title={`${d.isToday ? "Today" : `${d.daysAgo} days ago`}: ${d.isActive ? "Study session completed" : "Rest day"}`}
              role="gridcell"
              aria-selected={d.isToday}
            >
              {d.isToday && <span className="today-dot" />}
              {d.isActive && d.daysAgo < streak && <Check size={10} className="cell-check" />}
            </div>
          ))}
        </div>

        <div className="heatmap-footer">
          <span className="heatmap-legend-item">
            <span className="legend-box inactive" /> Rest Day
          </span>
          <span className="heatmap-legend-item">
            <span className="legend-box active" /> Active Study Session
          </span>
          <span className="heatmap-legend-item">
            <span className="legend-box today-legend" /> Today
          </span>
        </div>
      </section>

      {/* Campus Track Completion Breakdown */}
      <section className="panel-card track-breakdown-section" aria-label="Campus track completion breakdown">
        <div className="card-heading">
          <div>
            <h2>Campus Track Breakdown</h2>
            <p className="track-breakdown-subtitle">
              Progress across your accredited Politecnico learning directions.
            </p>
          </div>
          <span className="tiny-pill">4 Campus Islands</span>
        </div>

        <div className="track-breakdown-grid">
          {directions.map((dir: Direction) => {
            const lessons = getDirectionLessons(dir);
            const total = lessons.length;
            const progress = getDirectionProgress(dir.id, { completedLessons });
            const isFinished = progress.completed === total && total > 0;
            const isStarted = progress.completed > 0;
            const themeClass = SUBJECT_THEME_MAP[dir.id] ?? "subject-ai";

            return (
              <div
                key={dir.id}
                className={`panel-card track-breakdown-card ${themeClass} ${isFinished ? "finished" : ""}`}
              >
                <div className="track-card-header">
                  <span className="track-card-icon">
                    <CurriculumIcon name={dir.icon} size={22} />
                  </span>
                  <span
                    className={`tiny-pill ${
                      isFinished
                        ? "pill-emerald"
                        : isStarted
                          ? "pill-teal"
                          : "neutral"
                    }`}
                  >
                    {isFinished
                      ? "100% Completed"
                      : isStarted
                        ? "In Progress"
                        : "Not Started"}
                  </span>
                </div>

                <h3>{dir.title}</h3>
                <p>{dir.description}</p>

                <div className="track-progress-info">
                  <div className="track-progress-meta">
                    <span>
                      {progress.completed} of {total} lessons complete
                    </span>
                    <strong>{progress.percent}%</strong>
                  </div>
                  <ProgressBar
                    value={progress.percent}
                    label={`${dir.title} progress`}
                  />
                </div>

                <Link href={`/path/${dir.id}`} className="track-explore-link">
                  <span>
                    <Compass size={15} /> Explore Island Path
                  </span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <div className="profile-two-col">
        <section className="panel-card profile-section">
          <div className="card-heading">
            <h2>My university</h2>
            <GraduationCap size={22} />
          </div>
          <strong>{university.name}</strong>
          <p>
            {program.title} · {program.qualification}
          </p>
        </section>

        <section className="panel-card profile-section">
          <div className="card-heading">
            <h2>A little closer to Level {level + 1}</h2>
            <span className="green-text">
              {level * levelSize - xp} XP to go
            </span>
          </div>
          <ProgressBar value={levelPct} label="Level progress" />
          <p>
            You’ve earned {xp % levelSize} of {levelSize} XP in Level {level}.
          </p>
        </section>
      </div>

      <section className="panel-card demo-settings">
        <h2>About this workspace</h2>
        <p>
          This is an interactive demo curriculum. Progress is saved in this
          browser and isn’t an official university record.
        </p>

        {confirmReset ? (
          <div
            className="reset-confirm-box panel-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            aria-describedby="reset-dialog-desc"
          >
            <div className="reset-confirm-top">
              <RotateCcw size={20} className="text-rose-600" />
              <h3 id="reset-dialog-title">Restore starting demo progress?</h3>
            </div>
            <p id="reset-dialog-desc">
              All earned XP, unlocked achievements, completed lessons, and repeat
              practice sessions stored in this browser will be cleanly restored
              to initial demo state.
            </p>
            <div className="reset-confirm-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setConfirmReset(false)}
              >
                Keep my progress
              </button>
              <button
                type="button"
                className="button danger"
                onClick={handleReset}
              >
                Yes, reset demo progress
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setConfirmReset(true);
              setResetNotice(false);
            }}
          >
            <RotateCcw size={15} />
            Reset demo progress
          </button>
        )}

        {resetNotice && (
          <p role="status" className="green-text" style={{ marginTop: 12 }}>
            Demo progress successfully restored to baseline.
          </p>
        )}
      </section>
    </div>
  );
}
