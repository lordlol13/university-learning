"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";
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

  const prevWorld = availableWorlds[prevIndex] ?? availableWorlds[0];
  const nextWorld = availableWorlds[nextIndex] ?? availableWorlds[0];

  const navigateTo = useCallback(
    (directionId: string) => {
      router.push(`/path/${directionId}`);
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`/path/${directionId}`);
      }
    },
    [router],
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
        navigateTo(prevWorld.id);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateTo(nextWorld.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevWorld.id, nextWorld.id, navigateTo]);

  if (availableWorlds.length <= 1) return null;

  return (
    <div className="world-switcher-container" aria-label="3D Islands Navigation">
      {/* Prominent Left Navigation Link: Previous Island */}
      <Link
        href={`/path/${prevWorld.id}`}
        className="world-nav-card world-nav-prev"
        onClick={(e) => {
          e.preventDefault();
          navigateTo(prevWorld.id);
        }}
        aria-label={`Go to previous island: ${prevWorld.title} (Left Arrow)`}
        title={`Previous island: ${prevWorld.title} (Press ←)`}
      >
        <div className="world-nav-arrow-circle">
          <ChevronLeft size={26} strokeWidth={2.4} />
        </div>
        <div className="world-nav-content">
          <span className="world-nav-subtext">
            <span>← PREVIOUS ISLAND</span>
            <kbd className="world-nav-kbd">←</kbd>
          </span>
          <div className="world-nav-title-row">
            <CurriculumIcon name={prevWorld.icon} size={17} />
            <strong className="world-nav-name">{prevWorld.shortTitle}</strong>
          </div>
        </div>
      </Link>

      {/* Top Island Bar: All 4 active 3D learning worlds */}
      <div className="world-islands-bar" role="tablist" aria-label="Campus 3D Islands">
        <div className="world-islands-header">
          <span className="world-islands-eyebrow">
            <Compass size={13} />
            CAMPUS ISLANDS ({activeIndex + 1}/{availableWorlds.length})
          </span>
        </div>
        <div className="world-islands-tabs">
          {availableWorlds.map((world) => {
            const isActive = world.id === currentDirectionId;
            const prog = getDirectionProgress(world.id, state);
            return (
              <Link
                key={world.id}
                href={`/path/${world.id}`}
                role="tab"
                aria-selected={isActive}
                className={`world-island-tab ${isActive ? "is-active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(world.id);
                }}
                title={`Go to ${world.title}`}
              >
                <span className="world-island-tab-icon">
                  <CurriculumIcon name={world.icon} size={17} />
                </span>
                <span className="world-island-tab-title">{world.shortTitle}</span>
                <span className="world-island-tab-badge" suppressHydrationWarning>
                  {prog.completed}/{prog.total}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Prominent Right Navigation Link: Next Island */}
      <Link
        href={`/path/${nextWorld.id}`}
        className="world-nav-card world-nav-next"
        onClick={(e) => {
          e.preventDefault();
          navigateTo(nextWorld.id);
        }}
        aria-label={`Go to next island: ${nextWorld.title} (Right Arrow)`}
        title={`Next island: ${nextWorld.title} (Press →)`}
      >
        <div className="world-nav-content world-nav-content-right">
          <span className="world-nav-subtext">
            <span>NEXT ISLAND →</span>
            <kbd className="world-nav-kbd">→</kbd>
          </span>
          <div className="world-nav-title-row">
            <strong className="world-nav-name">{nextWorld.shortTitle}</strong>
            <CurriculumIcon name={nextWorld.icon} size={17} />
          </div>
        </div>
        <div className="world-nav-arrow-circle">
          <ChevronRight size={26} strokeWidth={2.4} />
        </div>
      </Link>
    </div>
  );
}
