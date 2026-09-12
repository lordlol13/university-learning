"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Flame, Gem, Menu, Search, Trophy, X } from "lucide-react";
import { allLessons, directions } from "@/data/curriculum";
import { learner } from "@/data/demo";
import { useProgress } from "@/stores/progress-provider";
import { CurriculumIcon } from "@/components/ui/CurriculumIcon";

export function TopBar({
  onMenuClick,
  menuOpen,
}: {
  onMenuClick: () => void;
  menuOpen: boolean;
}) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const streak = useProgress((s) => s.streak);
  const xp = useProgress((s) => s.xp);
  const earned = useProgress((s) => s.achievements.length);
  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? [
        ...directions
          .filter((d) => d.title.toLowerCase().includes(normalized))
          .map((d) => ({
            id: `direction-${d.id}`,
            title: d.title,
            href: `/path/${d.id}`,
            icon: d.icon,
            type: "Direction",
          })),
        ...allLessons
          .filter((l) =>
            `${l.title} ${l.description}`.toLowerCase().includes(normalized),
          )
          .map((l) => ({
            id: l.id,
            title: l.title,
            href: `/lesson/${l.id}`,
            icon: l.icon,
            type: "Lesson",
          })),
      ].slice(0, 7)
    : [];
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <header className="topbar">
      <button
        className="icon-button menu-toggle"
        onClick={onMenuClick}
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
      >
        <Menu size={22} />
      </button>
      <div
        className="search-wrap"
        ref={wrapper}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setSearchOpen(false);
        }}
      >
        <div className="search-field">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search courses, lessons, or skills"
            placeholder="Search courses, topics, or skills..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearchOpen(false);
            }}
          />
          {query && (
            <button
              className="search-clear"
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchOpen && normalized && (
          <div className="search-results">
            <div className="eyebrow" role="status">
              {results.length ? "SEARCH RESULTS" : "NO RESULTS FOUND"}
            </div>
            {results.length ? (
              results.map((result) => (
                <Link
                  href={result.href}
                  key={result.id}
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                  }}
                >
                  <CurriculumIcon name={result.icon} size={20} />
                  <span>
                    {result.title}
                    <small>{result.type}</small>
                  </span>
                </Link>
              ))
            ) : (
              <p>Try “Python”, “data”, or “AI”.</p>
            )}
          </div>
        )}
      </div>
      <div className="top-stats">
        <Link
          className="top-stat streak-stat"
          href="/profile"
          aria-label={`${streak} day streak`}
        >
          <Flame size={23} />
          <strong>{streak}</strong>
          <span>day streak</span>
        </Link>
        <Link
          className="top-stat xp-stat"
          href="/profile"
          aria-label={`${xp} XP`}
        >
          <Gem size={22} />
          <strong>{xp}</strong>
          <span>XP</span>
        </Link>
        <Link
          className="top-stat trophy-stat"
          href="/achievements"
          aria-label={`${earned} achievements earned`}
        >
          <Trophy size={22} />
          <strong>{earned}</strong>
        </Link>
        <div className="topbar-divider" />
        <Link
          href="/profile"
          className="avatar"
          aria-label={`${learner.name}'s profile`}
        >
          {learner.initials}
        </Link>
      </div>
    </header>
  );
}
