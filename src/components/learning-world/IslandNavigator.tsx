"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { directions } from "@/data/curriculum";
import { learningWorlds } from "@/data/learning-world";
import type { Direction } from "@/types/curriculum";

export function IslandNavigator({
  currentDirectionId,
}: {
  currentDirectionId: string;
}) {
  const router = useRouter();

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
    },
    [router],
  );

  // Keyboard navigation: ArrowLeft and ArrowRight flip through worlds
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
    <div className="world-switcher-container" aria-label="Campus Islands Navigation">
      {/* Pure Left Arrow Button: Zero Text */}
      <Link
        href={`/path/${prevWorld.id}`}
        className="world-nav-arrow-btn world-nav-prev"
        onClick={(e) => {
          e.preventDefault();
          navigateTo(prevWorld.id);
        }}
        aria-label={`Previous island: ${prevWorld.title}`}
        title={`Previous island: ${prevWorld.title}`}
      >
        <ChevronLeft size={32} strokeWidth={2.8} />
      </Link>

      {/* Pure Right Arrow Button: Zero Text */}
      <Link
        href={`/path/${nextWorld.id}`}
        className="world-nav-arrow-btn world-nav-next"
        onClick={(e) => {
          e.preventDefault();
          navigateTo(nextWorld.id);
        }}
        aria-label={`Next island: ${nextWorld.title}`}
        title={`Next island: ${nextWorld.title}`}
      >
        <ChevronRight size={32} strokeWidth={2.8} />
      </Link>
    </div>
  );
}
