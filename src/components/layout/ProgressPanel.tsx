"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Compass,
  Flame,
  GraduationCap,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { achievementCatalog, levelSize } from "@/data/demo";
import { getDirection, getLessonDirection } from "@/data/curriculum";
import { useProgress } from "@/stores/progress-provider";
import { getDirectionProgress } from "@/stores/progress-store";
import { AchievementBadge } from "@/components/ui/ModernAchievementBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getSoundPreference,
  setSoundPreference,
  subscribeSoundPreference,
} from "@/lib/island-audio";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function ProgressPanel() {
  const pathname = usePathname();
  const currentDirectionId = useProgress((s) => s.currentDirectionId);
  const completedLessons = useProgress((s) => s.completedLessons);
  const xp = useProgress((s) => s.xp);
  const level = useProgress((s) => s.level);
  const streak = useProgress((s) => s.streak);
  const achievements = useProgress((s) => s.achievements);

  const soundEnabled = useSyncExternalStore(
    subscribeSoundPreference,
    getSoundPreference,
    () => true,
  );

  const toggleSound = () => {
    setSoundPreference(!soundEnabled);
  };

  const routeDirection = pathname.startsWith("/path/")
    ? pathname.split("/")[2]
    : pathname.startsWith("/lesson/")
      ? getLessonDirection(pathname.split("/")[2])?.id
      : undefined;
  const directionId =
    routeDirection && getDirection(routeDirection)
      ? routeDirection
      : currentDirectionId;
  const activeDirection = getDirection(directionId);
  const { completed, total, percent } = getDirectionProgress(directionId, {
    completedLessons,
  });

  const safePercent = Number.isFinite(percent)
    ? Math.min(100, Math.max(0, percent))
    : 0;
  const safeXp = Number.isFinite(xp) && xp >= 0 ? xp : 0;
  const safeLevel = Number.isFinite(level) && level >= 1 ? level : 1;
  const safeLevelSize =
    Number.isFinite(levelSize) && levelSize > 0 ? levelSize : 250;
  const xpToNext = Math.max(0, safeLevel * safeLevelSize - safeXp);
  const levelPercent = Math.min(
    100,
    Math.max(0, Math.round(((safeXp % safeLevelSize) / safeLevelSize) * 100)),
  );
  const ringCircumference = 2 * Math.PI * 38;
  const ringOffset = ringCircumference * (1 - safePercent / 100);
  const safeStreak = Number.isFinite(streak) && streak >= 0 ? streak : 0;
  const activeDaysCount = safeStreak > 0 ? Math.min(7, safeStreak) : 0;

  return (
    <aside className="progress-panel" aria-label="Learning progress">
      <section className="panel-card progress-card">
        <div className="card-heading">
          <div>
            <h2>Track Progress</h2>
            <small className="panel-sublabel">
              {activeDirection?.shortTitle ?? "Active Path"}
            </small>
          </div>
          <div className="card-heading-actions">
            <button
              type="button"
              className={`sound-toggle-btn ${soundEnabled ? "" : "muted"}`}
              onClick={toggleSound}
              aria-label={soundEnabled ? "Mute audio effects" : "Enable audio effects"}
              title={soundEnabled ? "Mute audio effects" : "Enable audio effects"}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
            <Link href={`/path/${directionId}`} className="live-label-link">
              <Compass size={13} />
              3D ISLAND
            </Link>
          </div>
        </div>
        <div className="progress-overview">
          <div
            className="progress-ring"
            style={{ "--completion": `${safePercent}%` } as CSSProperties}
            role="img"
            aria-label={`${safePercent}% completed`}
          >
            <svg
              className="progress-ring-svg"
              viewBox="0 0 92 92"
              aria-hidden="true"
            >
              <circle
                className="progress-ring-track"
                cx="46"
                cy="46"
                r="38"
              />
              <circle
                className="progress-ring-fill"
                cx="46"
                cy="46"
                r="38"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div className="progress-ring-inner">
              <strong>
                {safePercent}
                <span>%</span>
              </strong>
            </div>
          </div>
          <div className="progress-stats-copy">
            <div className="lesson-fraction">
              <strong>{completed}</strong>
              <span> / {total}</span>
            </div>
            <p>lessons completed</p>
            <span className="tiny-pill">
              {total && completed === total
                ? "Path complete!"
                : "In progress"}
            </span>
          </div>
        </div>

        <div className="weekly-streak-box">
          <div className="weekly-streak-header">
            <span>
              <Flame size={13} /> Weekly momentum
            </span>
            <strong>{safeStreak}d streak</strong>
          </div>
          <div className="weekly-days-row">
            {WEEK_DAYS.map((day, idx) => {
              const done = idx < activeDaysCount;
              return (
                <div
                  key={`${day}-${idx}`}
                  className={`week-day-item ${done ? "done" : ""}`}
                >
                  <span className="week-day-circle">
                    {done ? <Check size={11} strokeWidth={3} /> : null}
                  </span>
                  <small>{day}</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="progress-encouragement">
          <GraduationCap size={18} />
          <p>
            {total === 0
              ? "Your next chapter is on its way."
              : safePercent === 100
                ? "You did it. Look how far you’ve come!"
                : safePercent >= 50
                  ? "Look at you. Already halfway there!"
                  : "Every lesson is a step forward."}
          </p>
        </div>
      </section>

      <section className="panel-card secondary-progress">
        <div className="card-heading">
          <h2>Achievements</h2>
          <Link href="/achievements">
            View all ({achievements.length}/{achievementCatalog.length}){" "}
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="badges-row">
          {achievementCatalog.slice(0, 4).map((achievement) => (
            <Link
              href="/achievements"
              key={achievement.id}
              className="badge-item"
            >
              <span
                key={`${achievement.id}-${achievements.includes(achievement.id)}`}
                className={
                  achievements.includes(achievement.id) ? "earned-reveal" : ""
                }
              >
                <AchievementBadge
                  achievement={achievement}
                  earned={achievements.includes(achievement.id)}
                  size="sm"
                />
              </span>
              <span>{achievement.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel-card secondary-progress">
        <div className="card-heading">
          <h2>Your XP</h2>
          <span className="tiny-pill">Level {safeLevel}</span>
        </div>
        <div className="xp-overview">
          <div className="xp-coin">
            <Star size={24} fill="currentColor" strokeWidth={1.5} />
          </div>
          <div>
            <strong key={safeXp} className="xp-value">
              {safeXp.toLocaleString()} <span>XP</span>
            </strong>
            <p>{xpToNext} XP until next level</p>
          </div>
        </div>
        <ProgressBar
          value={levelPercent}
          label="Progress to next level"
          color="gold"
        />
        <div className="xp-level-labels">
          <span>Level {safeLevel}</span>
          <span>Level {safeLevel + 1}</span>
        </div>
      </section>

      <section className="encouragement-card secondary-progress">
        <Sparkles size={22} />
        <h2>
          Knowledge takes
          <br />
          you further.
        </h2>
        <p>
          A little curiosity today.
          <br />A world of possibilities tomorrow.
        </p>
        <span className="encouragement-footer">LEARN · GROW · BELONG</span>
      </section>
      <p className="panel-footnote">Made for your next big step.</p>
    </aside>
  );
}
