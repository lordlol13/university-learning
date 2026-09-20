"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, GraduationCap, Sprout } from "lucide-react";
import { program, getDirectionLessons } from "@/data/curriculum";
import { useProgress, useProgressReady } from "@/stores/progress-provider";
import { getDirectionProgress } from "@/stores/progress-store";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LearningWorld } from "./LearningWorld";
import type { Direction } from "@/types/curriculum";

export function DirectionView({ direction }: { direction: Direction }) {
  const state = useProgress((s) => s);
  const setCurrentDirection = useProgress((s) => s.setCurrentDirection);
  const hydrated = useProgressReady();
  useEffect(() => {
    if (hydrated) setCurrentDirection(direction.id);
  }, [direction.id, setCurrentDirection, hydrated]);
  const progress = getDirectionProgress(direction.id, state);
  const available = getDirectionLessons(direction).length > 0;
  return (
    <div className="direction-view">
      <div className="breadcrumb">
        <Link href="/courses">My learning</Link>
        <ChevronRight size={13} />
        <span>{program.title}</span>
      </div>
      <section className="direction-banner">
        <div className="direction-icon">
          <CurriculumIcon name={direction.icon} size={36} />
        </div>
        <div className="direction-title">
          <span className="eyebrow">YOUR LEARNING PATH</span>
          <h1>{direction.title}</h1>
          <p>{direction.description}</p>
        </div>
        {available && (
          <div className="banner-progress">
            <div>
              <strong>
                {progress.completed}
                <span> / {progress.total} lessons</span>
              </strong>
              <b>{progress.percent}%</b>
            </div>
            <ProgressBar
              value={progress.percent}
              label={`${direction.title} completion`}
            />
          </div>
        )}
      </section>
      <div className="course-meta">
        <span>
          <GraduationCap size={15} />
          {program.qualification}
        </span>
        <span className="meta-dot" />
        <span>
          {direction.subjects[0]?.title ?? "Curriculum in preparation"}
        </span>
      </div>
      {available ? (
        <LearningWorld key={direction.id} direction={direction} />
      ) : (
        <section className="empty-state panel-card">
          <span className="empty-icon">
            <Sprout size={38} />
          </span>
          <span className="eyebrow">ROOM TO GROW</span>
          <h2>A new path is taking shape.</h2>
          <p>
            The {direction.title} curriculum is coming soon. Keep building your
            foundations with AI & Machine Learning.
          </p>
          <Link href="/path/ai-ml" className="button primary">
            <ArrowLeft size={17} />
            Explore the AI & ML path
          </Link>
        </section>
      )}
    </div>
  );
}
