"use client";

import { BookOpen, Flag } from "lucide-react";
import { getDirectionLessons } from "@/data/curriculum";
import { LearningPath } from "./LearningPath";
import type { Direction } from "@/types/curriculum";

/** Fixed world region with a DOM fallback; no raster map, pseudo-3D, or Canvas yet.
 * A lazily loaded R3F scene will occupy data-slot="world-canvas" in phase two.
 */
export function LearningWorld({ direction }: { direction: Direction }) {
  const lessons = getDirectionLessons(direction);
  const unit = direction.subjects[0]?.units[0];
  return (
    <section className="learning-world" aria-label="Learning journey">
      <div
        className="world-canvas-slot"
        data-slot="world-canvas"
        aria-hidden="true"
      />
      <div className="world-content">
        <div className="world-heading">
          <div>
            <span className="eyebrow">UNIT 01</span>
            <h2>{unit?.title ?? "Your next chapter"}</h2>
          </div>
          <span className="world-unit-tag">
            <BookOpen size={14} />
            {lessons.length} lessons
          </span>
        </div>
        <LearningPath lessons={lessons} />
        <div className="path-finish">
          <span>
            <Flag size={16} />
          </span>
          <p>Great things start with strong foundations.</p>
        </div>
      </div>
    </section>
  );
}
