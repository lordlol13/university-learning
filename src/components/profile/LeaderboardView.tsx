"use client";

import { Trophy } from "lucide-react";
import { leaderboard, learner } from "@/data/demo";
import { useProgress } from "@/stores/progress-provider";

export function LeaderboardView() {
  const xp = useProgress((s) => s.xp);
  const learners = [
    ...leaderboard.map((item) => ({ ...item, isYou: false })),
    { name: learner.name, initials: learner.initials, xp, isYou: true },
  ].sort((a, b) => b.xp - a.xp);
  return (
    <div className="standard-page">
      <div className="page-heading">
        <span className="eyebrow">GROW BETTER, TOGETHER</span>
        <h1>A little friendly motivation.</h1>
        <p>Celebrate the effort. Cheer on your learning community.</p>
      </div>
      <section className="panel-card leaderboard-card">
        <div className="card-heading">
          <h2>
            <Trophy size={22} />
            Campus leaderboard
          </h2>
          <span className="tiny-pill neutral">Demo standings</span>
        </div>
        <ol>
          {learners.map((item, index) => (
            <li key={item.name} className={item.isYou ? "is-you" : ""}>
              <span className={`rank rank-${index + 1}`}>{index + 1}</span>
              <span className="avatar">{item.initials}</span>
              <strong>
                {item.name}
                {item.isYou && <small>You</small>}
              </strong>
              <span className="leader-xp">
                {item.xp} <small>XP</small>
              </span>
            </li>
          ))}
        </ol>
        <p className="leaderboard-note">
          Sample classmates. Your XP updates as you learn.
        </p>
      </section>
    </div>
  );
}
