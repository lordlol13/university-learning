"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Clock,
  Compass,
  GraduationCap,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  directions,
  getDirectionLessons,
  program,
  university,
} from "@/data/curriculum";
import type { Direction, Lesson } from "@/types/curriculum";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useProgress } from "@/stores/progress-provider";
import { getDirectionProgress } from "@/stores/progress-store";

const subjectColorClass: Record<string, string> = {
  "ai-ml": "subject-ai",
  "physics-engineering": "subject-physics",
  mathematics: "subject-math",
  "italian-language": "subject-italian",
  "italian-culture": "subject-italian",
};

type TrackFilter =
  | "all"
  | "ai-ml"
  | "physics-engineering"
  | "mathematics"
  | "italian-language";

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

type StatusFilter = "all" | "in-progress" | "completed";

const DIRECTION_DIFFICULTIES: Record<
  string,
  ("beginner" | "intermediate" | "advanced")[]
> = {
  "ai-ml": ["intermediate", "advanced"],
  "physics-engineering": ["intermediate", "advanced"],
  mathematics: ["beginner", "intermediate"],
  "italian-language": ["beginner"],
  "italian-culture": ["beginner"],
};

export function CoursesView() {
  const completedLessons = useProgress((s) => s.completedLessons);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const isFiltered =
    searchQuery.trim().length > 0 ||
    trackFilter !== "all" ||
    difficultyFilter !== "all" ||
    statusFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setTrackFilter("all");
    setDifficultyFilter("all");
    setStatusFilter("all");
  };

  const filteredDirections = useMemo(() => {
    return directions.filter((direction: Direction) => {
      const lessons = getDirectionLessons(direction);
      const progress = getDirectionProgress(direction.id, {
        completedLessons,
      });

      // 1. Track / Direction filter
      if (trackFilter !== "all") {
        if (trackFilter === "italian-language") {
          if (
            direction.id !== "italian-language" &&
            direction.id !== "italian-culture"
          ) {
            return false;
          }
        } else if (direction.id !== trackFilter) {
          return false;
        }
      }

      // 2. Difficulty filter
      if (difficultyFilter !== "all") {
        const allowed = DIRECTION_DIFFICULTIES[direction.id] ?? [];
        if (!allowed.includes(difficultyFilter)) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter === "in-progress") {
        if (progress.completed === 0 || progress.completed === progress.total) {
          return false;
        }
      } else if (statusFilter === "completed") {
        if (progress.completed === 0 || progress.completed < progress.total) {
          return false;
        }
      }

      // 4. Search query filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = direction.title.toLowerCase().includes(query);
        const matchesShort = direction.shortTitle.toLowerCase().includes(query);
        const matchesDesc = direction.description.toLowerCase().includes(query);
        const matchesLesson = lessons.some(
          (l: Lesson) =>
            l.title.toLowerCase().includes(query) ||
            l.description.toLowerCase().includes(query) ||
            l.id.toLowerCase().includes(query),
        );
        if (!matchesTitle && !matchesShort && !matchesDesc && !matchesLesson) {
          return false;
        }
      }

      return true;
    });
  }, [
    completedLessons,
    trackFilter,
    difficultyFilter,
    statusFilter,
    searchQuery,
  ]);

  return (
    <div className="standard-page courses-page">
      <div className="page-heading page-heading-split">
        <div>
          <span className="eyebrow">ACADEMIC CATALOGUE · 3D ISLAND TRACKS</span>
          <h1>Made for curious minds.</h1>
          <p>
            Explore your university directions, master core concepts, and
            unlock interactive 3D campus worlds.
          </p>
        </div>
      </div>

      <div className="program-strip">
        <div className="program-strip-icon">
          <GraduationCap size={26} />
        </div>
        <div className="program-strip-copy">
          <span className="eyebrow">ACCREDITED UNIVERSITY PROGRAM</span>
          <strong>{program.title}</strong>
          <p>
            {university.name} ({university.shortName}) · {program.qualification}
          </p>
        </div>
        <span className="program-verified-pill">
          <BadgeCheck size={15} />
          Verified Curriculum
        </span>
      </div>

      {/* Courses Filtering Controls */}
      <section className="courses-controls panel-card" aria-label="Course filters">
        <div className="courses-search-row">
          <div className="courses-search-field">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by title, topic, or keyword..."
              aria-label="Search courses"
            />
            {searchQuery && (
              <button
                type="button"
                className="courses-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {isFiltered && (
            <button
              type="button"
              className="btn-clear-filters"
              onClick={clearAllFilters}
            >
              <RotateCcw size={14} /> Clear all filters
            </button>
          )}
        </div>

        <div className="courses-filter-groups">
          {/* Direction / Track Filter */}
          <div className="filter-group">
            <span className="filter-group-label">Campus Track:</span>
            <div className="course-filter-tabs" role="tablist" aria-label="Filter by track">
              <button
                type="button"
                role="tab"
                aria-selected={trackFilter === "all"}
                className={`filter-tab ${trackFilter === "all" ? "active" : ""}`}
                onClick={() => setTrackFilter("all")}
              >
                All Tracks
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={trackFilter === "ai-ml"}
                className={`filter-tab ${trackFilter === "ai-ml" ? "active" : ""}`}
                onClick={() => setTrackFilter("ai-ml")}
              >
                AI & ML
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={trackFilter === "physics-engineering"}
                className={`filter-tab ${trackFilter === "physics-engineering" ? "active" : ""}`}
                onClick={() => setTrackFilter("physics-engineering")}
              >
                Physics
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={trackFilter === "mathematics"}
                className={`filter-tab ${trackFilter === "mathematics" ? "active" : ""}`}
                onClick={() => setTrackFilter("mathematics")}
              >
                Mathematics
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={trackFilter === "italian-language"}
                className={`filter-tab ${trackFilter === "italian-language" ? "active" : ""}`}
                onClick={() => setTrackFilter("italian-language")}
              >
                Italian
              </button>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="filter-group">
            <span className="filter-group-label">Difficulty:</span>
            <div className="course-filter-tabs" role="tablist" aria-label="Filter by difficulty">
              <button
                type="button"
                role="tab"
                aria-selected={difficultyFilter === "all"}
                className={`filter-tab ${difficultyFilter === "all" ? "active" : ""}`}
                onClick={() => setDifficultyFilter("all")}
              >
                All Levels
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={difficultyFilter === "beginner"}
                className={`filter-tab ${difficultyFilter === "beginner" ? "active" : ""}`}
                onClick={() => setDifficultyFilter("beginner")}
              >
                Beginner
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={difficultyFilter === "intermediate"}
                className={`filter-tab ${difficultyFilter === "intermediate" ? "active" : ""}`}
                onClick={() => setDifficultyFilter("intermediate")}
              >
                Intermediate
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={difficultyFilter === "advanced"}
                className={`filter-tab ${difficultyFilter === "advanced" ? "active" : ""}`}
                onClick={() => setDifficultyFilter("advanced")}
              >
                Advanced
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <span className="filter-group-label">Status:</span>
            <div className="course-filter-tabs" role="tablist" aria-label="Filter by status">
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "all"}
                className={`filter-tab ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All Status
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "in-progress"}
                className={`filter-tab ${statusFilter === "in-progress" ? "active" : ""}`}
                onClick={() => setStatusFilter("in-progress")}
              >
                In Progress
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "completed"}
                className={`filter-tab ${statusFilter === "completed" ? "active" : ""}`}
                onClick={() => setStatusFilter("completed")}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="section-heading">
        <h2>Campus directions</h2>
        <span>{filteredDirections.length} {filteredDirections.length === 1 ? "path" : "paths"} shown</span>
      </div>

      {filteredDirections.length === 0 ? (
        <div className="empty-state" role="status">
          <div className="empty-icon">
            <BookOpen size={36} />
          </div>
          <h3>No courses match your criteria</h3>
          <p>
            Try refining your search keyword or clearing the active filters to explore
            all available campus directions.
          </p>
          <button
            type="button"
            className="button secondary"
            onClick={clearAllFilters}
          >
            <RotateCcw size={15} /> Clear filters
          </button>
        </div>
      ) : (
        <div className="course-grid">
          {filteredDirections.map((direction: Direction) => {
            const lessons = getDirectionLessons(direction);
            const count = lessons.length;
            const totalXp = lessons.reduce(
              (acc: number, l: Lesson) => acc + l.xp,
              0,
            );
            const totalMinutes = lessons.reduce(
              (acc: number, l: Lesson) => acc + (l.durationMinutes ?? 10),
              0,
            );
            const progress = getDirectionProgress(direction.id, {
              completedLessons,
            });
            const colorClass = subjectColorClass[direction.id] ?? "subject-ai";

            return (
              <Link
                href={`/path/${direction.id}`}
                className={`course-card ${count ? "available" : ""} ${colorClass}`}
                key={direction.id}
              >
                <div className="course-card-accent-bar" aria-hidden="true" />
                <div className="course-card-top">
                  <span className="course-card-icon">
                    <CurriculumIcon name={direction.icon} size={28} />
                  </span>
                  <span className={`tiny-pill ${count ? "" : "neutral"}`}>
                    {count ? (
                      <>
                        <Sparkles size={12} /> 3D Island Live
                      </>
                    ) : (
                      "Coming soon"
                    )}
                  </span>
                </div>

                <h2>{direction.title}</h2>
                <p>{direction.description}</p>

                {count > 0 ? (
                  <>
                    <div className="course-unit-chips">
                      {lessons.slice(0, 3).map((lesson: Lesson) => (
                        <span key={lesson.id} className="course-unit-chip">
                          {lesson.title}
                        </span>
                      ))}
                      {count > 3 && (
                        <span className="course-unit-chip muted">
                          +{count - 3} more
                        </span>
                      )}
                    </div>

                    <div className="course-card-meta-row">
                      <span>
                        <BookOpen size={13} /> {count} lessons
                      </span>
                      <span>
                        <Clock size={13} /> ~{totalMinutes} min
                      </span>
                      <span>
                        <Star size={13} /> {totalXp} XP
                      </span>
                    </div>

                    <div className="course-card-progress">
                      <span>
                        {progress.completed} / {progress.total} completed
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
                    <span>
                      Interactive 3D island & faculty modules in preparation
                    </span>
                  </div>
                )}

                <span className="course-card-link">
                  <span>
                    {count ? (
                      <>
                        <Compass size={15} /> Enter 3D Island Path
                      </>
                    ) : (
                      "Preview direction"
                    )}
                  </span>
                  <ArrowRight size={17} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
