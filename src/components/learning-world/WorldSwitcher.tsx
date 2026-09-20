"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { directions } from "@/data/curriculum";
import { learningWorlds } from "@/data/learning-world";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";
import { useProgress } from "@/stores/progress-provider";
import { getDirectionProgress } from "@/stores/progress-store";
import type { Direction } from "@/types/curriculum";

export function WorldSwitcher({
  currentDirectionId,
}: {
  currentDirectionId: string;
}) {
  const router = useRouter();
  const state = useProgress((s) => s);

  // Filter to directions that have active 3D learning worlds
  const availableWorlds: Direction[] = directions.filter((d) =>
    learningWorlds.some((w) => w.directionId === d.id),
  );

  const currentIndex = availableWorlds.findIndex(
    (w) => w.id === currentDirectionId,
  );
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  const prevIndex =
    (activeIndex - 1 + availableWorlds.length) % availableWorlds.length;
  const nextIndex = (activeIndex + 1) % availableWorlds.length;

  const prevWorld = availableWorlds[prevIndex];
  const nextWorld = availableWorlds[nextIndex];

  const navigateToWorld = useCallback(
    (directionId: string) => {
      if (directionId !== currentDirectionId) {
        router.push(`/path/${directionId}`);
      }
    },
    [currentDirectionId, router],
  );

  // Keyboard navigation: ArrowLeft and ArrowRight flip through worlds
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if student is in an input, textarea, or dialog
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("dialog"))
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigateToWorld(prevWorld.id);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateToWorld(nextWorld.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevWorld.id, nextWorld.id, navigateToWorld]);

  return (
    <div className="world-switcher-container" aria-label="World selection carousel">
      {/* Edge Flip Button: Left / Previous */}
      <button
        type="button"
        className="world-flip-edge prev"
        onClick={() => navigateToWorld(prevWorld.id)}
        aria-label={`Previous world: ${prevWorld.title} (Press Left Arrow)`}
        title={`Previous world: ${prevWorld.title} (← key)`}
      >
        <span className="flip-icon-wrap">
          <ChevronLeft size={24} />
        </span>
        <span className="flip-preview">
          <small>PREVIOUS</small>
          <strong>{prevWorld.shortTitle}</strong>
        </span>
      </button>

      {/* Top Floating Pill Carousel */}
      <div className="world-pills-bar" role="tablist" aria-label="Available worlds">
        {availableWorlds.map((world) => {
          const isActive = world.id === currentDirectionId;
          const prog = getDirectionProgress(world.id, state);
          return (
            <button
              key={world.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`world-pill ${isActive ? "is-active" : ""}`}
              onClick={() => navigateToWorld(world.id)}
            >
              <span className="world-pill-icon">
                <CurriculumIcon name={world.icon} size={16} />
              </span>
              <span className="world-pill-title">{world.shortTitle}</span>
              <span className="world-pill-badge">
                {prog.completed}/{prog.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Edge Flip Button: Right / Next */}
      <button
        type="button"
        className="world-flip-edge next"
        onClick={() => navigateToWorld(nextWorld.id)}
        aria-label={`Next world: ${nextWorld.title} (Press Right Arrow)`}
        title={`Next world: ${nextWorld.title} (→ key)`}
      >
        <span className="flip-preview">
          <small>NEXT</small>
          <strong>{nextWorld.shortTitle}</strong>
        </span>
        <span className="flip-icon-wrap">
          <ChevronRight size={24} />
        </span>
      </button>
    </div>
  );
}
