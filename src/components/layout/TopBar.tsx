"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Flame,
  Gem,
  Menu,
  Search,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { allLessons, directions, getDirectionLessons } from "@/data/curriculum";
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapper = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streak = useProgress((s) => s.streak);
  const xp = useProgress((s) => s.xp);
  const level = useProgress((s) => s.level);
  const earned = useProgress((s) => s.achievements.length);

  const [prevQuery, setPrevQuery] = useState(query);
  const [prevSearchOpen, setPrevSearchOpen] = useState(searchOpen);
  if (prevQuery !== query || prevSearchOpen !== searchOpen) {
    setPrevQuery(query);
    setPrevSearchOpen(searchOpen);
    setSelectedIndex(-1);
  }

  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? [
        ...directions
          .filter(
            (d) =>
              d.title.toLowerCase().includes(normalized) ||
              d.description.toLowerCase().includes(normalized),
          )
          .map((d) => ({
            id: `direction-${d.id}`,
            title: d.title,
            meta: `${getDirectionLessons(d).length} lessons · 3D Island Path`,
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
            meta: `${l.durationMinutes} min · +${l.xp} XP`,
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button menu-toggle"
          onClick={onMenuClick}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
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
            <Search size={17} aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={searchOpen && Boolean(normalized)}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-controls="campus-search-results"
              aria-activedescendant={
                selectedIndex >= 0 && results[selectedIndex]
                  ? `search-item-${selectedIndex}`
                  : undefined
              }
              aria-label="Search courses, lessons, or skills"
              placeholder="Search tracks, lessons, or topics..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchOpen(false);
                } else if (event.key === "ArrowDown") {
                  event.preventDefault();
                  if (!searchOpen) setSearchOpen(true);
                  if (results.length > 0) {
                    setSelectedIndex((prev) =>
                      prev < results.length - 1 ? prev + 1 : 0
                    );
                  }
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  if (results.length > 0) {
                    setSelectedIndex((prev) =>
                      prev > 0 ? prev - 1 : results.length - 1
                    );
                  }
                } else if (event.key === "Enter") {
                  if (selectedIndex >= 0 && results[selectedIndex]) {
                    event.preventDefault();
                    const target = results[selectedIndex];
                    setSearchOpen(false);
                    setQuery("");
                    router.push(target.href);
                  }
                }
              }}
            />
            {query ? (
              <button
                className="search-clear"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            ) : (
              <kbd className="search-kbd" aria-hidden="true">
                /
              </kbd>
            )}
          </div>
          {searchOpen && normalized && (
            <div
              id="campus-search-results"
              role="listbox"
              aria-label="Campus search results"
              className="search-results"
            >
              <div className="eyebrow" role="status">
                {results.length ? "CAMPUS SEARCH RESULTS" : "NO RESULTS FOUND"}
              </div>
              {results.length ? (
                results.map((result, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <Link
                      href={result.href}
                      key={result.id}
                      id={`search-item-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      className={isSelected ? "active" : undefined}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery("");
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span className="search-result-icon">
                        <CurriculumIcon name={result.icon} size={18} />
                      </span>
                      <span className="search-result-body">
                        <strong>{result.title}</strong>
                        <small>{result.meta}</small>
                      </span>
                      <span className="search-result-tag">{result.type}</span>
                      <ArrowUpRight size={14} className="search-result-arrow" />
                    </Link>
                  );
                })
              ) : (
                <div className="search-empty-suggestions">
                  <p>No matches for “{query}”. Try a popular topic:</p>
                  <div className="search-suggestion-chips">
                    {["Python", "Calculus", "Vectors", "Italian"].map(
                      (term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            setSearchOpen(true);
                            inputRef.current?.focus();
                          }}
                        >
                          {term}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="top-stats" suppressHydrationWarning>
        <Link
          className="top-stat streak-stat"
          href="/profile"
          aria-label={`${streak ?? 0} day streak`}
        >
          <Flame size={18} />
          <strong>{streak ?? 0}</strong>
          <span>day streak</span>
        </Link>
        <Link
          className="top-stat xp-stat"
          href="/profile"
          aria-label={`${xp ?? 0} XP`}
        >
          <Gem size={17} />
          <strong key={xp} className="xp-value">
            {(xp ?? 0).toLocaleString()}
          </strong>
          <span>XP</span>
        </Link>
        <Link
          className="top-stat level-stat"
          href="/profile"
          aria-label={`Level ${level ?? 1}`}
        >
          <Sparkles size={16} />
          <strong>Lvl {level ?? 1}</strong>
        </Link>
        <Link
          className="top-stat trophy-stat"
          href="/achievements"
          aria-label={`${earned ?? 0} achievements earned`}
        >
          <Trophy size={17} />
          <strong>{earned ?? 0}</strong>
        </Link>
        <div className="topbar-divider" />
        <Link
          href="/profile"
          className="topbar-profile-pill"
          aria-label={`${learner.name}'s profile`}
        >
          <span className="avatar">{learner.initials}</span>
          <span className="topbar-profile-text">
            <strong>{learner.firstName}</strong>
            <small>Level {level ?? 1}</small>
          </span>
        </Link>
      </div>
    </header>
  );
}
