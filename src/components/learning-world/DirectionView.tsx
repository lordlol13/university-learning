"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
import { getDirectionLessons } from "@/data/curriculum";
import { useProgress, useProgressReady } from "@/stores/progress-provider";
import { LearningWorld } from "./LearningWorld";
import type { Direction } from "@/types/curriculum";

export function DirectionView({ direction }: { direction: Direction }) {
  const setCurrentDirection = useProgress((s) => s.setCurrentDirection);
  const hydrated = useProgressReady();
  useEffect(() => {
    if (hydrated) setCurrentDirection(direction.id);
  }, [direction.id, setCurrentDirection, hydrated]);
  const available = getDirectionLessons(direction).length > 0;
  return (
    <div className="direction-view uplift-direction-view">
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
