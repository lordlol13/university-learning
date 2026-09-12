"use client";

import { useState } from "react";
import { BookOpen, Flame, GraduationCap, RotateCcw, Star } from "lucide-react";
import { learner, levelSize } from "@/data/demo";
import { program, university } from "@/data/curriculum";
import { useProgress } from "@/stores/progress-provider";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function ProfileView() {
  const state = useProgress((s) => s);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  return (
    <div className="standard-page">
      <div className="page-heading">
        <span className="eyebrow">YOUR OWN KIND OF BRILLIANT</span>
        <h1>My profile</h1>
        <p>A growing story, one lesson at a time.</p>
      </div>
      <section className="panel-card profile-identity">
        <span className="avatar profile-avatar">{learner.initials}</span>
        <h2>{learner.name}</h2>
        <p>
          {learner.year} · Joined {learner.joined}
        </p>
        <span className="tiny-pill">Level {state.level} learner</span>
      </section>
      <div className="dashboard-stats">
        {[
          {
            icon: BookOpen,
            value: state.completedLessons.length,
            label: "lessons completed",
          },
          { icon: Flame, value: state.streak, label: "day streak" },
          { icon: Star, value: state.xp, label: "total XP" },
        ].map(({ icon: Icon, value, label }) => (
          <div className="panel-card" key={label}>
            <Icon size={23} />
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="panel-card profile-section">
        <div className="card-heading">
          <h2>My university</h2>
          <GraduationCap size={23} />
        </div>
        <strong>{university.name}</strong>
        <p>
          {program.title} · {program.qualification}
        </p>
      </section>
      <section className="panel-card profile-section">
        <div className="card-heading">
          <h2>A little closer to Level {state.level + 1}</h2>
          <span className="green-text">
            {state.level * levelSize - state.xp} XP to go
          </span>
        </div>
        <ProgressBar
          value={Math.round(((state.xp % levelSize) / levelSize) * 100)}
          label="Level progress"
        />
      </section>
      <section className="demo-settings">
        <h2>About this workspace</h2>
        <p>
          This is a demo curriculum. Progress is saved in this browser and isn’t
          an official university record. The streak is sample data.
        </p>
        {confirmReset ? (
          <div className="reset-confirm">
            <p>
              Restore the starting progress? Lessons and XP earned in this
              browser will be reset.
            </p>
            <button
              className="button secondary"
              onClick={() => setConfirmReset(false)}
            >
              Keep my progress
            </button>
            <button
              className="button danger"
              onClick={() => {
                state.resetProgress();
                setConfirmReset(false);
                setResetNotice(true);
              }}
            >
              Reset demo progress
            </button>
          </div>
        ) : (
          <button
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
          <p role="status" className="green-text">
            Demo progress restored.
          </p>
        )}
      </section>
    </div>
  );
}
