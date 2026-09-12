"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import {
  directions,
  getDirectionLessons,
  program,
  university,
} from "@/data/curriculum";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useProgress } from "@/stores/progress-provider";
import { getDirectionProgress } from "@/stores/progress-store";

export function CoursesView() {
  const state = useProgress((s) => s);
  return (
    <div className="standard-page">
      <div className="page-heading">
        <span className="eyebrow">FIND YOUR NEXT CHAPTER</span>
        <h1>Made for curious minds.</h1>
        <p>Explore your directions. Build a future that feels like you.</p>
      </div>
      <div className="program-strip">
        <GraduationCap size={25} />
        <div>
          <strong>{program.title}</strong>
          <p>
            {university.shortName} · {program.qualification}
          </p>
        </div>
      </div>
      <div className="section-heading">
        <h2>All directions</h2>
        <span>{directions.length} paths to explore</span>
      </div>
      <div className="course-grid">
        {directions.map((direction) => {
          const count = getDirectionLessons(direction).length;
          const progress = getDirectionProgress(direction.id, state);
          return (
            <Link
              href={`/path/${direction.id}`}
              className={`course-card ${count ? "available" : ""}`}
              key={direction.id}
            >
              <div className="course-card-top">
                <span className="course-card-icon">
                  <CurriculumIcon name={direction.icon} size={29} />
                </span>
                <span className={`tiny-pill ${count ? "" : "neutral"}`}>
                  {count ? "Ready to learn" : "Coming soon"}
                </span>
              </div>
              <h2>{direction.title}</h2>
              <p>{direction.description}</p>
              {count ? (
                <>
                  <div className="course-card-progress">
                    <span>
                      {progress.completed} / {progress.total} lessons
                    </span>
                    <strong>{progress.percent}%</strong>
                  </div>
                  <ProgressBar
                    value={progress.percent}
                    label={`${direction.title} progress`}
                  />
                </>
              ) : (
                <div className="course-coming">
                  <BookOpen size={15} />
                  Curriculum in preparation
                </div>
              )}
              <span className="course-card-link">
                {count ? "Explore your path" : "View direction"}
                <ArrowRight size={17} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
