"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Check,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { achievementCatalog } from "@/data/demo";
import type { Achievement } from "@/types/curriculum";
import { useProgress } from "@/stores/progress-provider";
import { getDirectionProgress } from "@/stores/progress-store";
import { AchievementBadge } from "@/components/ui/ModernAchievementBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getPracticeSessions } from "@/lib/repeat-tasks";

type AchievementFilter = "all" | "in-progress" | "unlocked";

interface BadgeProgress {
  percent: number;
  current: number;
  target: number;
  unit: string;
  requirement: string;
  reward: string;
}

export function AchievementsView() {
  const earnedIds = useProgress((s) => s.achievements);
  const completedLessons = useProgress((s) => s.completedLessons);
  const streak = useProgress((s) => s.streak);

  const [filter, setFilter] = useState<AchievementFilter>("all");
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedBadge(null);
      }
    };
    if (selectedBadge) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBadge]);

  const unlockPercent = Math.round(
    (earnedIds.length / Math.max(1, achievementCatalog.length)) * 100,
  );

  const getBadgeProgress = (id: string): BadgeProgress => {
    const isEarned = earnedIds.includes(id);

    switch (id) {
      case "getting-started": {
        const target = 1;
        const current = Math.min(target, completedLessons.length);
        const percent = isEarned ? 100 : current >= 1 ? 100 : 0;
        return {
          percent,
          current,
          target,
          unit: "lessons",
          requirement: "Complete any introductory lesson in any campus direction.",
          reward: "+50 Campus XP · First Step Honor",
        };
      }
      case "seven-day-streak": {
        const target = 7;
        const current = Math.min(target, streak);
        const percent = isEarned ? 100 : Math.round((current / target) * 100);
        return {
          percent,
          current,
          target,
          unit: "days",
          requirement: "Log into the university campus and study for 7 consecutive days.",
          reward: "+100 Campus XP · Consistency Flame",
        };
      }
      case "three-lessons": {
        const target = 3;
        const current = Math.min(target, completedLessons.length);
        const percent = isEarned ? 100 : Math.round((current / target) * 100);
        return {
          percent,
          current,
          target,
          unit: "lessons",
          requirement: "Successfully complete 3 individual lessons across any subjects.",
          reward: "+75 Campus XP · Momentum Pin",
        };
      }
      case "ai-explorer": {
        const p = getDirectionProgress("ai-ml", { completedLessons });
        return {
          percent: isEarned ? 100 : p.percent,
          current: p.completed,
          target: p.total,
          unit: "lessons",
          requirement: "Complete all 6 lessons on the AI & Machine Learning campus island.",
          reward: "+200 Campus XP · Neural Mastery Crest",
        };
      }
      case "physics-master": {
        const p = getDirectionProgress("physics-engineering", { completedLessons });
        return {
          percent: isEarned ? 100 : p.percent,
          current: p.completed,
          target: p.total,
          unit: "lessons",
          requirement: "Complete all 7 lessons on the Physics & Engineering campus island.",
          reward: "+250 Campus XP · Applied Engineering Compass",
        };
      }
      case "math-pioneer": {
        const p = getDirectionProgress("mathematics", { completedLessons });
        return {
          percent: isEarned ? 100 : p.percent,
          current: p.completed,
          target: p.total,
          unit: "lessons",
          requirement: "Complete all 4 lessons on the Mathematics & Logic campus island.",
          reward: "+200 Campus XP · Calculus & Logic Laurels",
        };
      }
      case "italian-scholar": {
        const p = getDirectionProgress("italian-language", { completedLessons });
        return {
          percent: isEarned ? 100 : p.percent,
          current: p.completed,
          target: p.total,
          unit: "lessons",
          requirement: "Complete all 3 lessons on the Italian Language & Culture island.",
          reward: "+150 Campus XP · Polyglot Culture Laurel",
        };
      }
      case "practice-champion": {
        const sessions = typeof window !== "undefined" ? getPracticeSessions() : [];
        const current = Math.min(1, sessions.length);
        return {
          percent: isEarned ? 100 : current >= 1 ? 100 : 0,
          current,
          target: 1,
          unit: "sessions",
          requirement: "Complete a Spaced Repetition review session with verified answers.",
          reward: "+100 Campus XP · Practice Trophy",
        };
      }
      default: {
        return {
          percent: isEarned ? 100 : 0,
          current: isEarned ? 1 : 0,
          target: 1,
          unit: "milestones",
          requirement: "Unlock this special milestone by completing university activities.",
          reward: "+100 Campus XP",
        };
      }
    }
  };

  const filteredCatalog = useMemo(() => {
    return achievementCatalog.filter((a) => {
      const earned = earnedIds.includes(a.id);
      if (filter === "unlocked") return earned;
      if (filter === "in-progress") return !earned;
      return true;
    });
  }, [earnedIds, filter]);

  return (
    <div className="standard-page achievements-page">
      <div className="page-heading page-heading-split">
        <div>
          <span className="eyebrow">LITTLE WINS · BIG MOMENTUM</span>
          <h1>Look how far you’ve come.</h1>
          <p>Every badge tells a part of your academic learning story.</p>
        </div>
        <div className="campus-status-chip">
          <Sparkles size={14} />
          <span>
            {earnedIds.length} / {achievementCatalog.length} Milestones Unlocked
          </span>
        </div>
      </div>

      <section className="panel-card achievement-summary-banner">
        <div className="achievement-summary-left">
          <span className="achievement-summary-icon">
            <Award size={26} />
          </span>
          <div>
            <span className="eyebrow">COLLECTION PROGRESS</span>
            <h2>
              {earnedIds.length} of {achievementCatalog.length} campus badges
              earned
            </h2>
            <p>
              Complete lessons, maintain your daily streak, and finish full
              directions to unlock the remaining honors.
            </p>
          </div>
        </div>
        <div className="achievement-summary-right">
          <div className="achievement-summary-pct">
            <strong>{unlockPercent}%</strong>
            <span>complete</span>
          </div>
          <ProgressBar value={unlockPercent} label="Achievement unlock progress" />
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="achievements-filter-row">
        <div className="course-filter-tabs" role="tablist" aria-label="Filter achievements">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Badges ({achievementCatalog.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "in-progress"}
            className={`filter-tab ${filter === "in-progress" ? "active" : ""}`}
            onClick={() => setFilter("in-progress")}
          >
            In Progress ({achievementCatalog.length - earnedIds.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "unlocked"}
            className={`filter-tab ${filter === "unlocked" ? "active" : ""}`}
            onClick={() => setFilter("unlocked")}
          >
            Unlocked ({earnedIds.length})
          </button>
        </div>
        <span className="achievements-hint-text">
          Click any badge for detailed criteria and rewards
        </span>
      </div>

      <div className="section-heading">
        <h2>
          {filter === "all"
            ? "All milestones"
            : filter === "unlocked"
              ? "Unlocked milestones"
              : "In-progress milestones"}
        </h2>
        <span>
          {filteredCatalog.length} shown
        </span>
      </div>

      {filteredCatalog.length === 0 ? (
        <div className="empty-state" role="status">
          <div className="empty-icon">
            <Award size={36} />
          </div>
          <h3>No milestones in this category</h3>
          <p>
            {filter === "unlocked"
              ? "You haven't unlocked any milestones in this view yet. Keep completing lessons to earn your first badge!"
              : "All available milestones are already unlocked. Congratulations on your complete collection!"}
          </p>
          <button
            type="button"
            className="button secondary"
            onClick={() => setFilter("all")}
          >
            <RotateCcw size={15} /> Show all badges
          </button>
        </div>
      ) : (
        <div className="achievement-grid">
          {filteredCatalog.map((achievement) => {
            const earned = earnedIds.includes(achievement.id);
            const progress = getBadgeProgress(achievement.id);

            return (
              <button
                type="button"
                className={`panel-card achievement-detail ${earned ? "earned" : ""}`}
                key={achievement.id}
                onClick={() => setSelectedBadge(achievement)}
                aria-haspopup="dialog"
                aria-label={`View details for ${achievement.title}`}
              >
                <AchievementBadge
                  achievement={achievement}
                  earned={earned}
                  size="lg"
                />
                <h2>{achievement.title}</h2>
                <p>{achievement.description}</p>

                <div className="achievement-progress-box">
                  <div className="achievement-progress-meta">
                    <span>
                      {earned
                        ? "Completed"
                        : `${progress.current}/${progress.target} ${progress.unit}`}
                    </span>
                    <strong>{progress.percent}%</strong>
                  </div>
                  <ProgressBar
                    value={progress.percent}
                    label={`${achievement.title} progress`}
                  />
                </div>

                <span
                  className={`achievement-status ${earned ? "green-text" : ""}`}
                >
                  {earned ? <Check size={15} /> : <LockKeyhole size={14} />}
                  {earned ? "Unlocked · Click for details" : "In Progress · Click for details"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive Badge Details Modal */}
      {selectedBadge && (() => {
        const earned = earnedIds.includes(selectedBadge.id);
        const progress = getBadgeProgress(selectedBadge.id);

        return (
          <div
            className="modal-backdrop"
            onClick={() => setSelectedBadge(null)}
            role="presentation"
          >
            <div
              className="panel-card achievement-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="badge-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedBadge(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>

              <div className="achievement-modal-top">
                <AchievementBadge
                  achievement={selectedBadge}
                  earned={earned}
                  size="xl"
                />
                <span
                  className={`tiny-pill ${earned ? "pill-emerald" : "neutral"}`}
                >
                  {earned ? (
                    <>
                      <Check size={12} /> Milestone Achieved
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={12} /> Locked · {progress.percent}% Progress
                    </>
                  )}
                </span>
                <h2 id="badge-modal-title">{selectedBadge.title}</h2>
                <p className="achievement-modal-desc">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="achievement-modal-progress">
                <div className="achievement-modal-progress-label">
                  <span>Current Progress</span>
                  <strong>
                    {progress.current} / {progress.target} {progress.unit} ({progress.percent}%)
                  </strong>
                </div>
                <ProgressBar
                  value={progress.percent}
                  label={`${selectedBadge.title} progress`}
                />
              </div>

              <div className="achievement-modal-details">
                <div className="modal-detail-block">
                  <span className="detail-label">Requirements</span>
                  <p>{progress.requirement}</p>
                </div>
                <div className="modal-detail-block">
                  <span className="detail-label">Reward</span>
                  <p className="reward-text">{progress.reward}</p>
                </div>
              </div>

              <div className="achievement-modal-actions">
                <button
                  type="button"
                  className="button primary"
                  onClick={() => setSelectedBadge(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
