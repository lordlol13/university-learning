"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, GraduationCap, Sparkles, Star } from "lucide-react";
import { achievementCatalog, levelSize } from "@/data/demo";
import { getDirection, getLessonDirection } from "@/data/curriculum";
import { useProgress } from "@/stores/progress-provider";
import { getDirectionProgress } from "@/stores/progress-store";
import { AchievementBadge } from "@/components/ui/AchievementBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function ProgressPanel() {
  const pathname = usePathname();
  const state = useProgress((s) => s);
  const routeDirection = pathname.startsWith("/path/")
    ? pathname.split("/")[2]
    : pathname.startsWith("/lesson/")
      ? getLessonDirection(pathname.split("/")[2])?.id
      : undefined;
  const directionId =
    routeDirection && getDirection(routeDirection)
      ? routeDirection
      : state.currentDirectionId;
  const { completed, total, percent } = getDirectionProgress(
    directionId,
    state,
  );
  const xpToNext = state.level * levelSize - state.xp;
  const levelPercent = Math.round(((state.xp % levelSize) / levelSize) * 100);
  return (
    <aside className="progress-panel" aria-label="Learning progress">
      <section className="panel-card progress-card">
        <div className="card-heading">
          <h2>Your Progress</h2>
          <span className="live-label">THIS PATH</span>
        </div>
        <div className="progress-overview">
          <div
            className="progress-ring"
            style={{
              background: `conic-gradient(var(--green) ${percent}%, #edf0eb 0)`,
            }}
            role="img"
            aria-label={`${percent}% completed`}
          >
            <div>
              <strong>
                {percent}
                <span>%</span>
              </strong>
            </div>
          </div>
          <div>
            <div className="lesson-fraction">
              <strong>{completed}</strong>
              <span> / {total}</span>
            </div>
            <p>lessons completed</p>
            <span className="tiny-pill">
              {total && completed === total
                ? "Path complete!"
                : "Keep it going"}
            </span>
          </div>
        </div>
        <div className="progress-encouragement">
          <GraduationCap size={21} />
          <p>
            {total === 0
              ? "Your next chapter is on its way."
              : percent === 100
                ? "You did it. Look how far you’ve come!"
                : percent >= 50
                  ? "Look at you. Already halfway there!"
                  : "Every lesson is a step forward."}
          </p>
        </div>
      </section>
      <section className="panel-card secondary-progress">
        <div className="card-heading">
          <h2>Achievements</h2>
          <Link href="/achievements">
            View all <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="badges-row">
          {achievementCatalog.map((achievement) => (
            <Link
              href="/achievements"
              key={achievement.id}
              className="badge-item"
            >
              <AchievementBadge
                achievement={achievement}
                earned={state.achievements.includes(achievement.id)}
              />
              <span>{achievement.title}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="panel-card secondary-progress">
        <div className="card-heading">
          <h2>Your XP</h2>
          <span className="tiny-pill">Level {state.level}</span>
        </div>
        <div className="xp-overview">
          <div className="xp-coin">
            <Star size={27} fill="currentColor" strokeWidth={1.5} />
          </div>
          <div>
            <strong>
              {state.xp} <span>XP</span>
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
          <span>Level {state.level}</span>
          <span>Level {state.level + 1}</span>
        </div>
      </section>
      <section className="encouragement-card secondary-progress">
        <Sparkles size={25} />
        <h2>
          Knowledge takes
          <br />
          you further.
        </h2>
        <p>
          A little curiosity today.
          <br />A world of possibilities tomorrow.
        </p>
        <span className="encouragement-footer">LEARN. GROW. BELONG.</span>
      </section>
      <p className="panel-footnote">Made for your next big step.</p>
    </aside>
  );
}
