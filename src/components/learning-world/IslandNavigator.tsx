"use client";

import Link from "next/link";
import { directions, getDirectionLessons } from "@/data/curriculum";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import { useProgress } from "@/stores/progress-provider";
import { playChime, getSoundPreference } from "@/lib/island-audio";

export function IslandNavigator({
  currentDirectionId,
}: {
  currentDirectionId?: string;
}) {
  const completedLessons = useProgress((s) => s.completedLessons);
  const activeTracks = directions.filter(
    (d) => getDirectionLessons(d).length > 0,
  );

  const handleClick = (directionId: string) => {
    if (directionId !== currentDirectionId) {
      playChime(getSoundPreference(), false);
    }
  };

  return (
    <nav
      className="island-navigator track-nav"
      aria-label="Campus academic tracks"
      role="navigation"
    >
      <div className="island-navigator-inner">
        {activeTracks.map((track) => {
          const trackLessons = getDirectionLessons(track);
          const completedCount = trackLessons.filter((l) =>
            completedLessons.includes(l.id),
          ).length;
          const isActive =
            track.id === currentDirectionId ||
            (track.id === "italian-language" &&
              currentDirectionId === "italian-culture");

          return (
            <Link
              key={track.id}
              href={`/path/${track.id}`}
              onClick={() => handleClick(track.id)}
              className="campus-button track-nav-item"
              data-active={isActive}
              data-track={track.id}
              aria-label={`${track.title}: ${completedCount} of ${trackLessons.length} lessons completed`}
              aria-pressed={isActive}
            >
              <div className="campus-button-icon">
                <CurriculumIcon name={track.icon} size={20} />
              </div>
              <div className="campus-button-info">
                <span className="track-label">{track.shortTitle ?? track.title}</span>
                <span className="track-progress">
                  {completedCount}/{trackLessons.length} completed
                </span>
                <span className="mini-progress" aria-hidden="true">
                  {trackLessons.map((lesson) => (
                    <i
                      key={lesson.id}
                      className={
                        completedLessons.includes(lesson.id) ? "done" : ""
                      }
                      title={lesson.title}
                    />
                  ))}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default IslandNavigator;
