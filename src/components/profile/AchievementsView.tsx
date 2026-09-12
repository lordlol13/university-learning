"use client";

import { Check, LockKeyhole } from "lucide-react";
import { achievementCatalog } from "@/data/demo";
import { useProgress } from "@/stores/progress-provider";
import { AchievementBadge } from "@/components/ui/AchievementBadge";

export function AchievementsView() {
  const earnedIds = useProgress((s) => s.achievements);
  return (
    <div className="standard-page">
      <div className="page-heading">
        <span className="eyebrow">LITTLE WINS. BIG MOMENTUM.</span>
        <h1>Look how far you’ve come.</h1>
        <p>Every badge tells a part of your learning story.</p>
      </div>
      <div className="section-heading">
        <h2>Your achievements</h2>
        <span>
          {earnedIds.length} of {achievementCatalog.length} unlocked
        </span>
      </div>
      <div className="achievement-grid">
        {achievementCatalog.map((achievement) => {
          const earned = earnedIds.includes(achievement.id);
          return (
            <section
              className={`panel-card achievement-detail ${earned ? "earned" : ""}`}
              key={achievement.id}
            >
              <AchievementBadge achievement={achievement} earned={earned} />
              <h2>{achievement.title}</h2>
              <p>{achievement.description}</p>
              <span
                className={`achievement-status ${earned ? "green-text" : ""}`}
              >
                {earned ? <Check size={15} /> : <LockKeyhole size={14} />}
                {earned ? "Unlocked. Well deserved." : "Your next milestone"}
              </span>
            </section>
          );
        })}
      </div>
    </div>
  );
}
