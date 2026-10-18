"use client";

import { useMemo, useState } from "react";
import { Calendar, Crown, Medal, Sparkles, Star, Trophy } from "lucide-react";
import { leaderboard, learner } from "@/data/demo";
import { useProgress } from "@/stores/progress-provider";

const WEEKLY_XP_MAP: Record<string, number> = {
  "Sofia Chen": 380,
  "Daniel Kim": 290,
  "Maya Patel": 240,
  "Leo Martin": 160,
};

export function LeaderboardView() {
  const xp = useProgress((s) => s.xp);
  const [period, setPeriod] = useState<"weekly" | "all-time">("weekly");

  const learners = useMemo(() => {
    const rawList =
      period === "weekly"
        ? [
            ...leaderboard.map((item) => ({
              ...item,
              xp: WEEKLY_XP_MAP[item.name] ?? Math.round(item.xp * 0.6),
              isYou: false,
            })),
            {
              name: learner.name,
              initials: learner.initials,
              xp: Math.min(xp, 310),
              isYou: true,
            },
          ]
        : [
            ...leaderboard.map((item) => ({ ...item, isYou: false })),
            {
              name: learner.name,
              initials: learner.initials,
              xp,
              isYou: true,
            },
          ];

    return rawList
      .sort((a, b) => b.xp - a.xp)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
  }, [xp, period]);

  const maxXp = Math.max(1, learners[0]?.xp ?? 100);
  const you = learners.find((item) => item.isYou);
  const yourRank = you?.rank ?? 1;

  // Top 3 in rank order (1st, 2nd, 3rd)
  // Responsive CSS handles the desktop Olympic display (2nd on left, 1st in center, 3rd on right)
  // while ensuring Rank #1 renders first at the top of mobile viewports.
  const podiumList = learners.slice(0, 3);

  return (
    <div className="standard-page leaderboard-page">
      <div className="page-heading page-heading-split">
        <div>
          <span className="eyebrow">GROW BETTER, TOGETHER</span>
          <h1>A little friendly motivation.</h1>
          <p>Celebrate the effort. Cheer on your Politecnico learning cohort.</p>
        </div>
        <div className="campus-status-chip">
          <Sparkles size={14} />
          <span>Your Rank: #{yourRank} on Campus</span>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="leaderboard-controls panel-card">
        <div className="leaderboard-tabs-row">
          <div className="course-filter-tabs" role="tablist" aria-label="Leaderboard timeframe">
            <button
              type="button"
              role="tab"
              aria-selected={period === "weekly"}
              className={`filter-tab ${period === "weekly" ? "active" : ""}`}
              onClick={() => setPeriod("weekly")}
            >
              <Calendar size={14} /> Weekly Standings
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={period === "all-time"}
              className={`filter-tab ${period === "all-time" ? "active" : ""}`}
              onClick={() => setPeriod("all-time")}
            >
              <Trophy size={14} /> All-Time Cohort
            </button>
          </div>
          <span className="leaderboard-period-badge">
            {period === "weekly" ? "Resets every Sunday at midnight" : "Cumulative XP across all terms"}
          </span>
        </div>
      </div>

      {/* Olympic Podium Section */}
      <section className="podium-grid" aria-label="Top 3 learners">
        {podiumList.map((person) => {
          const rank = person.rank;
          return (
            <div
              key={person.name}
              className={`panel-card podium-card podium-rank-${rank} ${person.isYou ? "is-you" : ""}`}
            >
              <span className={`podium-medal medal-${rank}`}>
                {rank === 1 ? <Crown size={18} /> : <Medal size={17} />}
                #{rank}
              </span>
              <span className="avatar podium-avatar">{person.initials}</span>
              <h3>
                {person.name}
                {person.isYou && <small className="you-pill">You</small>}
              </h3>
              <span className="podium-xp">
                <Star size={14} />
                {person.xp} XP
              </span>
            </div>
          );
        })}
      </section>

      {/* Full Leaderboard Table */}
      <section className="panel-card leaderboard-card">
        <div className="card-heading">
          <h2>
            <Trophy size={20} />
            {period === "weekly" ? "Weekly Campus Leaderboard" : "All-Time Campus Leaderboard"}
          </h2>
          <span className="tiny-pill neutral">PoliTo Cohort Standings</span>
        </div>
        <ol>
          {learners.map((item) => {
            const barWidth = Math.max(12, Math.round((item.xp / maxXp) * 100));
            return (
              <li
                key={item.name}
                className={`leaderboard-row ${item.isYou ? "is-you" : ""}`}
              >
                <span className={`rank rank-${item.rank}`}>{item.rank}</span>
                <span className="avatar">{item.initials}</span>
                <div className="leader-info">
                  <strong>
                    {item.name}
                    {item.isYou && <small className="you-pill">You</small>}
                  </strong>
                  <div className="leader-bar-track" aria-hidden="true">
                    <span style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
                <span className="leader-xp">
                  {item.xp} <small>XP</small>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="leaderboard-note">
          Sample classmates. Complete lessons or repeat review sessions to climb
          the standings.
        </p>
      </section>
    </div>
  );
}
